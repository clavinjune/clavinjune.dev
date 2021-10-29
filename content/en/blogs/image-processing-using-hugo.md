---
title: "Image Processing Using Hugo"
date: 2021-10-25T15:34:44+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1513434007132-241c9f0ecb56?w=1920&q=50"]
aliases: []
description: >
  Implementing image processing using hugo and shortcodes
---

{{< unsplash user="@pascalwhoop" src="photo-1513434007132-241c9f0ecb56" q="50" >}}

## Introduction

Since I migrated [this blog](https://clavinjune.dev) from Jekyll to Hugo, I want to try all the features provided by Hugo. One of the features is image processing. It could help me to develop a mobile-friendly blog. An image processing might help you, who read these contents from a smartphone which might have a slow internet connection to load images faster.

Though I developed this blog as minimal as possible, processing an image might be a problem. That's where Hugo's feature helps me to create a solution for this problem. In this article, you will learn to implement image processing using Hugo.

## Shortcodes

Shortcodes is one of Hugo's feature that could help to reuse the implementation of image processing easily. You may want to read more about shortcodes [here](https://gohugo.io/content-management/shortcodes/). Now let's create one.

You may create your shortcodes in your Hugo project at either one of these paths:

1. `/layouts/shortcodes/<name>.html`
2. `/themes/<theme>/layouts/shortcodes/<name>.html`

You can create the shortcodes at `/layouts/shortcodes/img.html`.

```go
{{- $src := .Get "src" -}}
{{- $alt := .Get "alt" -}}

<figure>
  <img
    src="{{ $src }}"
    alt="{{ $alt }}"
    width="100%"
    height="auto"/>
  <figcaption>{{ $alt }}</figcaption>
</figure>
```

Let's say you have put your images in [Hugo's assets directory](https://gohugo.io/hugo-pipes/introduction/#asset-directory). For example, you put your image file in `/assets/img/testing/ehe.png`, and then you can use it at your content like this:

```go
{{</* img src="/img/testing/ehe.png" alt="alt" */>}}
```

At the moment, Hugo will not render it yet. Let's adjust the shortcode so it will render the image.

```go
{{- $alt := .Get "alt" -}}
{{- $res := resources.GetMatch (.Get "src") -}}

<figure>
  <img
    src="{{ $res.RelPermalink }}"
    alt="{{ $alt }}"
    width="100%"
    height="auto"/>
  <figcaption>{{ $alt }}</figcaption>
</figure>
```

Now your image is rendered. Let's create multiple versions of it with different widths.

## Widths

Now define the widths you want to render. For example:

```go {linenostart=2}
...

{{- $ws := slice 480 768 1366 1920 -}}

...
```

Then, iterate over it with [Hugo's resize function](https://gohugo.io/content-management/image-processing/#resize).

```go {linenostart=2}
...

{{- range $ws -}}
    {{- $w := printf "%dx" . -}}
    {{- ($res.Resize $w).RelPermalink | safeURL -}}
{{- end -}}

...
```

Now you will get the output similar to this:

```plain {linenos=false}
/img/testing/ehe_hudb6c5cbc207f47e5a1b3b7a3072e7a12_81266_480x0_resize_box_3.png
/img/testing/ehe_hudb6c5cbc207f47e5a1b3b7a3072e7a12_81266_768x0_resize_box_3.png
/img/testing/ehe_hudb6c5cbc207f47e5a1b3b7a3072e7a12_81266_1366x0_resize_box_3.png
/img/testing/ehe_hudb6c5cbc207f47e5a1b3b7a3072e7a12_81266_1920x0_resize_box_3.png
```

Those are your processed image URL with every width which you defined before. Now let's use them inside your image's source sets.

## Source Set

To define `srcset attribute` on your image, you can use this [format](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset):

```html
<img srcset="
/url/to/480.png 480w,
/url/to/768.png 768w,
/url/to/1366.png 1366w,
/url/to/1920.png 1920w
" alt="alt">
```

Let's generate it inside your shortcodes.

```go {linenostart=2}
...

{{- $ws := slice 480 768 1366 1920 -}}
{{- $srcset := slice -}}
{{- range $ws -}}
    {{/* to avoid creating an image that is larger than the source */}}
    {{- if (le . $res.Width) -}}
        {{- $w := printf "%dx" . -}}
        {{- $url := ($res.Resize $w).RelPermalink | safeURL -}}
        {{- $fmt := printf "%s %dw" $url . -}}
        {{- $srcset = $srcset | append $fmt -}}
    {{- end -}}
{{- end -}}

...
```

Now you have your `srcset` format in a slice. You can join them using `Hugo's delimit function`.

```go {linenostart=14}
...

{{- $set := delimit $srcset "," -}}

...
```

Then, use it as `srcset attribute`.

```html {linenostart=16}
...

<figure>
  <img
    srcset="{{ $set }}"
    src="{{ $res.RelPermalink }}"
    alt="{{ $alt }}"
    width="100%"
    height="auto"/>
  <figcaption>{{ $alt }}</figcaption>
</figure>
```

Lastly, let's make the HTML render the image according to the viewport width.

## sizes

To define `sizes attribute` on your image, you can use this [format](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes):

```html {linenostart=16}
...

<figure>
  <img
    srcset="{{ $set }}"
    sizes="(max-width: 480px) 480px, 100vw"
    src="{{ $res.RelPermalink }}"
    alt="{{ $alt }}"
    width="100%"
    height="auto"/>
  <figcaption>{{ $alt }}</figcaption>
</figure>
```

Here is the complete source code of `/layouts/shortcodes/img.html`:

```go
{{- $alt := .Get "alt" -}}
{{- $res := resources.GetMatch (.Get "src") -}}

{{- $ws := slice 480 768 1366 1920 -}}
{{- $srcset := slice -}}
{{- range $ws -}}
    {{/* to avoid creating an image that is larger than the source */}}
    {{- if (le . $res.Width) -}}
        {{- $w := printf "%dx" . -}}
        {{- $url := ($res.Resize $w).RelPermalink | safeURL -}}
        {{- $fmt := printf "%s %dw" $url . -}}
        {{- $srcset = $srcset | append $fmt -}}
    {{- end -}}
{{- end -}}

{{- $set := delimit $srcset "," -}}

<figure>
  <img
    srcset="{{ $set }}"
    sizes="(max-width: 480px) 480px, 100vw"
    src="{{ $res.RelPermalink }}"
    alt="{{ $alt }}"
    width="100%"
    height="auto"/>
  <figcaption>{{ $alt }}</figcaption>
</figure>
```

Now if you build your Hugo site, you will see your images is auto-generated.

```bash {linenos=false}
$ tree img/
img/
└── testing
    ├── ehe_hudb6c5cbc207f47e5a1b3b7a3072e7a12_81266_1366x0_resize_box_3.png
    ├── ehe_hudb6c5cbc207f47e5a1b3b7a3072e7a12_81266_480x0_resize_box_3.png
    ├── ehe_hudb6c5cbc207f47e5a1b3b7a3072e7a12_81266_768x0_resize_box_3.png
    └── ehe.png

1 directory, 4 files
```

Thank you for reading!
