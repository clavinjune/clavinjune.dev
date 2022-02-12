---
title: "Gradle Debugging Dependencies"
date: 2022-02-13T02:00:43+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #4 gradle debugging dependencies"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #4 gradle debugging dependencies" >}}


```shell
# gradle <module-name>:dependencies --configuration <configuration>
$ gradle :payment:payment-service:dependencies \
  --configuration runtimeClasspath > deps.txt
```
