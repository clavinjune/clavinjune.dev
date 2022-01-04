---
title: "Listening to Random Available Port in Go"
date: 2022-01-04T17:09:11+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1529078155058-5d716f45d604?w=1920&q=50"]
aliases: []
description: "Listening to random available port in Go"
---

{{< unsplash user="@mbaumi" src="photo-1529078155058-5d716f45d604" q="50" >}}

To use a random available port in Golang, you can use `:0`. I believe the port `0` would works for another language as well as I tried in python.

```bash
$ python -m SimpleHTTPServer 0
Serving HTTP on 0.0.0.0 port 43481 ...
```

According to [lifewire](https://www.lifewire.com/port-0-in-tcp-and-udp-818145), port `0` is a `non-ephemeral port` that works as a wildcard that tells the system **to find any available ports particularly in the Unix OS**.

## The Go Code

```go
package main

import (
    "log"
    "net"
    "net/http"
)

func createListener() (l net.Listener, close func()) {
    l, err := net.Listen("tcp", ":0")
    if err != nil {
        panic(err)
    }

    return l, func() {
        _ = l.Close()
    }
}

func main() {
    l, close := createListener()
    defer close()

    http.Handle("/", http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
        // handle like normal
    }))

    log.Println("listening at", l.Addr().(*net.TCPAddr).Port)
    http.Serve(l, nil)
}

```

Execute it:

```bash
$ go run main.go 
2022/01/04 17:40:16 listening at 33845
```

Thank you for reading!
