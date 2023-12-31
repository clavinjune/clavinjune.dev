---
title: "Golang Testing HTTP Handler"
date: 2023-12-31T19:52:21+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1508921340878-ba53e1f016ec?w=1920&q=50"]
aliases: []
description: "testing HTTP handler using httptest standard library"
---

{{< unsplash user="@bugsster" src="photo-1508921340878-ba53e1f016ec" q="50" >}}

## FaFiFu

> This section is a bullshittery, you can skip it to the [main section](#introduction)

It's been a year since my last blog post, 2023 is quite a year that makes me hard to spend time updating this blog. The thing is, going back working from the office take hours of productive hour. Going to the office preparation, commuting, chit-chat, snack time makes me less productive. Nah, that's maybe the me issue, just trying to blame others because it's easier :D. Just hoping that I will have enough time to update this blog more frequent in 2024. Enough of the chit-chat, let's go to the main section.

## Introduction

When you start working with Golang as a web server and developing some HTTP endpoints, you might want to test it as well. In Golang, in order to test the HTTP endpoints, it has a specific library called [httptest](https://pkg.go.dev/net/http/httptest). I also have created one blog post that highlight one specific use case of httptest related to mocking external HTTP call, you can read it [here](/blogs/mocking-http-call-in-golang-a-better-way/).

## Components

To create a unit test for testing HTTP endpoints, we can utilize [httptest.NewRecorder](https://pkg.go.dev/net/http/httptest#NewRecorder) and [httptest.NewRequest](https://pkg.go.dev/net/http/httptest#NewRequest). If you remember, golang basic [http.Handler](https://pkg.go.dev/net/http#Handler) looks like below:

```go
func FooHandler(w http.ResponseWriter, r *http.Request) {}
```

It needs both [http.ResponseWriter](https://pkg.go.dev/net/http#ResponseWriter) and [http.Request](https://pkg.go.dev/net/http#Request), which the value of both of them will be provided by [http.Server](https://pkg.go.dev/net/http#Server) whenever a new request is coming to the handler. In testing, instead of running an `http.Server` that will provide the value, you can fill the argument using `httptest.NewRecorder` and `httptest.NewRequest` functions return value since both of the function consecutively return `http.ResponseWriter` and `http.Request`.


## Code

Now let's go to the code. Let's say you have this handler that you want to test:

```go
package handler

import (
	"fmt"
	"net/http"
)

func RootHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "[%s] %s OK!", r.Method, r.URL.String())
}
```

It's quite a simple handler, let's create a test for `RootHandler`:

```go
package handler_test

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/clavinjune/example/handler"
)

func TestRootHandler(t *testing.T) {
	method := http.MethodPost
	endpoint := "/foo"

	w := httptest.NewRecorder()
	r := httptest.NewRequest(method, endpoint, http.NoBody)
	defer r.Body.Close()

	handler.RootHandler(w, r)
	defer w.Result().Body.Close()

	if w.Result().StatusCode != http.StatusOK {
		t.Fatalf("want: %03d, got: %03d", http.StatusOK, w.Result().StatusCode)
	}

	b, err := io.ReadAll(w.Result().Body)
	if err != nil {
		t.Fatalf("want: nil, got: %+q", err)
	}

	want := fmt.Sprintf(`[%s] %s OK!`, method, endpoint)
	got := string(b)

	if want != got {
		t.Fatalf("want: %+q, got: %+q", want, got)
	}
}
```

As you see the example above, we called `handler.RootHandler(w, r)` where the argument is filled by the `httptest.NewRecorder` and `http.NewRequest`. The recorder, will record whatever the response of the handler, you can read the body, status code, header, etc by only using `w.Result()`. Meanwhile the request will create a similar request like `http.NewRequest` with some hard-coded fields since `httptest.NewRequest` creates an incoming server request not like `http.NewRequest` that creates a client HTTP request which are usually used in `http.Client{}.Do` function, and that's it. Now you have the unit test for your HTTP handler.

Thank you for reading!
