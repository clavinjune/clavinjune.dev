---
title: "Golang HTTP Server Graceful Shutdown"
date: 2022-02-27T00:00:13+07:00
draft: false 
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #6 golang HTTP server graceful shutdown"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #6 golang HTTP server graceful shutdown" >}}

```go
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func createChannel() (chan os.Signal, func()) {
	stopCh := make(chan os.Signal, 1)
	signal.Notify(stopCh, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	return stopCh, func() {
		close(stopCh)
	}
}

func start(server *http.Server) {
	log.Println("application started")
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		panic(err)
	} else {
		log.Println("application stopped gracefully")
	}
}

func shutdown(ctx context.Context, server *http.Server) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		panic(err)
	} else {
		log.Println("application shutdowned")
	}
}

func main() {
	log.SetFlags(log.Lshortfile)
	s := &http.Server{}
	go start(s)

	stopCh, closeCh := createChannel()
	defer closeCh()
	log.Println("notified:", <-stopCh)

	shutdown(context.Background(), s)
}
```

runtime:

```shell
$ go run main.go
main.go:24: application started
^Cmain.go:50: notified: interrupt # ctrl+c
main.go:28: application stopped gracefully
main.go:39: application shutdowned
$
```