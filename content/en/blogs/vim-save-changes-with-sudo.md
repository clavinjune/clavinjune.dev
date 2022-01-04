---
title: "Vim Save Changes With Sudo"
date: 2022-01-05T04:19:48+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1920&q=50"]
aliases: []
description: "Save changes with sudo using Vim"
---

{{< unsplash user="@6heinz3r" src="photo-1629654297299-c8506221ca97" q="50" >}}

## Introduction

Sometimes, when you need to modify a file that needs root permission, you forgot to use sudo before open it using vim. This is quite annoying when you have changed a lot of lines, but you can't save the modification.

Even though Vim has already warned us before editing using this line:

> "W10: Warning: Changing a readonly file" -- Vim

That doesn't sounds like a warning, more like a `not-so-threatening statement`.

To avoid this problem, there are 2 ways that I know that may save your works too.

## You Don't Have Root Access Way

```
:w /tmp/my-modifications
```

You can save it to another file using `:w <accessible-path>`. Vim will write the current buffer to any path that you define there.

## You Have Root Access Way

```
:w !sudo tee %
```

Then you will be prompted to type your password and the modification will be saved. `:w !sudo tee %` will pass the current buffer to `sudo tee %` command, where `%` is your current filename.

## Conclusion

I believe this problem is annoying to you as well, I hope this article will find you.

Thank you for reading!
