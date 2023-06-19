---
title: "Bekerja menggunakan beberapa Gitconfig"
date: 2023-06-19T20:51:59+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=1920&q=50"]
aliases: []
description: "Pakai banyak gitconfig, pisahkan persona git Anda"
---
#### Translated by: [@paramithatm](https://github.com/paramithatm)

{{< unsplash user="@praveentcom" src="photo-1647166545674-ce28ce93bdca" q="50" >}}

## Pengenalan

Ini adalah tips singkat untuk menggunakan beberapa git config pada 1 mesin lokal. Misalnya jika Anda bekerja menggunakan Gitlab/Bitbucket/Github dengan beberapa email/username/gpgsign yang berbeda, atau jika Anda menggunakan akun personal dan akun kerja Anda di mesin yang sama.

## Mengatur Direktori Gitconfig

Nama direktori bebas, tapi demi kemudahan penamaan, mari kita namai `~/.gitconfig.d/`. 

```shell
$ mkdir -p "$HOME/.gitconfig.d/" && cd "$_"
$ pwd
/Users/clavianus.juneardo/.gitconfig.d
```

## Mengatur Masing-masing Gitconfig

Setelah membuat direktori, misalnya Anda mau mengatur akun `personal` dan `kerja` Anda:

### Mengatur Gitconfig Personal

```shell
$ git config --file=personal user.name "foo"
$ git config --file=personal user.email "foo@gmail.com"
$ git config --file=personal core.editor "vim"
...
```

Dengan menggunakan penanda `--file=personal`, gitconfig tersebut akan dikonfigurasi di dalam _file_ `personal`.

```shell
$ cat personal
[user]
	name = foo
	email = foo@gmail.com
[core]
	editor = vim
```

Mari lakukan hal yang sama untuk akun kerja Anda.

### Mengatur Gitconfig untuk Kerja

```shell
$ git config --file=work user.name "foo bar"
$ git config --file=work user.email "foo@company.com"
$ git config --file=work user.signingKey "ABCDEF012345"
$ git config --file=work commit.gpgsign true
$ git config --file=work core.editor "vim"
...

$ cat work
[user]
	name = foo bar
	email = foo@company.com
	signingKey = ABCDEF012345
[commit]
	gpgsign = true
[core]
	editor = vim
```

Sekarang kedua akun Anda sudah diatur. Bagaimana cara berganti antara kedua gitconfig?
Katakanlah semua direktori git pekerjaan Anda terletak di `~/Works`, dan yang pribadi di `~/Personals`. Anda dapat mengganti gitconfig dengan cara mengatur gitconfig global menggunakan `includeIf`.

```shell
cat <<EOF > ~/.gitconfig
[includeIf "gitdir:~/Works/"]
  path = ~/.gitconfig.d/work
[includeIf "gitdir:~/Personals/"]"
  path = ~/.gitconfig.d/personal
EOF
```

## Kesimpulan

Sekarang setiap Anda berada dalam direktori `~/Works/` Anda menggunakan konfigurasi `~/.gitconfig.d/work`, dan ketika Anda berada dalam `~/Personals/` Anda menggunakan konfigurasi `~/.gitconfig.d/personal`.

Anda dapat mengecek apakah gitconfig terpasang dengan benar dengan cara menjalankan perintah `git config user.email` dan cek email mana yang muncul.

Terima kasih sudah membaca!
