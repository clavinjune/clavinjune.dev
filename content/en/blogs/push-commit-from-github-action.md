---
title: "Push Commit From Github Action"
date: 2022-04-24T00:00:01+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #14 push commit from github action"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #14 push commit from github action" >}}

```yaml
name: example
on: push
jobs:
  example:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - run: |
        git config --global user.name '<user.name>'
        git config --global user.email '<user.email>'
        git add .
        git commit -snm "<commit message>" || true
        git push origin <branch> || true
```