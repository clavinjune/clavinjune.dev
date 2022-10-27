---
title: "Go Get Modul Private Golang"
date: 2022-10-27T22:28:24+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #2 go get modul private golang"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #2 go get modul private golang" >}}

Saya berasumsi sebelum mengambil modul private golang, kalian telah menaruh public SSH Key di repositori git kalian.

```bash
$ mkdir example && cd example
$ go mod init example
go: creating new go.mod: module example
# Ini adalah repositori private saya, percobaan ini akan menghasilkan eror
$ go get github.com/clavinjune/testing@latest
go get github.com/clavinjune/testing@latest: module github.com/clavinjune/testing: git ls-remote -q origin in [redacted]: exit status 128:
	fatal: could not read Username for 'https://github.com': terminal prompts disabled
Confirm the import path was entered correctly.
If this is a private repository, see https://golang.org/doc/faq#git_https for additional information.

# ubah https menjadi ssh, go get akan mencoba mengambil modul private kalian menggunakan SSH key kalian
$ git config --global --add url."git@github.com:".insteadOf "https://github.com/"
$ go get github.com/clavinjune/testing@latest
go get: added github.com/clavinjune/testing v1.0.0
# sukses! Tetapi, jika cara di atas masih tidak berhasil, set GOPRIVATE terlebih dahulu
$ go env -w GOPRIVATE="github.com/clavinjune/*"
# lalu, jalankan go get lagi
```
