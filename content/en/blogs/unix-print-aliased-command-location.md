---
title: "Linux Print Aliased Command's Location"
date: 2022-03-06T00:00:10+07:00
draft: false 
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #7 unix print aliased command's location"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #7 unix print aliased command's location" >}}

```shell
$ which ls
ls: aliased to ls -G
$ type -a ls
ls is an alias for ls -G
ls is /bin/ls
```