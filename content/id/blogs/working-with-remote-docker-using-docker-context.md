---
title: "Bekerja dengan Remote Docker menggunakan Docker Context"
date: 2023-06-17T23:36:25+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1920&q=50"]
aliases: []
description: "Menggunakan docker context untuk bekerja dengan remote docker secara lokal"
---
#### Translated by: [@paramithatm](https://github.com/paramithatm)

{{< unsplash user="@carrier_lost" src="photo-1605745341112-85968b19335b" q="50" >}}

## Pengenalan
Ini adalah contekan cara menggunakan _docker context_ untuk terhubung dengan _remote docker_ secara lokal. Mungkin dapat membantu kalian terhubung dengan _remote docker_ kalian tanpa perlu SSH secara manual ke server _remote_.

## Menambahkan Context

```bash
$ docker context create my-remote-docker-machine --docker "host=ssh://username@host"
my-remote-docker-machine
Successfully created context "my-remote-docker-machine"
```

Kalian juga dapat memanfaatkan file `SSH Config` untuk terhubung ke _remote docker_. Khususnya ketika kalian perlu mendefinisikan `private key` atau `password` sendiri.

```bash
$ cat ~/.ssh/config 
Host my-remote-docker-machine
  Hostname host
  User username
$ docker context create my-remote-docker-machine --docker "host=ssh://my-remote-docker-machine"
```

Selain `ssh`, kalian juga dapat menambahkan _context_ menggunakan protokol `tcp` jika kalian mengaktifkan `Docker API`.

## Tampilkan Semua Context

```bash
$ docker context ls
NAME                       DESCRIPTION                               DOCKER ENDPOINT               KUBERNETES ENDPOINT   ORCHESTRATOR
default *                  Current DOCKER_HOST based configuration   unix:///var/run/docker.sock                         swarm
my-remote-docker-machine                                             ssh://username@host
```

## Menggunakan Context

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

## Mengatur Context sebagai Pilihan Bawaan

```bash
$ docker context use my-remote-docker-machine 
my-remote-docker-machine
Current context is now "my-remote-docker-machine"
$ docker context ls
NAME                         DESCRIPTION                               DOCKER ENDPOINT               KUBERNETES ENDPOINT   ORCHESTRATOR
default                      Current DOCKER_HOST based configuration   unix:///var/run/docker.sock                         swarm
my-remote-docker-machine *                                             ssh://username@host

```

Perhatikan bahwa `*` berpindah dari `default` ke `my-remote-docker-machine`. Sekarang kalian dapat menggunakan perintah _docker_ tanpa _flag_ `--context`.

## Menghapus Context

```bash
$ docker context use default # back to default
$ docker context rm my-remote-docker-machine 
my-remote-docker-machine
```

## Kesimpulan

Menggunakan _docker context_ membantu kita menghindari SSH secara manual ke server remote. Tapi, ketika kita perlu membuat sebuah _image_ menggunakan _remote docker_ secara lokal, kita perlu memikirkan seberapa besar _docker context_ yang perlu diunggah/diunduh.

Terima kasih sudah membaca!