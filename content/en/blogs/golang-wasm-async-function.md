---
title: "Golang WASM Async Function"
date: 2022-03-13T00:00:14+07:00
draft: false 
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #8 golang WASM async function"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #8 golang WASM async function" >}}

```go
package main

import (
	"fmt"
	"syscall/js"
)

type fn func(this js.Value, args []js.Value) (any, error)

var (
	jsErr     js.Value = js.Global().Get("Error")
	jsPromise js.Value = js.Global().Get("Promise")
)

func asyncFunc(innerFunc fn) js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		handler := js.FuncOf(func(_ js.Value, promFn []js.Value) any {
			resolve, reject := promFn[0], promFn[1]

			go func() {
				defer func() {
					if r := recover(); r != nil {
						reject.Invoke(jsErr.New(fmt.Sprint("panic:", r)))
					}
				}()

				res, err := innerFunc(this, args)
				if err != nil {
					reject.Invoke(jsErr.New(err.Error()))
				} else {
					resolve.Invoke(res)
				}
			}()

			return nil
		})

		return jsPromise.New(handler)
	})
}

func argsEvenOdd(this js.Value, args []js.Value) (any, error) {
	if len(args)%2 == 0 {
		return nil, fmt.Errorf("#args is even")
	}
	return "#args is odd", nil
}

func main() {
	js.Global().Set("argsEvenOdd", asyncFunc(argsEvenOdd))
	select {}
}
```

Test it with

```javascript
argsEvenOdd(1, 2)
		.then(res => console.log(res)) 
		.catch(err => console.error(err)) // will be catched

argsEvenOdd(1)
		.then(res => console.log(res)) // will be logged
		.catch(err => console.error(err))
```