---
title: "Git Log Prettify"
date: 2022-04-10T00:00:01+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #12 git log prettify"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #12 git log prettify" >}}

```shell
$ git log -5 \
--pretty='format:{"shortRef": "%h", "authorDateIso": "%aI", "authorName": "%aL", "message": "%f"}'
```

```shell
{"shortRef": "da8920f5", "authorDateIso": "2022-04-04T00:47:49+00:00", "authorName": "24659468+ClavinJune", "message": "GH-Actions-CD"}
{"shortRef": "16b77e0b", "authorDateIso": "2022-04-03T20:35:22+07:00", "authorName": "24659468+ClavinJune", "message": "build-Sun-03-Apr-2022-20-35-22-0700"}
{"shortRef": "950aaea6", "authorDateIso": "2022-03-29T09:12:26+07:00", "authorName": "clavianus.juneardo", "message": "Update-main.yml"}
{"shortRef": "e4f74e7c", "authorDateIso": "2022-03-29T09:12:05+07:00", "authorName": "clavianus.juneardo", "message": "Update-main.yml"}
{"shortRef": "b16f6ca7", "authorDateIso": "2022-03-27T00:49:02+00:00", "authorName": "24659468+ClavinJune", "message": "GH-Actions-CD"}
```

[Reference](https://git-scm.com/docs/pretty-formats)