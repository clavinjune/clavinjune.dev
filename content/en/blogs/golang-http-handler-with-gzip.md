---
title: "Golang HTTP Handler With Gzip"
date: 2022-05-26T16:52:21+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1595246135406-803418233494?w=1920&q=50"]
aliases: []
description: "create a simple golang HTTP handler and request with compressed payload using gzip"
---

{{< unsplash user="@mildlee" src="photo-1595246135406-803418233494" q="50" >}}

## Introduction

Golang has many kinds of compression technique within its standard library which you can use to compress our data. A compression is needed to reduce the size of the data. Even in a web server, a compression technique would be beneficial to increase the communication speed between client and server. [Gzip](https://www.gnu.org/software/gzip/) is one of the compression techniques supported by both Golang and web. This article will cover the creation of golang HTTP handler that (de)compress gzip request/response and how to create an HTTP request that send/receive the gzip-compressed body payload. All the code covered in this article you can find it in [this repository](https://github.com/anon-org/golang-http-handler-with-gzip).

## Directory Structure

```shell
$ tree .
.
├── LICENSE
├── Makefile
├── README.md
├── client
│   └── main.go
├── curl.sh
├── go.mod
├── server
│   └── main.go
└── util.go

2 directories, 8 files
```

## server/main.go

```go
package main

import (
	"example"
	"log"
	"net/http"
)

func main() {
	log.Println("server listening at :8000")
	http.ListenAndServe(":8000", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body := example.MustReadCompressedBody[example.Payload](r.Body)
		body.Number++

		example.MustWriteCompressedResponse(w, body)
	}))
}
```

The server only run a single endpoint which will `read a compressed body`, `increment the payload content`, then `respond with new body`.

## util.go

### Payload

You can use the simplest payload just to test the compression, for example:

```go
type Payload struct {
	Number int `json:"number"`
}
```

### Read a Compressed Body Payload

```go
func MustReadCompressedBody[T any](r io.Reader) *T {
	gr, err := gzip.NewReader(r)
	PanicIfErr(err)
	defer gr.Close()

	var t T
	PanicIfErr(json.NewDecoder(gr).Decode(&t))
	return &t
}
```

To read a gzip-compressed payload, you need to create a `gzip.Reader` from your response or request. Then decode the JSON as usual using the `gzip.Reader` instance.

### Write a Compressed Response

```go
func MustWriteCompressedResponse(w http.ResponseWriter, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Encoding", "gzip")

	gw := gzip.NewWriter(w)
	defer gw.Close()
	PanicIfErr(json.NewEncoder(gw).Encode(body))
}
```

As usual, it is better to inform the client about your `Content-Type`, and `Content-Encoding`. But in golang case, informing the client about `Content-Encoding` will help golang `http.Request` to decompress the payload automatically. Just like [reading the payload](#read-a-compressed-body-payload), you only need to create a `gzip.Writer` then encode the content normally. Also, **don't forget to call `gw.Close()` to avoid EOF error**.

## Test the Server

Now, your server has completely (de)compress the request and response. Let's try to test it using cURL command first.

```shell
# run the server on another terminal
# using `go run ./server/` command
$ echo '{"number": 99}' | gzip | \
curl -iXPOST http://localhost:8000/ \
-H "Content-Type: application/json" \
-H "Content-Encoding: gzip" \
--compressed --data-binary @-
```

Since the server will increase the `Payload.Number`, you can expect the response number will be `100` by sending a request with `99`. The expected result would be similar to this:

```shell
HTTP/1.1 200 OK
Content-Encoding: gzip
Content-Type: application/json
Date: Thu, 26 May 2022 12:04:53 GMT
Content-Length: 39

{"number":100}
```

Now, after you sure that your server works completely fine, let's try to send the HTTP request using golang `http.Request`.

## client/main.go

```go
package main

import (
	"context"
	"encoding/json"
	"example"
	"log"
	"net/http"
	"time"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	body := &example.Payload{
		Number: 100,
	}

	log.Printf("create compressed request with %#v", body)
	req := example.MustCreateCompressedRequest(ctx, http.MethodPost, "http://localhost:8000/", body)
	defer req.Body.Close()

	log.Printf("send compressed request")
	resp, err := http.DefaultClient.Do(req)
	example.PanicIfErr(err)
	defer resp.Body.Close()

	log.Println("resp.Uncompressed?", resp.Uncompressed)
	var responsePayload *example.Payload
	if resp.Uncompressed {
		err = json.NewDecoder(resp.Body).Decode(&responsePayload)
	} else {
		responsePayload = example.MustReadCompressedBody[example.Payload](resp.Body)
	}
	log.Printf("read response %#v", responsePayload)
}
```

Just like a normal HTTP request, you just need to `create an HTTP.Request`, `send the request`, and lastly `decode the response`. But, before send the request payload, don't forget to compress it fist.

### Create a Compressed Request

```go
func MustCreateCompressedRequest(ctx context.Context, method, url string, body any) *http.Request {
	pr, pw := io.Pipe()

	go func() {
		gw := gzip.NewWriter(pw)
		err := json.NewEncoder(gw).Encode(body)
		defer PanicIfErr(gw.Close())
		defer pw.CloseWithError(err)
	}()

	r, err := http.NewRequestWithContext(ctx, method, url, pr)
	PanicIfErr(err)

	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("Content-Encoding", "gzip")

	return r
}
```

Create a new compressed request is quite easy, just like [write a compressed response](#write-a-compressed-response) we need to create a new `gzip.Writer`. Code above utilize `io.Pipe` to avoid buffer the body into a memory and unecessary allocations. But here's the alternative if you want to buffer the body first:

```go
func MustCreateCompressedRequest(ctx context.Context, method, url string, body any) *http.Request {
	var b bytes.Buffer

	gw := gzip.NewWriter(&b)
	err := json.NewEncoder(gw).Encode(body)
	defer PanicIfErr(gw.Close())

	r, err := http.NewRequestWithContext(ctx, method, url, &b)
	PanicIfErr(err)

	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("Content-Encoding", "gzip")

	return r
}
```

Again, `gw.Close()` is also necessary here. If you don't close the `gzip.Writer`, you'll see an EOF error similar to this:

```shell
2022/05/26 19:23:58 http: panic serving [::1]:56436: unexpected EOF
```

Lastly, after creating the compressed request, you only need to send the request like a normal request. But here's a tricky part.

```go
var responsePayload *example.Payload
if resp.Uncompressed {
    err = json.NewDecoder(resp.Body).Decode(&responsePayload)
} else {
    responsePayload = example.MustReadCompressedBody[example.Payload](resp.Body)
}
```

After you receive a response which you want to decompress and decode, please be aware with the [resp.Uncompressed](https://github.com/golang/go/blob/master/src/net/http/response.go#L89-L96). If the server returns a header `Content-Encoding: gzip`, as it said [here](https://github.com/golang/go/blob/master/src/net/http/transport.go#L182-L190) Golang will try to `decompress` the payload for you so you don't need to use `example.MustReadCompressedBody[example.Payload](resp.Body)`. But if you add `r.Header.Set("Accept-Encoding", "gzip")` on your request, it won't be automatically decompressed.

## Test the Client

```shell
# run the server on another terminal
# using `go run ./server/` command
$ go run ./client
2022/05/26 19:41:34 create compressed request with &example.Payload{Number:100}
2022/05/26 19:41:34 send compressed request
2022/05/26 19:41:34 resp.Uncompressed? true
2022/05/26 19:41:34 read response &example.Payload{Number:101}
```

## Conclusion

Implementation of the gzip compression on Golang HTTP handler and requests might be adding a little complexity on your code, but I believe modern browser / API gateway these days can implement this easily without changing your code. Also this [middleware](https://github.com/nytimes/gziphandler) created by NY Times can help you to minimize the effort on implementing this compression. You can find all the code used on in this article [here](https://github.com/anon-org/golang-http-handler-with-gzip).

Thank you for reading!
