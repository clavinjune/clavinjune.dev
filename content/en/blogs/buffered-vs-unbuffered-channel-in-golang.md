---
title: "Buffered vs Unbuffered Channel in Golang"
date: 2021-01-24T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1499159058454-75067059248a?w=1920&q=50"]
aliases: ["/blog/buffered-vs-unbuffered-channel-in-golang-dc97bf"]
description: >
  This post contains notes about the differences between buffered and unbuffered channel in golang.
---

{{< unsplash user="@quinoal" src="photo-1499159058454-75067059248a" w="1920" q="50" >}}

## Small talk about channel

If we talk about concurrency in Golang, Golang provides us with a type of concurrency communication called `Channel`. Channel itself helps us to communicate between goroutines. We can send and receive messages from one goroutine to another. There are two types of channel in golang that we can used and let's talk about them.

## Unbuffered Channel

`Unbuffered channel` is a channel that `initially has no capacity` to store message inside it. `Unbuffered channel` requires us to fill the message in order to make the goroutine process unblocked by the channel. For example:

```go
package main

import (
  "fmt"
  "time"
)

func access(ch chan int) {
  time.Sleep(time.Second)
  fmt.Println("start accessing channel\n")

  for i := range ch {
    fmt.Println(i)
    time.Sleep(time.Second)
  }
}

func main() {
  ch := make(chan int)
  defer close(ch)

  go access(ch)

  for i := 0; i < 9; i++ {
    ch <- i
    fmt.Println("Filled")
  }

  time.Sleep(3 * time.Second)
}

```

In the example above, our main function blocked when filling `ch` one by one. And our `access function` will print the message filled by `main function` one by one also because of the for loop.

Here is the output of the example above:

```bash
$ go run chan.go 
start accessing channel

0
Filled
1
Filled
2
Filled
3
Filled
4
Filled
5
Filled
6
Filled
7
Filled
8
Filled
```

## Buffered Channel

Unlike the Unbuffered Channel, `Buffered Channel` has a capacity to store messages inside it. `Buffered Channel` could be filled up to its defined capacity, not only one message. For example:

```go
package main

import (
  "fmt"
  "time"
)

func access(ch chan int) {
  time.Sleep(time.Second)
  fmt.Println("start accessing channel\n")

  for i := range ch {
    fmt.Println(i)
    time.Sleep(time.Second)
  }
}

func main() {
  // only modify this line to defined the capacity
  ch := make(chan int, 3)
  defer close(ch)

  go access(ch)

  for i := 0; i < 9; i++ {
    ch <- i
    fmt.Println("Filled")
  }

  time.Sleep(3 * time.Second)
}
```

Here is the output:

```bash
$ go run chan.go
Filled
Filled
Filled
start accessing channel

0
Filled
1
Filled
2
Filled
3
Filled
4
Filled
5
Filled
6
7
8
```

As you can see, the `ch` could be filled first until it is full-capacity then the other goroutine could access it one by one.

## Differences

`Unbuffered Channel` has no capacity initially, but `Buffered Channel` has a capacity.

`Unbuffered Channel` will block the goroutine whenever `it is empty and waiting to be filled`. But `Buffered Channel` will also block the goroutine either when `it is empty and waiting to be filled` or `it's on its full-capacity and there's a statement that want to fill the channel`.

## Capacity

```go
unbuffered := make(chan int)

buffered := make(chan int, 30)
```

## Empty and Waiting to be filled

`Both Buffered and Unbuffered` channel blocks the goroutine until it is filled in this case blocks for a second.

```go
func main() {
  ch := make(chan int)
  defer close(ch)

  go func(ch chan int) {
    time.Sleep(time.Second)
    ch <- 1
  }(ch)

  <-ch
}
```

## Full Capacity and there's statement that want to fill the channel

Only `Buffered` channel blocks on `ch <- 2` because the `ch` is on its full capacity and waiting to be released. The `Unbuffered Channel` will go deadlock this time because there's no goroutine accessing the message `2` but it is filled.

```go
func main() {
  ch := make(chan int, 1)
  defer close(ch)

  go func(ch chan int) {
    time.Sleep(time.Second)
    <-ch
  }(ch)

  ch <- 1
  ch <- 2
}
```

Thank you for reading!
