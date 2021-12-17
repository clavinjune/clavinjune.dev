---
title: "Mocking HTTP Call in Golang a Better Way"
date: 2021-12-17T11:02:44+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1532726635173-491f83dcce3c?w=1920&q=50"]
aliases: []
description: "This post contains a better way to mock HTTP Call in Golang using httptest"
---

{{< unsplash user="@jim_reardan" src="photo-1532726635173-491f83dcce3c" q="50" >}}

## Introduction

As a software engineer, you need to learn every day to keep your knowledge up-to-date. Any improvement in any aspect would help you write a better code. After writing more and more Golang code, I realized that I could improve [this blog post](/blogs/mocking-http-call-in-golang/).

As you see in that post, you need to [mock the HTTP Client](/blogs/mocking-http-call-in-golang/#http-client-mock) to make the HTTP call simulated correctly. Also, you are required to change your [API implementation](/blogs/mocking-http-call-in-golang/#api-implementation-struct) to use the HTTPClient interface. That's quite a problem in the long run because you don't know what improvement will the HTTP Client got in the next version of the Golang code base. That's the problem you got if you mock the HTTP client. Instead, you can change the perspective and start to mock the HTTP Server.

In this blog post, you will learn how to mock the HTTP server using a built-in testing library. There's no need to create your own interfaces because it is all provided by the Golang standard library called `httptest`.

## Directory Structure

```bash
$ go mod init example
go: creating new go.mod: module example
$ mkdir -p external
$ touch external/{external.go,external_test.go}
$ tree .
.
├── external
│   ├── external.go
│   └── external_test.go
└── go.mod

1 directory, 3 files
```

## Implementation File Content

```go
// external.go
package external

import (
    "context"
    "encoding/json"
    "errors"
    "fmt"
    "net/http"
    "time"
)

var (
    ErrResponseNotOK error = errors.New("response not ok")
)

type (
    Data struct {
        ID   string `json:"id"`
        Name string `json:"name"`
    }

    External interface {
        FetchData(ctx context.Context, id string) (*Data, error)
    }

    v1 struct {
        baseURL string
        client  *http.Client
        timeout time.Duration
    }
)

func New(baseURL string, client *http.Client, timeout time.Duration) *v1 {
    return &v1{
        baseURL: baseURL,
        client:  client,
        timeout: timeout,
    }
}

func (v *v1) FetchData(ctx context.Context, id string) (*Data, error) {
    url := fmt.Sprintf("%s/?id=%s", v.baseURL, id)

    ctx, cancel := context.WithTimeout(ctx, v.timeout)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return nil, err
    }

    resp, err := v.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("%w. %s", ErrResponseNotOK, http.StatusText(resp.StatusCode))
    }

    var d *Data
    return d, json.NewDecoder(resp.Body).Decode(&d)
}
```

It is a little bit different to the one you implemented before, but the goal remains the same is to make an HTTP call to the external service. Let's focus on the `External interface` that you need to mock.

## Test File Content

First, you need to mock the HTTP server and the `External object`.

```go
package external_test

import (
    "example/external"
    "fmt"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"
)

var (
    server *httptest.Server
    ext    external.External
)

func TestMain(m *testing.M) {
    fmt.Println("mocking server")
    server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // mock here
    }))

    fmt.Println("mocking external")
    ext = external.New(server.URL, http.DefaultClient, time.Second)

    fmt.Println("run tests")
    m.Run()
}
```

As you see on line 24:

```go {linenostart=23}
...
ext = external.New(server.URL, http.DefaultClient, time.Second)
...
```

You can use the `server.URL` as the `baseURL` so all the HTTP Call to the `baseURL` will be handled by the `httptest.Server`. That's how you mock the HTTP server instead of the HTTP call.

After creating the mock server, you need to mock the endpoint also. For example:

```go {linenostart=15}
...

func mockFetchDataEndpoint(w http.ResponseWriter, r *http.Request) {
    ids, ok := r.URL.Query()["id"]

    sc := http.StatusOK
    m := make(map[string]interface{})

    if !ok || len(ids[0]) == 0 {
        sc = http.StatusBadRequest
    } else {
        m["id"] = "mock"
        m["name"] = "mock"
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(sc)
    json.NewEncoder(w).Encode(m)
}

...
```

Then, put the endpoint inside your mock server.

```go {linenostart=40}
...

server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    switch strings.TrimSpace(r.URL.Path) {
    case "/":
        mockFetchDataEndpoint(w, r)
    default:
        http.NotFoundHandler().ServeHTTP(w, r)
    }
}))

...
```

The advantage of mocking the HTTP server that way is, you can put all the endpoints needed on one server only. It will be created once, before the `m.Run()` and then used by all your tests in the same package.

## Create the Unit Test

Now you have mocked the HTTP Server, there's nothing special on the unit test itself. You can start writing your unit test as usual. For example:

```go
...

func fatal(t *testing.T, want, got interface{}) {
    t.Helper()
    t.Fatalf(`want: %v, got: %v`, want, got)
}

func TestExternal_FetchData(t *testing.T) {
    tt := []struct {
        name     string
        id       string
        wantData *external.Data
        wantErr  error
    }{
        {
            name:     "response not ok",
            id:       "",
            wantData: nil,
            wantErr:  external.ErrResponseNotOK,
        },
        {
            name: "data found",
            id:   "mock",
            wantData: &external.Data{
                ID:   "mock",
                Name: "mock",
            },
            wantErr: nil,
        },
    }

    for i := range tt {
        tc := tt[i]

        t.Run(tc.name, func(t *testing.T) {
            t.Parallel()

            gotData, gotErr := ext.FetchData(context.Background(), tc.id)

            if !errors.Is(gotErr, tc.wantErr) {
                fatal(t, tc.wantErr, gotErr)
            }

            if !reflect.DeepEqual(gotData, tc.wantData) {
                fatal(t, tc.wantData, gotData)
            }
        })
    }
}
```

## Conclusion

By changing the perspective, you have improved the unit test a lot. Instead of mocking the HTTP Call, mocking the HTTP server is way more readable and proper. You don't need to create interfaces of the HTTP client and start using the standard way to mock the call by using the `httptest`.

Thank you for reading!
