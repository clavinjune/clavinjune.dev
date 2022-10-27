---
title: "Unix Print Lokasi Perintah yang Memiliki Alias"
date: 2022-10-27T22:33:24+07:00
draft: false 
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #7 unix print lokasi perintah yang memiliki alias "
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #7 unix print lokasi perintah yang memiliki alias" >}}

```shell
$ which ls
ls: aliased to ls -G
$ type -a ls
ls is an alias for ls -G
ls is /bin/ls
```