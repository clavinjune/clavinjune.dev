---
title: "Fetch Current Script Tag Attributes in Javascript"
date: 2022-11-25T19:23:00+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1553524913-efba3f0b533e?w=1920&q=50"]
aliases: []
description: "fetching current script tag attributes in Javasvript"
---

{{< unsplash user="@markusspiske" src="photo-1553524913-efba3f0b533e" q="50" >}}

## Introduction

Javascript is a language with thousands of users and modules. Every single thing that you think you may not want, it's there. Starts from a simple module like [is-odd](https://www.npmjs.com/package/is-odd), [jquery](https://www.npmjs.com/package/jquery), until [svelte](https://www.npmjs.com/package/svelte). Javascript is a native way to do scripting in browser. Sometimes, you may need to create simple javascript module for your day to day works or maybe just for fun. To import your plain old javascript inside your HTML project, you can simply use the OG `<script>` tag. But, do you know that you can put custom attributes and access it inside your script?

## Example

For example, let's take a look at this [giscuss.app](https://giscus.app/) script tag:

```html {hl_lines="2-12"}
<script src="https://giscus.app/client.js"
        data-repo="[ENTER REPO HERE]"
        data-repo-id="[ENTER REPO ID HERE]"
        data-category="[ENTER CATEGORY NAME HERE]"
        data-category-id="[ENTER CATEGORY ID HERE]"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        crossorigin="anonymous"
        async>
</script>
```

The highlighted attributes are called [dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset). It's a custom attributes that you can put to HTML elements. As long as you use `data-` as a prefix, it's considered as dataset. You can also put your custom elements/attributes without `data-` prefixed, but it's just an attribute, not dataset. Now, how do you fetch the attributes value?

## Code

Let's say you have `index.js` script that you import to your code like below:

```html
<script
    src="./index.js"
    data-attr1="val1"
    data-attr2="val2"
    attr3="val3"
    attr4="val4">
</script>
```

To access `data-attr1`, `data-attr2`, `attr3`, and `attr4` you can do this inside `index.js`:

```javascript
// fetch current script tag that import this script
const script = document.currentScript

const dataset = script.dataset
const attr1 = dataset.attr1
const attr2 = dataset.attr2

const attributes = script.attributes
const attr3 = attributes.getNamedItem('attr3').value
const attr4 = attributes.getNamedItem('attr4').value
```

As for the dataset, the `data-` prefix will be removed. But for the rests, it is considered as common attributes just like `src`.

## Conclusion

Now you can get your user input from attributes, just think of it like function arguments. It's simple and straightforward. Although you can choose between 2 methods above, I recommend you to use the `dataset` since it is more semantic than just a plain attribute.

Thank you for reading!
