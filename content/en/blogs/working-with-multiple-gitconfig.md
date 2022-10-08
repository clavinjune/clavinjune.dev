---
title: "Working With Multiple Gitconfig"
date: 2022-10-08T11:57:59+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1920&q=50"]
aliases: []
description: "working with multiple gitconfig"
---

{{< unsplash user="@praveentcom" src="photo-1647166545674-ce28ce93bdca" q="50" >}}

## Introduction

This article will be a quick tips if you're using multiple git config inside one local machine. For example if you're working on both Gitlab/Bitbucket/Github with different email/username/gpgsign, or you're working on your personal and work git account on the same machine.

## Setup Gitconfig Directory

This directory name would be anything, but for the sake of naming convention let's call it `~/.gitconfig.d/`.

```shell
$ mkdir -p "$HOME/.gitconfig.d/" && cd "$_"
$ pwd
/Users/clavianus.juneardo/.gitconfig.d
```

## Setup Each Gitconfig

Now you have create the directory, let's say you want to set your `personal` and `work` account:

### Setup Personal Gitconfig

```shell
$ git config --file=personal user.name "foo"
$ git config --file=personal user.email "foo@gmail.com"
$ git config --file=personal core.editor "vim"
...
```

By using `--file=personal` flag, the gitconfig will be configured inside `personal` file.

```shell
$ cat personal
[user]
	name = foo
	email = foo@gmail.com
[core]
	editor = vim
```

Now let's do the same with your work account.

### Setup Work Gitconfig

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

Now you have set both your account. Then, how to switch between each gitconfig?
Let's say you put all your company's git directory at `~/Works` and yours at `~/Personals`. You can switch easily by configure the global gitconfig using `includeIf`.

```shell
cat <<EOF > ~/.gitconfig
[includeIf "gitdir:~/Works/"]
  path = ~/.gitconfig.d/work
[includeIf "gitdir:~/Personals/"]"
  path = ~/.gitconfig.d/personal
EOF
```

## Conclusion

Now everytime you're inside `~/Works/` you are using the `~/.gitconfig.d/work`, and when you're inside `~/Personals/` you are using the `~/.gitconfig.d/personal`. 

You can check whether the gitconfig load properly or not by simply executing `git config user.email` command and see what email is showing up.

Thank you for reading!
