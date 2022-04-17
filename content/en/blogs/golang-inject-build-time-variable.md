---
title: "Golang Inject Build Time Variable"
date: 2022-05-01T00:00:01+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #15 golang inject build time variable"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #15 golang inject build time variable" >}}

```go
package main

import . "fmt"

var foo = "not injected"

func main() {
	Println(foo)
}
```

```shell
$ go run main.go
not injected
$ go run -ldflags "-X main.foo=injected" main.go
injected
```