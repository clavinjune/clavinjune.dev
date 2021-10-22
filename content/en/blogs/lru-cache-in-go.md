---
title: "LRU Cache in Go"
date: 2021-02-06T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1580188911874-f95af62924ee?w=1920&q=50"]
aliases: ["/blog/lru-cache-in-go-e7351e"]
description: >
  This post contains notes on how to implementing least recently used (LRU) cache in Golang that has O(1) Time Complexity.
---

{{< unsplash user="@mrthetrain" src="photo-1580188911874-f95af62924ee" q="50" >}}

Two days ago, I failed to implement the optimized LRU cache in coding interview due to panic and stopped by the interviewer. Yes, I suck at coding interviews. I have implemented LRU cache before, so I know how it works and of course know how to implement it. But if you never heard of it, I think [this explanation](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)) is enough.

## Brief definition

LRU Cache is a combination of hash map and queue. Hash map will store the elements by keys and values while the queue keeps track the least recently used keys. We will implement the queue using doubly linked list.

## Rules

1. Track each key usage
2. Set max capacity that LRU cache will handle
3. If the size is over the defined capacity, remove the least recently used data, and store the new data
4. Accessed (get/set) the data means we use the data so mark it as the most recently used data

## Node Structure

Node structure will store the key, value, and its previous & next nodes (doubly linked list).

```go
type Node struct {
  Key   int
  Value int
  Prev  *Node
  Next  *Node
}

func NewNode(key, value int) *Node {
  return &Node{
    Key:   key,
    Value: value,
  }
}
```

## LRU Structure

LRU will store the capacity, size (optional), the stored data, and it will track the most and the least recently used using tail and head pointer. Size is optional since you can use `len(v Type)` method.

```go
type LRU struct {
  capacity int
  size     int
  data     map[int]*Node
  tail     *Node
  head     *Node
}

func NewLRU(capacity int) *LRU {
  return &LRU{
    capacity: capacity,
    size:     0,
    data:     make(map[int]*Node),
  }
}
```

## Queue Operation

### Push Tail

Push tail will append the given node to the queue.

```go
func (l *LRU) pushTail(n *Node) {
  if l.head == nil {
    l.head = n
    l.tail = n
    return
  }

  l.tail.Next = n
  n.Prev = l.tail
  l.tail = n
  l.tail.Next = nil
}
```

### Pop Head

Pop head will remove the head (least recently used) node.

```go
func (l *LRU) popHead() *Node {
  ret := l.head

  if l.head == l.tail {
    l.head = nil
  } else {
    l.head = l.head.Next
    l.head.Prev = nil
  }

  return ret
}
```

### Pop Tail

Pop tail will remove the tail (most recently used) node. We will not use this method directly, but it will be used later whenever user reset the tail value.

```go
func (l *LRU) popTail() *Node {
  ret := l.tail

  if l.head == l.tail {
    l.head = nil
  } else {
    l.tail = l.tail.Prev
    l.tail.Next = nil
  }

  return ret
}
```

### Pop

This Pop method will receive node that we want to pop.

```go
func (l *LRU) pop(n *Node) *Node {
  switch n {
  case l.head:
    return l.popHead()
  case l.tail:
    return l.popTail()
  }

  n.Next.Prev = n.Prev
  n.Prev.Next = n.Next
  return n
}
```

Now all the queue operations has defined, let's implement the main operation of the LRU.

## Set

Set method will store the given value identified by the given key. Remember the 3rd and 4th rules.

> - If the size is over the defined capacity, remove the least recently used data, and store the new data
> - Accessed (get/set) the data means we use the data so mark it as the most recently used data

```go
func (l *LRU) Set(key, value int) {
  // check if the key exists
  // if it exists, we need to remove it
  // then we append it to the queue
  // 4th rule (mark it as the most recently used)
  if val, isOk := l.data[key]; isOk {
    // this is the reason why we need to use popTail
    l.pop(val)
    l.size--
  }

  // 3rd rule
  if l.size >= l.capacity {
    n := l.popHead()
    delete(l.data, n.Key)
    l.size--
  }

  // push new data
  n := NewNode(key, value)
  l.data[key] = n
  l.pushTail(n)
  l.size++
}
```

## Get

Get method will return the stored value depends on the given key. Remember the 4th rule.

> - Accessed (get/set) the data means we use the data so mark it as the most recently used data

