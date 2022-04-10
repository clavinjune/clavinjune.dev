---
title: "Golang Stream All Lines From Stdin"
date: 2022-04-17T00:00:01+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #13 golang stream all lines from stdin"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #13 golang stream all lines from stdin" >}}

## write.sh
```shell
#! /bin/sh

set -euo pipefail

for i in `seq 1 1000`; do
    echo "$i"
    sleep 1
done
```

## main.go
```go
package main

import (
	"bufio"
	"encoding/base64"
	"log"
	"os"
)

func main() {
	l := log.New(os.Stdout, "[STREAM] ", log.Lshortfile|log.LstdFlags|log.Lmsgprefix)
	s := bufio.NewScanner(os.Stdin)

	for s.Scan() {
		t := s.Text()
		b := s.Bytes()

		// for example process the input to b64
		b64 := base64.StdEncoding.EncodeToString(b)
		l.Println(t, "=>", b64)
	}
}
```

## Usage

```shell
sh write.sh | go run main.go
2022/04/10 20:55:25 main.go:20: [STREAM] 1 => MQ==
2022/04/10 20:55:26 main.go:20: [STREAM] 2 => Mg==
2022/04/10 20:55:27 main.go:20: [STREAM] 3 => Mw==
2022/04/10 20:55:28 main.go:20: [STREAM] 4 => NA==
2022/04/10 20:55:29 main.go:20: [STREAM] 5 => NQ==
2022/04/10 20:55:30 main.go:20: [STREAM] 6 => Ng==
^Csignal: interrupt
```

```shell
{"shortRef": "da8920f5", "authorDateIso": "2022-04-04T00:47:49+00:00", "authorName": "24659468+ClavinJune", "message": "GH-Actions-CD"}
{"shortRef": "16b77e0b", "authorDateIso": "2022-04-03T20:35:22+07:00", "authorName": "24659468+ClavinJune", "message": "build-Sun-03-Apr-2022-20-35-22-0700"}
{"shortRef": "950aaea6", "authorDateIso": "2022-03-29T09:12:26+07:00", "authorName": "clavianus.juneardo", "message": "Update-main.yml"}
{"shortRef": "e4f74e7c", "authorDateIso": "2022-03-29T09:12:05+07:00", "authorName": "clavianus.juneardo", "message": "Update-main.yml"}
{"shortRef": "b16f6ca7", "authorDateIso": "2022-03-27T00:49:02+00:00", "authorName": "24659468+ClavinJune", "message": "GH-Actions-CD"}
```

[Reference](https://git-scm.com/docs/pretty-formats)