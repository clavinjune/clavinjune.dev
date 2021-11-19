---
title: "How to Minimize Go Apps Container Image"
date: 2021-11-19T18:46:59+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["other"]
images: ["https://images.unsplash.com/photo-1613690399151-65ea69478674?w=1920&q=50"]
aliases: []
description: "how to reduce your Golang apps container image size"
---

{{< unsplash user="@ventiviews" src="photo-1613690399151-65ea69478674" q="50" >}}

## Introduction

Image is one necessary thing that you must plan when you want to containerize your apps. Building a large image means you need more data to transfer between your image repository, CI/CD platform, and deployment server. Creating a smaller container is a must to save time. There's no need to be difficult when it comes to reducing container image size. Especially with Go apps, it has already come with a binary, which means it doesn't need any environmental server like Nginx, Node, Etc.

In this article, you will learn how to reduce your Go apps container image using Docker. You can also use another builder like Buildah that used by Podman. In this case, you will reduce your container image's size using a [multi-stage build](#multistage-dockerfile) with a **distroless image**, [UPX](#upx-dockerfile), and especially for Go apps, utilize the [ldflags](#utilize-go-flags).

## Go Apps

For example, you have a Go application like below:

```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"

    "github.com/julienschmidt/httprouter"
)

func main() {
    r := httprouter.New()
    r.GET("/", func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
        m := map[string]interface{}{
            "time": time.Now().UnixMilli(),
        }

        w.Header().Add("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(m)
    })

    fmt.Println("Run on port :8000")
    http.ListenAndServe(":8000", r)
}
```

Import the `github.com/julienschmidt/httprouter` to help simulate the `go mod download` command inside the `Dockerfile`/`Containerfile`.

## Initial Dockerfile

Let's say here is your initial Dockerfile content:

```Dockerfile
FROM golang:1.17.3-alpine3.14
WORKDIR /app

ENV GO111MODULE=on CGO_ENABLED=0

COPY go.mod go.sum /app/
RUN go mod download

COPY . .
RUN go build -o /app/main /app/main.go

CMD [ "/app/main" ]
```

> Tips: You can optionally use an alpine image to reduce your base image to save data. And utilize the builder cache by properly putting the line that changes less often earlier.

Let's build and tag it as `example:initial`.

```bash
$ docker build -t example:initial .
$ docker images example
REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
example      initial   0d1bfb281019   37 seconds ago   337MB
```

It takes **337MB**, let's improve it.

## Multistage Dockerfile

```Dockerfile
# base image
FROM golang:1.17.3-alpine3.14 as base
WORKDIR /builder

ENV GO111MODULE=on CGO_ENABLED=0

COPY go.mod go.sum /builder/
RUN go mod download

COPY . .
RUN go build -o /builder/main /builder/main.go

# runner image
FROM gcr.io/distroless/static:latest
WORKDIR /app
COPY --from=base /builder/main main

EXPOSE 8000
CMD ["/app/main"]
```

Multistage build helps you to leave all the unimportant things inside the base image and start using a new image to run your apps.

```Dockerfile {linenostart=2}
FROM golang:1.17.3-alpine3.14 as base
```

As you see, you can name your stages so if you want to copy things from that stage, you can provide the stage's name on the `COPY` line.

```Dockerfile {linenostart=12}
...
# runner image
FROM gcr.io/distroless/static:latest
WORKDIR /app
COPY --from=base /builder/main main

EXPOSE 8000
CMD ["/app/main"]
```

Also, you can use a [distroless image](https://github.com/GoogleContainerTools/distroless/) as your runner image to make your container image smaller. It is also available for some other programming languages. According to its documentation:

> "Distroless" images contain only your application and its runtime dependencies. They do not contain package managers, shells or any other programs you would expect to find in a standard Linux distribution.

As for the example you use `CGO_ENABLED=0` flags, you can use the `gcr.io/distroless/static` as a runner image. But if you need the flags to be on, you should use `gcr.io/distroless/base` referring to the [docs](https://github.com/GoogleContainerTools/distroless/blob/main/base/README.md#image-contents).

Let's build again and tag it as `example:multistage`.

```bash
$ docker build -t example:multistage .
$ docker images example
REPOSITORY   TAG          IMAGE ID       CREATED          SIZE
example      multistage   6c54eb031f69   2 seconds ago    8.63MB
example      initial      0d1bfb281019   20 minutes ago   337MB
```

Do we have room to be improved? Of course!

## UPX Dockerfile

```Dockerfile {hl_lines=[4, 13]}
# base image
FROM golang:1.17.3-alpine3.14 as base
WORKDIR /builder
RUN apk add upx

ENV GO111MODULE=on CGO_ENABLED=0

COPY go.mod go.sum /builder/
RUN go mod download

COPY . .
RUN go build -o /builder/main /builder/main.go
RUN upx -9 /builder/main

# runner image
FROM gcr.io/distroless/static:latest
WORKDIR /app
COPY --from=base /builder/main main

EXPOSE 8000
CMD ["/app/main"]
```

[UPX](https://upx.github.io/) is a tool to help you shrink your binary size, not only specific for Go apps. You can install the `UPX` on line 4, and run the `UPX` command on line 13 to utilize the builder cache. `upx -9` means you want to compress better, you can see the available flags by using `upx -h`.

Let's build again and tag it as `example:with-upx`.

```bash
$ docker build -t example:with-upx .
$ docker images example
REPOSITORY   TAG          IMAGE ID       CREATED          SIZE
example      with-upx     0831b4ee8d1a   2 seconds ago    5.91MB
example      multistage   6c54eb031f69   12 minutes ago   8.63MB
example      initial      0d1bfb281019   33 minutes ago   337MB
```

Not bad, isn't it? Let's do the final touch.

## Utilize Go Flags

```Dockerfile {linenostart=10}
...

RUN go build \
    -ldflags "-s -w" \
    -o /builder/main /builder/main.go

...
```

Using your last [Dockerfile](#upx-dockerfile), you only need to retouch the `go build` command. Add the `-ldflags "-s -w"` flags to disable the symbol table and DWARF generation that is supposed to create debugging data. You can see the other available options using the `go tool link -h` command.

Let's build and tag it as `example:latest`.

```bash
$ docker build -t example:latest .
$ docker images example
REPOSITORY   TAG          IMAGE ID       CREATED          SIZE
example      latest       fd81bd6268bd   1 second ago     4.16MB
example      with-upx     0831b4ee8d1a   9 minutes ago    5.91MB
example      multistage   6c54eb031f69   22 minutes ago   8.63MB
example      initial      0d1bfb281019   42 minutes ago   337MB
```

There you have a minimalist Go apps container image with a significant reduction.

## Conclusion

You can also use the steps in this article to build another container image besides Go apps. Especially the multistage build that reduce more than half of the image size. But still, only you know what's best and fit for you.

Thank you for reading!
