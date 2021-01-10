---
title: Greatest Common Divisor and Least Common Multiplier
category: Notes
tags: go algorithm math
thumbnail: https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=1920
description: >
  This post contains notes about how to create pow function and find greatest common divisor & least common multiplier
---

![Photo by @roman_lazygeek on Unsplash](https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=1920)

I only rewrite what was written on my [pastebin](https://pastebin.com/eDNgaM7F)

```go
package main

import "fmt"

func findGCD(a, b int) int {
  if b == 0 {
    return a
  }

  return findGCD(b, a%b)
}

func findLCM(a, b int) int {
  return a * b / findGCD(a, b)
}

func main() {
  fmt.Println(findGCD(25, 100))
  fmt.Println(findLCM(25, 100))
}
```