```go
func (l *LRU) Get(key int) int {
  val, isOk := l.data[key]

  if !isOk {
    return -1
  }

  // remove it
  l.pop(val)
  // then mark it as the most recently used
  l.pushTail(val)

  return val.Value
}
```

Lastly, to ensure our queue rotation is correct, let's implement the showQueue method.

```go
func (l *LRU) ShowQueue() {
  fmt.Printf("Least ")
  for n := l.head ; n != l.tail ; n = n.Next {
    fmt.Printf("%v -> ", n.Key)
  }

  fmt.Println(l.tail.Key, "Most")
}
```

Let's test it

```go
func main() {
  lru := NewLRU(3)
  lru.Set(1, 1)
  lru.Set(2, 2)
  lru.Set(3, 3)

  // Least 1 -> 2 -> 3 Most
  lru.ShowQueue()

  // 2
  fmt.Println(lru.Get(2))
  // Least 1 -> 3 -> 2 Most
  lru.ShowQueue()

  lru.Set(1, 100)
  // Least 3 -> 2 -> 1 Most
  lru.ShowQueue()

  lru.Set(4, 4)
  // Least 2 -> 1 -> 4 Most
  lru.ShowQueue()
}
```

The whole code should be like this:

```go
package main

import "fmt"

type Node struct {
  Key   int
  Value int
  Prev  *Node
  Next  *Node
}

func NewNode(key, value int) *Node {
  return &Node{
    Key:   key,
    Value: value,
  }
}

type LRU struct {
  capacity int
  size     int
  data     map[int]*Node
  tail     *Node
  head     *Node
}

func NewLRU(capacity int) *LRU {
  return &LRU{
    capacity: capacity,
    size:     0,
    data:     make(map[int]*Node),
  }
}

func (l *LRU) pushTail(n *Node) {
  if l.head == nil {
    l.head = n
    l.tail = n
    return
  }

  l.tail.Next = n
  n.Prev = l.tail
  l.tail = n
  l.tail.Next = nil
}

func (l *LRU) popHead() *Node {
  ret := l.head

  if l.head == l.tail {
    l.head = nil
  } else {
    l.head = l.head.Next
    l.head.Prev = nil
  }

  return ret
}

func (l *LRU) popTail() *Node {
  ret := l.tail

  if l.head == l.tail {
    l.head = nil
  } else {
    l.tail = l.tail.Prev
    l.tail.Next = nil
  }

  return ret
}

func (l *LRU) pop(n *Node) *Node {
  switch n {
  case l.head:
    return l.popHead()
  case l.tail:
    return l.popTail()
  }

  n.Next.Prev = n.Prev
  n.Prev.Next = n.Next
  return n
}

func (l *LRU) Set(key, value int) {
  // check if the key exists
  // if it exists, we need to remove it
  // then we append it to the queue
  // 4th rule (mark it as the most recently used)
  if val, isOk := l.data[key]; isOk {
    // this is the reason why we need to use popTail
    l.pop(val)
    l.size--
  }

  // 3rd rule
  if l.size >= l.capacity {
    n := l.popHead()
    delete(l.data, n.Key)
    l.size--
  }

  // push new data
  n := NewNode(key, value)
  l.data[key] = n
  l.pushTail(n)
  l.size++
}

func (l *LRU) Get(key int) int {
  val, isOk := l.data[key]

  if !isOk {
    return -1
  }

  // remove it
  l.pop(val)
  // then mark it as the most recently used
  l.pushTail(val)

  return val.Value
}

func (l *LRU) ShowQueue() {
  fmt.Printf("Least ")
  for n := l.head; n != l.tail; n = n.Next {
    fmt.Printf("%v -> ", n.Key)
  }

  fmt.Println(l.tail.Key, "Most")
}

func main() {
  lru := NewLRU(3)
  lru.Set(1, 1)
  lru.Set(2, 2)
  lru.Set(3, 3)

  // Least 1 -> 2 -> 3 Most
  lru.ShowQueue()

  // 2
  fmt.Println(lru.Get(2))
  // Least 1 -> 3 -> 2 Most
  lru.ShowQueue()

  lru.Set(1, 100)
  // Least 3 -> 2 -> 1 Most
  lru.ShowQueue()

  lru.Set(4, 4)
  // Least 2 -> 1 -> 4 Most
  lru.ShowQueue()
}
```

Thank you for reading!
