---
title: "Working With Remote Docker Using Docker Context"
date: 2021-12-02T15:36:25+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1920&q=50"]
aliases: []
description: "Using docker context to work with a remote docker locally"
---

{{< unsplash user="@carrier_lost" src="photo-1605745341112-85968b19335b" q="50" >}}

## Introduction

This is a cheatsheet for working with docker context to connect remote docker locally. Might help you to work with remote docker without manually SSH to the remote server.

## Add Context

```bash
$ docker context create my-remote-docker-machine --docker "host=ssh://username@host"
my-remote-docker-machine
Successfully created context "my-remote-docker-machine"
```

You can also utilize `SSH Config` file to connect to the remote docker. Especially when you need to define your `private key` or `password`.

```bash
$ cat ~/.ssh/config 
Host my-remote-docker-machine
  Hostname host
  User username
$ docker context create my-remote-docker-machine --docker "host=ssh://my-remote-docker-machine"
```

Besides `ssh`, you can also add your context using `tcp` protocol if you enable the `Docker API`.

## List All Context

```bash
$ docker context ls
NAME                       DESCRIPTION                               DOCKER ENDPOINT               KUBERNETES ENDPOINT   ORCHESTRATOR
default *                  Current DOCKER_HOST based configuration   unix:///var/run/docker.sock                         swarm
my-remote-docker-machine                                             ssh://username@host
```

## Use Context

```bash
$ docker --context my-remote-docker-machine images -q
65dadc9c7fe7
f814fce55133
7a9b6da4328e
33655f17f093
d120da10b040
6d6859d1a42a
c19ae228f069
```

## Set New Context as Default

```bash
$ docker context use my-remote-docker-machine 
my-remote-docker-machine
Current context is now "my-remote-docker-machine"
$ docker context ls
NAME                         DESCRIPTION                               DOCKER ENDPOINT               KUBERNETES ENDPOINT   ORCHESTRATOR
default                      Current DOCKER_HOST based configuration   unix:///var/run/docker.sock                         swarm
my-remote-docker-machine *                                             ssh://username@host

```

See the `*` is moved from `default` to `my-remote-docker-machine`. Now you can use your docker command without `--context` flag.

## Remove Context

```bash
$ docker context use default # back to default
$ docker context rm my-remote-docker-machine 
my-remote-docker-machine
```

## Conclusion

Using docker context might help to avoid SSH manually to the remote server. But, when it comes to build an image using a remote docker locally, you need to consider how much docker context that will be uploaded/downloaded.

Thank you for reading!
