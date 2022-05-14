---
title: "Include Dotenv File to Makefile"
date: 2022-05-15T00:00:01+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #17 include dotenv file to makefile"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #17 include dotenv file to makefile" >}}

## Directory Structure

```shell
$ tree -a .
.
├── .env
└── Makefile

0 directories, 2 files
```

## Dotenv File

```shell
$ cat .env
FOO=12345
```

## Makefile

```shell
$ cat Makefile
include .env

example:
	@echo "${FOO}"
$ make example
12345
```