---
category: Development
title: Max Heap in Go
tags: go data-structure heap
thumbnail: https://images.unsplash.com/photo-1532543307581-8b01a7ff954f?w=1920
description: >
  This post contains my own experiences in reviewing my knowledge of Max / Min Heap data structure
---
![Photo by @freestocks on Unsplash](https://images.unsplash.com/photo-1532543307581-8b01a7ff954f?w=1920)

Same as the case [here](https://clavinjune.dev/blog/binary-search-tree-in-go-0f34cd/), I just wanted to revisit another data structure. Well, Max Heap (also Min Heap) is a data structure that commonly used to create a priority queue which also a complete binary tree that has nodes which value is greater (or lesser) than its children value.

Not like BST that I implemented before, Max Heap commonly implemented using array in order to make it easier (I think) to access its children. To accessing each nodes parent or children you can visualize the whole array as a tree. I have no image for it, so I pick Max Heap image from another website. The concept is the same with Min Heap tho.


![Photo by opengenus.org](https://iq.opengenus.org/content/images/2019/06/Max-Heap.png)

Finally we start array from 1 (LOL). Why we start from 1? Because index 0 couldn't be accessed by this formula.

Refer to the provided image above, we can visualize that left child of a node is on the `currentIndex * 2`, the right child is on the `currentIndex * 2 + 1`, and you can access the parent of the node by using `currentIndex / 2`.

For example, Node with value `15`, has 2 children which are `10` and `5`. You can see the index of `15` which is `3`. Its left child is `10` which has index `3 * 2 = 6`, and its right children is `5` which has index `3 * 2 + 1 = 7`.

Enough with the theory, you can read it from your book. I only want to write the implementation here using Go. I only implement `Push`, `Pop`, and `Peek` operation. It's hard to decide the name of the operation, but as long as it describes the operation please don't mind.

## Define MaxHeap Struct

```go
type MaxHeap struct {
  heap     []int
  capacity int
  size     int
  root     int
}
```

MaxHeap will have at least size, capacity, and heap itself. `root` attribute will be `constant` since its root should always be `1`. `size` will define the current size of the heap, `capacity` will define how much the heap can store data, and the `heap` itself is an array that we stored the data into.

## Constructor

```go
func NewMaxHeap(capacity int) *MaxHeap {
  // because we used the 0 index
  // we need to increase the capacity defined by user
  c := capacity + 1
  h := make([]int, c, c)

  // just to mark that it is the minimum one,
  // you can ignore this
  h[0] = (1 << 31) - 1

  return &MaxHeap{
    root:     1, // always 1, you can omit this attribute
    size:     0,
    capacity: c,
    heap:     h,
  }
}
```

## Helper Method

```go
func (MaxHeap) getParent(idx int) int {
  return idx / 2
}

func (MaxHeap) getLeft(idx int) int {
  return idx * 2
}

func (MaxHeap) getRight(idx int) int {
  return idx*2 + 1
}

func (m *MaxHeap) swap(idx1, idx2 int) {
  m.heap[idx1], m.heap[idx2] = m.heap[idx2], m.heap[idx1]
}

func (m MaxHeap) String() string {
  return fmt.Sprintf(`size:     %v
capacity: %v
heap:     %v`,
    m.size, m.capacity-1, m.heap[1:])
}
```

## Push

Push into max / min heap should be easy, just put the element where it belongs according to the index, and check if its value is greater / lesser than its parent, if you're implementing max heap, check whether its value is greater than its parent, if so swap its value with its parent value.

```go
func (m *MaxHeap) Push(element int) {
  // check whether it can store the element
  if m.size >= m.capacity-1 {
    return
  }

  m.size++
  idx := m.size

  // put it according to the index
  m.heap[idx] = element

  parent := m.getParent(idx)
  
  // check if its value is greater than its parent
  for m.heap[idx] > m.heap[parent] {
    // then swap
    m.swap(idx, parent)

    // repeat the process until
    // the greatest value is on the top
    idx = parent
    parent = m.getParent(idx)
  }
}
```

## Peek

Peek operation will return the greatest / least value which is the root.

```go
func (m MaxHeap) Peek() (int, error) {
  if m.size <= 0 {
    return (1 << 31) - 1, fmt.Errorf("max-heap: heap is empty")
  }

  return m.heap[m.root], nil
}
```

Let's check our heap

```go
func main() {
  h := NewMaxHeap(15)
  h.Push(1)
  h.Push(4)
  h.Push(2)
  h.Push(5)

  fmt.Println(h)
  g, _ := h.Peek()
  fmt.Println("greatest:", g)
}
```

The output should be like this:

```
size:     4
capacity: 15
heap:     [5 4 2 1 0 0 0 0 0 0 0 0 0 0 0]
greatest: 5
```

## Pop

Now let's pop something. Popping operation will return value of the greatest / least value and delete it from the heap. We need to rebalance the heap So the greatest / least value will be the root again.

```go
func (m *MaxHeap) rebalance(idx int) {
  // don't rebalance if node index
  // is greater than heap size
  if idx >= m.size {
    return
  }

  // fetch the left child index
  left := m.getLeft(idx)

  // fetch the right child index
  right := m.getRight(idx)

  // only swap if children position is wrong
  // and only the children index is less than heap size
  // and then rebalance it
  if left <= m.size {
    if m.heap[idx] < m.heap[left] {
      m.swap(idx, left)
      m.rebalance(left)
    }
  }

  if right <= m.size {
    if m.heap[idx] < m.heap[right] {
      m.swap(idx, right)
      m.rebalance(right)
    }
  }
}

func (m *MaxHeap) Pop() (int, error) {
  if m.size <= 0 {
    return (1 << 31) - 1, fmt.Errorf("max-heap: heap is empty")
  }

  // fetch the root
  max := m.heap[m.root]
  // make the route is the last element in the heap
  m.heap[m.root] = m.heap[m.size]
  // make it zero value
  m.heap[m.size] = 0
  // decrease the size so the zero value won't be counted
  m.size--

  // rebalance the heap
  m.rebalance(m.root)

  // return the greatest
  return max, nil
}
```

So whenever Pop operation is called, the heap will rebalance it from the top until its leaf. The whole code should be look like this:

```go
package main

import "fmt"

type MaxHeap struct {
  heap     []int
  capacity int
  size     int
  root     int
}

func (MaxHeap) getParent(idx int) int {
  return idx / 2
}

func (MaxHeap) getLeft(idx int) int {
  return idx * 2
}

func (MaxHeap) getRight(idx int) int {
  return idx*2 + 1
}

func (m *MaxHeap) swap(idx1, idx2 int) {
  m.heap[idx1], m.heap[idx2] = m.heap[idx2], m.heap[idx1]
}

func (m MaxHeap) String() string {
  return fmt.Sprintf(`size:     %v
capacity: %v
heap:     %v`,
    m.size, m.capacity-1, m.heap[1:])
}

func (m *MaxHeap) rebalance(idx int) {
  if idx >= m.size {
    return
  }

  left := m.getLeft(idx)
  right := m.getRight(idx)

  if left <= m.size {
    if m.heap[idx] < m.heap[left] {
      m.swap(idx, left)
      m.rebalance(left)
    }
  }

  if right <= m.size {
    if m.heap[idx] < m.heap[right] {
      m.swap(idx, right)
      m.rebalance(right)
    }
  }
}

func (m *MaxHeap) Pop() (int, error) {
  if m.size <= 0 {
    return (1 << 31) - 1, fmt.Errorf("max-heap: heap is empty")
  }

  // fetch the root
  max := m.heap[m.root]
  // make the route is the last element in the heap
  m.heap[m.root] = m.heap[m.size]
  // make it zero value
  m.heap[m.size] = 0
  // decrease the size so the zero value won't be counted
  m.size--

  // rebalance the heap
  m.rebalance(m.root)

  // return the greatest
  return max, nil
}

func (m MaxHeap) Peek() (int, error) {
  if m.size <= 0 {
    return (1 << 31) - 1, fmt.Errorf("max-heap: heap is empty")
  }

  return m.heap[m.root], nil
}

func (m *MaxHeap) Push(element int) {
  // exceed the limit
  if m.size >= m.capacity-1 {
    return
  }

  m.size++
  idx := m.size

  m.heap[idx] = element

  parent := m.getParent(idx)

  for m.heap[idx] > m.heap[parent] {
    m.swap(idx, parent)

    idx = parent
    parent = m.getParent(idx)
  }
}

func NewMaxHeap(capacity int) *MaxHeap {
  // because we used the 0 index
  // we need to increase the capacity defined by user
  c := capacity + 1
  h := make([]int, c, c)

  // just to mark that it is the minimum one,
  // you can ignore this
  h[0] = (1 << 31) - 1

  return &MaxHeap{
    root:     1, // always 1, you can omit this attribute
    size:     0,
    capacity: c,
    heap:     h,
  }
}

func main() {
  h := NewMaxHeap(15)
  h.Push(1)
  h.Push(4)
  h.Push(2)
  h.Push(5)
  h.Push(3)
  h.Push(10)

  fmt.Println(h.Pop())
  fmt.Println(h.Pop())
  fmt.Println(h.Pop())
  h.Push(11)

  fmt.Println(h)
}
```