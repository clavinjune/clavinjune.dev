---
title: "Find Git Branching Point Between Branch"
date: 2022-06-05T00:00:17+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #20 find git branching point between branch"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #20 find git branching point between branch" >}}


```shell
➜  pet git:(master) git --no-pager log --oneline -1
2422e70 (HEAD -> master, origin/master) update README.md
➜  pet git:(master) gcob testing
Switched to a new branch 'testing'
➜  pet git:(testing) git commit --allow-empty -sam "first"
[testing 8210c2d] first
➜  pet git:(testing) git commit --allow-empty -sam "second"
[testing feb9b4f] second
➜  pet git:(testing) git commit --allow-empty -sam "third"
[testing 7120047] third
➜  pet git:(testing) git --no-pager log --oneline -4
7120047 (HEAD -> testing) third
feb9b4f second
8210c2d first
2422e70 (origin/master, master) update README.md
# how to get this branching point (2422e70) from `testing` branch?
# git rev-list --boundary branch1...branch2 | grep "^-" | cut -c2-
➜  pet git:(testing) git rev-list --boundary testing...master  | grep "^-" | cut -c2-
2422e70001b80d186fdd1df1a9227dc3d8e0061e
```