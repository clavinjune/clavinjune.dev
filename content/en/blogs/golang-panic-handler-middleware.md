---
title: "Golang Panic Handler Middleware"
date: 2022-02-06T00:10:15+07:00
draft: false 
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #3 golang panic handler middleware"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #3 golang panic handler middleware" >}}

Handling panic elegantly:

```go {hl_lines=["15-27"]}
package main

import (
	"fmt"
	"log"
	"net/http"
)

func handle() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		panic("i am panic")
	}
}

func handlePanic(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if i := recover(); i != nil {
				log.Printf("panic at %s: %v", r.URL.Path, i)
				w.WriteHeader(http.StatusInternalServerError)
				fmt.Fprint(w, http.StatusText(http.StatusInternalServerError))
			}
		}()

		next(w, r)
	}
}

func main() {
	http.ListenAndServe(":8000", handlePanic(handle()))
}
```
