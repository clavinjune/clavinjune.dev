---
title: "Golang HTTP Client Interceptors"
date: 2021-10-29T05:09:38+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1592505633903-e77dc19978ac?w=1920&q=50"]
aliases: []
description: >
  Implementing interceptors for Golang HTTP Client
---

{{< unsplash user="@flowforfrank" src="photo-1592505633903-e77dc19978ac" q="50" >}}

## Introduction

Golang supports developers to create a great application with its solid and handful of built-in packages. One of them is HTTP Client. HTTP Client, just like its name, helps developers to create an HTTP Client that can make HTTP requests to other services. Golang even provides developers with its default client so, you don't need to create one. But sometimes, you need to create one that fits your usage.

For Example, you have a Golang application that needs to make requests to one service. That service has a defined standard of the HTTP request body. Let's say like this:

```javascript
{
  "aStandardWrapperRequired": {
    // your real request here
  }
}
```

Let's say you need to wrap all your hundreds of request bodies to fits the requirement. Usually, you may make a higher-order function that adjusts your body request to that requirement. But in this article, you will learn another way to handle that using an HTTP Interceptor.

Now let's simulate and create the server and client. All the codes below will require you to use at least Golang version 1.16.

## Initiate the Project

First thing first, let's create a simple project called interceptor.

> Please be aware that inside this project, all errors are ignored to simplify the code. You may not want to copy and paste all of this code into a production code. Please take it with a grain of salt.

```bash {linenos=false}
$ tree .
.
├── client
│   └── main.go
├── go.mod
├── json
│   └── json.go
└── server
    └── main.go

3 directories, 4 files
```

- `client` package is the main package that runs an HTTP client
- `json` package is a helper package
- `server` package is the main package that runs an HTTP server

## Create Helper Function

Inside the `json/json.go`, create a function that helps you read the request/response body and transform it to a readable string.

```go
package json

import (
  "encoding/json"
  "io"
)

func MustHumanize(r io.Reader) string {
  var m map[string]interface{}
  _ = json.NewDecoder(r).Decode(&m)
  b, _ := json.MarshalIndent(m, "", "  ")
  return string(b)
}
```

## Create the Server

Inside the `server/main.go`, create an HTTP Server that simply reflects the request of the client, and then send it back to them.

```go
package main

import (
  "fmt"
  "net/http"

  "interceptor/json"
)

func main() {
  _ = http.ListenAndServe(":8000", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    defer func() {
      _ = r.Body.Close()
    }()

    b := json.MustHumanize(r.Body)
    fmt.Println(b)

    w.WriteHeader(http.StatusOK)
    _, _ = fmt.Fprint(w, b)
  }))
}
```

## Create the Client

Now inside the `client/main.go`, let's make a request to the server using the default Golang HTTP client first.

```go
package main

import (
  "fmt"
  "net/http"
  "strings"

  "interceptor/json"
)

func main() {
  req, _ := http.NewRequest(
    http.MethodPost,
    "http://127.0.0.1:8000/",
    strings.NewReader(`{"data": "json"}`))

  c := http.DefaultClient

  resp, _ := c.Do(req)
  defer func() {
    _ = resp.Body.Close()
  }()

  b := json.MustHumanize(resp.Body)
  fmt.Println(b)
}
```

Now, if you run the server:

```bash {linenos=false}
$ go run server/main.go
```

And run the client:

```bash {linenos=false}
$ go run client/main.go
```

Both the server and the client will reflect this into the terminal:

```javascript
{
  "data": "json"
}
```

Now let's create the custom HTTP Client that will intercept our request to the server.

## Intercept the Client Request

Golang has this one interface called RoundTripper that is implemented by Golang as a DefaultTransport, which is called every time you make an HTTP Request using the DefaultClient. I advise you to **really** read the [docs](https://pkg.go.dev/net/http#RoundTripper) before implementing this RoundTripper.

```go {linenostart=12}
...

type Interceptor struct {
  core http.RoundTripper
}

func (Interceptor) modifyRequest(r *http.Request) *http.Request {
  reqBody := json.MustHumanize(r.Body)

  modReqBody := []byte(fmt.Sprintf(`{"req": %s}`, reqBody))
  ModReqBodyLen := len(modReqBody)

  req := r.Clone(context.Background())
  req.Body = io.NopCloser(bytes.NewReader(modReqBody))
  req.ContentLength = int64(ModReqBodyLen)
  req.Header.Set("Content-Length", fmt.Sprintf("%d", ModReqBodyLen))

  return req
}

func (i Interceptor) RoundTrip(r *http.Request) (*http.Response, error) {
  defer func() {
    _ = r.Body.Close()
  }()

  // modify before the request is sent
  newReq := i.modifyRequest(r)

  // send the request using the DefaultTransport
  return i.core.RoundTrip(newReq)
}

...
```

Now let's use the Interceptor inside the HTTP client.

Change this line inside `client/main.go`

```go {linenostart=48}
...

c := http.DefaultClient

...
```

into this:

```go {linenostart=48}
...

c := &http.Client{
  Transport: Interceptor{http.DefaultTransport},
}

...
```

Now if you try to re-run the client, the output should be like this:

```javascript
{
  "req": {
    "data": "json"
  }
}
```

## Intercept the Server Response

In the same way, you can also intercept the server's response.

```go {linenostart=30}
...

func (Interceptor) modifyResponse(r *http.Response) *http.Response {
  respBody := json.MustHumanize(r.Body)
  
  modRespBody := []byte(fmt.Sprintf(`{"resp": %s}`, respBody))
  ModRespBodyLen := len(modRespBody)

  r.Body = io.NopCloser(bytes.NewReader(modRespBody))
  r.ContentLength = int64(ModRespBodyLen)
  r.Header.Set("Content-Length", fmt.Sprintf("%d", ModRespBodyLen))

  return r
}

func (i Interceptor) RoundTrip(r *http.Request) (*http.Response, error) {
  defer func() {
    _ = r.Body.Close()
  }()

  // modify before the request is sent
  newReq := i.modifyRequest(r)

  // send the request using the DefaultTransport
  resp, _ := i.core.RoundTrip(newReq)
  defer func() {
    _ = resp.Body.Close()
  }()

  // modify after the response is received
  newResp := i.modifyResponse(resp)

  return newResp, nil
}
```

Now, if you re-run the client, the output of the server should be the same as before:

```javascript
{
  "req": {
    "data": "json"
  }
}
```

But the client output has been altered to this:

```javascript
{
  "resp": {
    "req": {
      "data": "json"
    }
  }
}
```

## Conclusion

You may find a better solution for the case above. All those experiments are only for learning purposes, that you may find them interesting. Once again, I'm not recommending you to copy-paste the codes above unless you know what you're doing. Working with the RoundTripper is not that hard, but it is quite tricky since you may coincidentally violate and create bugs inside the interceptor.

Thank you for reading!
