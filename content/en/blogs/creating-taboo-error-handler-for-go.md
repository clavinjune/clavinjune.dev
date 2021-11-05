---
title: "Creating Taboo Error Handler for Go"
date: 2020-10-28T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1525785967371-87ba44b3e6cf?w=1920&q=50"]
aliases: ["/blog/creating-taboo-error-handler-for-go-f8e220"]
description: "This post contains my own experience in creating try-catch-like error handler for golang"
---

{{< unsplash user="@hhh13" src="photo-1525785967371-87ba44b3e6cf" q="50" >}}

I created [this module](https://github.com/anon-org/taboo) for Golang to help me with error handling. This idea showed when a colleague of mine was thinking to pass `context` from handler to service, to repository to trace the error log more verbose. I disagreed with him because I thought that's not what `context` is for. Perhaps I was wrong or he was wrong, or maybe both of us wrong because this is our first Golang project that deployed on production.

Despite our opinion about `context`, we both agreed that Golang's error handling is too verbose and bulky. It makes us read more error handling more than read the system flow itself. Then I remember when I was coding using Java/Kotlin that I always use `throws`, `throw`, and `try-catch block` to handle any errors.

Hmm...

Why don't I create it for Golang?

Then I create this `try-catch block` module for Golang called `taboo`. Because I know this thing creates polemic among Golang developer but, then I thought why don't I give it a try?

For the design itself, I was inspired by [this article](https://hackthology.com/exceptions-for-go-as-a-library.html) but the whole implementation is all adjusted with my current needs. Instead of `error`, this module is based on `panic` and `recover` so it is quite dangerous whenever used in the wrong condition.

Let's take an example:

```go
package main

func div(a, b int) int {
  return a / b
}

func main() {
  div(10, 0)
}
```

When `b` is filled with `zero`, it causes panic

```plain
panic: runtime error: integer divide by zero

goroutine 1 [running]:
main.div(...)
        /tmp/anon-org/taboo/cmd/example.go:4
main.main()
        /tmp/anon-org/taboo/cmd/example.go:8 +0x12

Process finished with exit code 2
```

So, we can handle it using `taboo` like this:

```go
taboo.Try(func() {
  div(10, 0)  
}).Catch(func(e *taboo.Exception) {
  fmt.Println(e.Error())
}).Do()
```

`taboo` will catch the `panic` and try to `recover` it and make a stack of error called `taboo.Exception` to trace error more verbose. So the program ends like this:

```plain
main.div:9 runtime error: integer divide by zero

Process finished with exit code 0
```

Quite handy right?

Then, what if I want to throw or rethrow the error to the first caller?

```go
package main

import (
  "errors"
  "fmt"
  "github.com/anon-org/taboo/pkg/taboo"
)

func div(a, b int) int {
  if b == 0 {
    taboo.Throw(errors.New("division by zero detected"))
  }
  return a / b
}

func callDiv() int {
  var result int

  taboo.Try(func() {
    result = div(10, 0)
  }).Catch(func(e *taboo.Exception) {
    e.Throw("callDiv rethrow this error")
  }).Do()

  return result
}

func callCallDiv() int {
  var result int

  taboo.Try(func() {
    result = callDiv()
  }).Catch(func(e *taboo.Exception) {
    e.Throw("callCallDiv rethrow this error")
  }).Do()

  return result
}

func main() {
  taboo.Try(func() {
    callCallDiv()
  }).Catch(func(e *taboo.Exception) {
    fmt.Println(e.Error())
  }).Do()
}
```

`e.Throw(message)` Will wrap the previous exception, and throw it again to the previous caller. So the printed error will be like this:

```plain
main.callCallDiv:34 callCallDiv rethrow this error caused by:
  main.callDiv:22 callDiv rethrow this error caused by:
    main.div:11 division by zero detected

Process finished with exit code 0
```

It just like `try-catch block` in Java/Kotlin I think but with many flaws lol. This module is still an experiment that I myself is not going to using this module in production. Or perhaps should I?

Thank you for reading!
