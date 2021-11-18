---
title: "Passing Hostname to Docker Services"
date: 2021-04-29T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: []
aliases: []
description: "This post contains notes on how to pass host hostname to docker services via environment variable without changing service hostname"
---

Passing hostname to docker container won't work

```yaml
environment:
  - "HOST_HOSTNAME=$HOSTNAME"
```

Do this instead

```yaml
environment:
  - "HOST_HOSTNAME={{ .Node.Hostname }}"
```

It will fetch the hostname from docker placeholder

[Reference](https://docs.docker.com/engine/reference/commandline/service_create/#create-services-using-templates)

Thank you for reading!
