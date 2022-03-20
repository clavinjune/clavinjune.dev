---
title: "Change Directory to Git Root Directory"
date: 2022-03-20T22:05:52+07:00
draft: false 
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #9 change directory to git root directory"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #9 change directory to git root directory" >}}


```shell {hl_lines=[3]}
$ pwd
/tmp/bjora-project/backend/scripts/docker
$ cd `git rev-parse --show-toplevel`
$ pwd
/tmp/bjora-project/backend
```