---
title: "Golang Escape Double Quoted String Easily"
date: 2022-05-22T00:00:01+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #18 golang escape double quoted string easily"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #18 golang escape double quoted string easily" >}}

## main.go

```go
package main

import . "fmt"

func main() {
	Printf("%q", `"foobar"`)
}
```

## run go

```shell
$ go run main.go
"\"foobar\""
```