---
title: "Golang Print Struct Verbosely"
date: 2022-05-08T00:00:01+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #16 golang print struct verbosely"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #16 golang print struct verbosely" >}}

```go
package main

import (
	"fmt"
)

type Foo struct {
	bar Bar
}

type Bar struct {
	number int
	word   string
}

func NewFoo(number int, word string) *Foo {
	return &Foo{Bar{number, word}}
}

func main() {
	fmt.Printf("%+v", NewFoo(10, "testing"))
}
```

```shell
$ go run main.go
&{bar:{number:10 word:testing}}
```