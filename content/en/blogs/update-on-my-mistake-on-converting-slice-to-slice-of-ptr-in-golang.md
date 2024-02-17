---
title: "Update on My Mistake on Converting Slice to Slice of Ptr in Golang"
date: 2024-02-17T14:00:00+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&q=50"]
aliases: []
description: "This post is an update related to golang for loop issue"
---

{{< unsplash user="@iavnt" src="photo-1513104890138-7c749659a591" q="50" >}}

Three years ago I wrote on how I wrongly implementing [slice to slice pointer converter](/blogs/my-mistake-on-converting-slice-to-slice-of-ptr-in-golang/). It was not trivial for me, not really sure whether it is related to how Go implement their for loop.

I'm trying to patch the previous article since Go just released their latest version (1.22.0) and have changes on how the language itself implementing for loop, you can check it out [here](https://tip.golang.org/doc/go1.22#language).

Now, if we try to implement our code from the [last article](/blogs/my-mistake-on-converting-slice-to-slice-of-ptr-in-golang/#my-function) using go1.22.0, we can see that the result is correct since they now no longer mutating the variable. The variable is not shared between each loop.

```go
package main

import "fmt"

func Slice2SliceOfPtr(slice []int) []*int {
	n := len(slice)
	r := make([]*int, n, n)

	for i, s := range slice {
		r[i] = &s
	}

	return r
}

func main() {
	x := []int{1, 2, 3}
	y := Slice2SliceOfPtr(x)

	fmt.Println(x)

	for _, yy := range y {
		fmt.Printf("%d ", *yy)
	}
}
```

Before go1.22.0:

```shell
$ go run main.go 
[1 2 3]
3 3 3
```

In go1.22.0:

```shell
$ go run main.go
[1 2 3]
1 2 3 
```

Thank you for reading!
