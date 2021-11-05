---
title: "Python Format Specifier Thousands Separator"
date: 2021-01-16T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1457904375453-3e1fc2fc76f4?w=1920&q=50"]
aliases: ["/blog/python-format-specifier-thousands-separator-ed92cc"]
description: "This post contains notes how to formatting python using thousands separator"
---

{{< unsplash user="@volkanolmez" src="photo-1457904375453-3e1fc2fc76f4" q="50" >}}

I hate to say this, but I forgot this one-liner syntax in my online coding test. So, I think I need to put this here.

```python
format = lambda n: '{:,}'.format(n)
print(format(-1234567890)) # -1,234,567,890
```

Thank you for reading!
