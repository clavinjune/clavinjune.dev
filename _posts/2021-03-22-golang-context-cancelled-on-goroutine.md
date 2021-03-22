---
category: Notes
tags: golang context goroutine
description: >
  This post contains notes about request context behavior on goroutine.
---

Golang's request context is automatically be done when passed on goroutine, and its parents goroutine is already done.

```go
package main

import (
	"context"
	"log"
	"net/http"
	"time"
)

func foo(ctx context.Context) {
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	req, _ := http.NewRequestWithContext(ctx,
		http.MethodGet, "https://google.com", nil)

	_, err := http.DefaultClient.Do(req)

	log.Println(err) // Get "https://google.com": context canceled
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		go foo(r.Context())
	}) // context will be done when it reaches here

	http.ListenAndServe(":8888", nil)
}
```
