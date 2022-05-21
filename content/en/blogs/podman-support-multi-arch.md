---
title: "Podman Support Multi Arch"
date: 2022-05-29T00:00:01+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #19 podman support multi arch"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #19 podman support multi arch" >}}

```shell
$ podman machine ssh
# inside podman machine
$ sudo rpm-ostree install qemu-user-static
$ sudo systemctl reboot
# outside podman machine, wait for podman machine done restarting
$ podman run -it --rm --arch=amd64 alpine:3.14 uname -m
x86_64
$ podman run -it --rm --arch=arm64 alpine:3.14 uname -m
aarch64
```