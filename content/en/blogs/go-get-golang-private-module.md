---
title: "Go Get Golang Private Module"
date: 2022-01-30T10:54:55+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #2 go get golang private module"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #2 go get golang private module" >}}

I assume before fetching golang private module, you already have put your public SSH key on your git repository.

```bash
$ mkdir example && cd example
$ go mod init example
go: creating new go.mod: module example
# this is my private repo, this attempt will produce error
$ go get github.com/clavinjune/testing@latest
go get github.com/clavinjune/testing@latest: module github.com/clavinjune/testing: git ls-remote -q origin in [redacted]: exit status 128:
	fatal: could not read Username for 'https://github.com': terminal prompts disabled
Confirm the import path was entered correctly.
If this is a private repository, see https://golang.org/doc/faq#git_https for additional information.

# change the https to ssh, go get will try fetching your private module using your SSH key
$ git config --global --add url."git@github.com:".insteadOf "https://github.com/"
$ go get github.com/clavinjune/testing@latest
go get: added github.com/clavinjune/testing v1.0.0
# success! But if above method still doesn't work set GOPRIVATE first
$ go env -w GOPRIVATE="github.com/clavinjune/*"
# then, go get again
```
