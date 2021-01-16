---
category: Notes
title: Python Format Specifier for Thousands Separator
tags: python number format
thumbnail: https://images.unsplash.com/photo-1457904375453-3e1fc2fc76f4?w=1920
description: >
  This post contains notes how to formatting python using thousands separator
---

![Photo by @volkanolmez on Unsplash](https://images.unsplash.com/photo-1457904375453-3e1fc2fc76f4?w=1920)

I hate to say this, but I forgot this one-liner syntax in my online coding test. So, I think I need to put this here.

```python
format = lambda n: '{:,}'.format(n)
print(format(-1234567890)) # -1,234,567,890
```