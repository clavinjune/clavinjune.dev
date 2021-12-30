---
title: "Serving Embedded Static File Inside Subdirectory Using Go"
date: 2021-12-30T11:59:30+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=1920&q=50"]
aliases: []
description: "serving static file inside subdirectory using embed package in Go"
---

{{< unsplash user="@iammrcup" src="photo-1461360228754-6e81c478b882" q="50" >}}

## Introduction

As `embed` package released on Golang v1.16, now you can include any of your files into your golang binary. You can also serve the embedded file as a static site. But when it comes to subdirectory, you need to handle it a bit different.

In this article, you will learn how to serve embedded files as a static site that stored inside a subdirectory.

## Directory Structure

```bash
$ tree .
.
├── frontend
│   └── public
│       ├── assets
│       │   ├── css
│       │   │   └── style.css
│       │   └── js
│       │       └── index.js
│       └── index.html
├── go.mod
└── main.go
```

## HTML Content

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <script src="/assets/js/index.js"></script>
</body>
</html>
```

To test if the `assets` can be imported using `absolute` and `relative` URL, you can write the `link rel` and `script src` like the snippet above. You can put anything inside your `style.css` and `index.js` just to make sure it is loaded.

## The Problem

Before `embed` package is released, you used to use `http.Dir` to serve a static site using Go like below:

```go
package main

import (
    "net/http"
)

func dirHandler() http.Handler {
    return http.FileServer(http.Dir("frontend/public"))
}

func main() {
    http.ListenAndServe(":8000", dirHandler())
}
```

And yes, it works like a charm. But, when it comes to `embed`:

```go
package main

import (
    "embed"
    "net/http"
)

//go:embed frontend/public
var public embed.FS

func fsHandler() http.Handler {
    return http.FileServer(http.FS(public))
}

func main() {
    http.ListenAndServe(":8000", fsHandler())
}
```

It doesn't work because you didn't specified which subdirectory will be served. `http.FS` will serve the embedded files from `root`, that's why instead of `http://localhost:8000/`, you need to access it using `http://localhost:8000/frontend/public/`.

But the other problem is, it makes your `absolute` import not working. `/assets/js/index.js` will not work because it accesses the file from the `root`.

## The Solution

To solve those problems, you can use `fs.Sub` to get the subtree of the `embedded` files. So you can start get the `frontend/public` directory as a root.

```go
//go:embed frontend/public
var public embed.FS

func fsHandler() http.Handler {
    sub, err := fs.Sub(public, "frontend/public")
    if err != nil {
        panic(err)
    }

    return http.FileServer(http.FS(sub))
}
```

Now, you can access the site using `http://localhost:8000/` and both your `relative` and `absolute` import works again!

Thank you for reading!
