---
category: Development
tags: go data-structure tree
thumbnail: https://images.unsplash.com/photo-1507100403890-47482dcd79e0?w=1920
description: >
  This post contains my own experiences in reviewing my knowledge of BST data structure
---
![Photo by @danfreemanphoto on Unsplash](https://images.unsplash.com/photo-1507100403890-47482dcd79e0?w=1920)

So long since I learned to create BST back then at university. I feel like wanna revisit the BST things, so I make this post. BST is not that scary. You only need to create a tree without duplicated value on each node, then the less valuable nodes go to the left, and then the rest of the nodes go to the right or vice-versa. In this post, I'll make a BST in Go Language with less valuable nodes of integer go to the left. I assume you have a basic knowledge of Go Language and tree data structure.

## Directory Structure

```
$ tree
.
├── bst
│   ├── node.go
│   └── tree.go
├── go.mod
└── main.go
```

I used `tree` command to list down the directory structure (no pun intended).

## Code

Let's make a `node struct` first inside the `node.go` file.

```go
type node struct {
  value       int
  left, right *node
}

func newNode(value int) *node {
  return &node{
    value: val,
    left:  nil,
    right: nil,
  }
}

func (n *node) Value() int {
  return n.value
}

func (n *node) Left() *node {
  return n.left
}

func (n *node) Right() *node {
  return n.right
}
```

I make it unexported so `user` can't use `node struct` directly to avoid data mutability and give it some `getter functions`.

And then make `binarySearchTree struct` inside the `tree.go` file to wrap the usage of the `node`. It stores `pointer of node struct` as a `root` so we can keep track the root fo the tree.

```go
type binarySearchTree struct {
  root *node
}

func New() *binarySearchTree {
  return &binarySearchTree{}
}
```

With current code, we can create the BST like this in `main function`.

```go
func main() {
  tree := bst.New()
}
```

Now we want to give the tree some functionalities such as `insert`, `find`, `traverse`, and `remove`. Let's go with `insert` first. The pseudo-code will be like this.

```
If there's no node, then create a new node.
If a node with same value is already exists inside the tree, returns error.
If the value is greater than current node's value, then insert to the right.
If the value is less than current node's value, then insert to the left.
```

We'll make the function recursive and not directly change the tree value. So if there's happened to be an error, the tree remains the same.

```go
func insertNode(node *node, val int) (*node, error) {
  // if there's no node, create one
  if node == nil {
    return newNode(val), nil
  }

  if node.value == val {
    // if there's duplicated node returns error
    return nil, ErrDuplicatedNode
  }

  if val > node.value {
    // if value is greater than current node's value, insert to the right
    right, err := insertNode(node.right, val)

    if err != nil {
      return nil, err
    }

    node.right = right
  } else if val < node.value {
    // if value is less than current node's value, insert to the left
    left, err := insertNode(node.left, val)

    if err != nil {
      return nil, err
    }

    node.left = left
  }

  return node, nil
}
```

Let's expose the function to the user via the `binarySearchTree struct`.

```go
func (tree *binarySearchTree) Insert(val int) error {
  // always start insert from the root
  root, err := insertNode(tree.root, val)

  if err != nil {
    return err
  }

  tree.root = root
  return nil
}
```

To check whether the value we entered is in the correct position, then we create the traverse function first. There are 3 ways to traverse the tree, `pre-order`, `in-order`, and `post-order`. Here's the difference:

```
# pre-order
1. print current value
2. go recursively to the left
3. go recursively to the right

# in-order
1. go recursively to the left
2. print current value
3. go recursively to the right

# post-order
1. go recursively to the left
2. go recursively to the right
3. print current value
```

To remember it easily, remember when you need to print the current value. if `pre` then print first, if` post` then print at the end, otherwise print in the middle. we're gonna make `in order traverse`, because it will go recursively to the left first and then print the value which means in our case it will print `from least valuable nodes to the greatest`.

```go
func traverse(node *node) {
  // exit condition
  if node == nil {
    return
  }

  traverse(node.left)
  fmt.Println(node.value)
  traverse(node.right)
}

func (tree *binarySearchTree) Traverse() {
  // traverse from the root
  traverse(tree.root)
}
```

Let's check our code first.

```go
func main() {
  tree := bst.New()

  tree.Insert(23)
  tree.Insert(10)
  tree.Insert(15)
  tree.Insert(20)
  tree.Insert(2)
  tree.Insert(25)
  tree.Insert(50)

  tree.Traverse() // 2 10 15 20 23 25 50
}
```

Now that you find your `traverse` results sorted, let's move to the `find` function. To find a specific node you don't have to go around the whole tree, you need to know that BST can route to a specific node by checking the node value. Just like the `insert` function, we only need to go to the left if the node value we are looking for is less than the current node and to the right, if the node value is greater.

```go
func findNode(node *node, val int) *node {
  if node == nil {
    return nil
  }

  // if the node is found, return the node
  if node.value == val {
    return node
  }

  // if value is greater than current node's value, search recursively to the right
  if val > node.value  {
    return findNode(node.right, val)
  }

  // if value is less than current node's value, search recursively to the left
  if val < node.value {
    return findNode(node.left, val)
  }

  return nil
}

func (tree *binarySearchTree) Find(val int) *node {
  // as always, search from the root
  return findNode(tree.root, val)
}
```

Now we return the specified node if there is a node with given value otherwise, we return nil. Since we encapsulate the node attributes and leave the user only with the Getter function, there is no need to worry about data mutability.

Now let's move to the `remove` function. Just like `insert` and `find` function, we need to locate the position of the node first and then do the deletion. There are 3 rules to remove a node from its tree.

```
If the node has no child, then Simply make it nil
If the node has 1 child, then move the child to the node position.
If the node has 2 children, then find the successor and move the successor to the node position.
```

To find the successor of the node there are 2 ways
```
Find the least valueable node from the right child of the node
OR
Find the greatest valueable node from the left child of the node
```

I will use the first approach, `find the least valuable node of the right child node`. To find the least valuable node from the current node, you only need to go to the leftmost node. And to find the most valuable node of the current node, just go to the rightmost node.

```go
func least(node *node) *node {
  if node == nil {
    return nil
  }

  if node.left == nil {
    return node
  }

  return least(node.left)
}

func removeNode(node *node, val int) (*node, error) {
  if node == nil {
    return nil, ErrNodeNotFound
  }

  if val > node.value {
    right, err := removeNode(node.right, val)
    if err != nil {
      return nil, err
    }

    node.right = right
  } else if val < node.value {
    left, err := removeNode(node.left, val)
    if err != nil {
      return nil, err
    }

    node.left = left
  } else {
    if node.left != nil && node.right != nil {
      // has 2 children

      // find the successor
      successor := least(node.right)
      value := successor.value

      // remove the successor
      right, err := removeNode(node.right, value)
      if err != nil {
        return nil, err
      }
      node.right = right

      // copy the successor value to the current node
      node.value = value
    } else if node.left != nil || node.right != nil {
      // has 1 child
      // move the child position to the current node
      if node.left != nil {
        node = node.left
      } else {
        node = node.right
      }
    } else if node.left == nil && node.right == nil {
      // has no child
      // simply remove the node
      node = nil
    }
  }

  return node, nil
}
```

That's all, folks. If I curate the code it will be like this.

## node.go

```go
package bst

import (
  "errors"
  "fmt"
)

var (
  ErrDuplicatedNode error = errors.New("bst: found duplicated value on tree")
  ErrNodeNotFound   error = errors.New("bst: node not found")
)

type node struct {
  value       int
  left, right *node
}

func (n *node) Value() int {
  return n.value
}

func (n *node) Left() *node {
  return n.left
}

func (n *node) Right() *node {
  return n.right
}

func newNode(val int) *node {
  return &node{
    value: val,
    left:  nil,
    right: nil,
  }
}

func insertNode(node *node, val int) (*node, error) {
  // if there's no node, create one
  if node == nil {
    return newNode(val), nil
  }

  if node.value == val {
    // if there's duplicated node returns error
    return nil, ErrDuplicatedNode
  }

  if val > node.value {
    // if value is greater than current node's value, insert to the right
    right, err := insertNode(node.right, val)

    if err != nil {
      return nil, err
    }

    node.right = right
  } else if val < node.value {
    // if value is less than current node's value, insert to the left
    left, err := insertNode(node.left, val)

    if err != nil {
      return nil, err
    }

    node.left = left
  }

  return node, nil
}

func removeNode(node *node, val int) (*node, error) {
  if node == nil {
    return nil, ErrNodeNotFound
  }

  if val > node.value {
    right, err := removeNode(node.right, val)
    if err != nil {
      return nil, err
    }

    node.right = right
  } else if val < node.value {
    left, err := removeNode(node.left, val)
    if err != nil {
      return nil, err
    }

    node.left = left
  } else {
    if node.left != nil && node.right != nil {
      // has 2 children

      // find the successor
      successor := least(node.right)
      value := successor.value

      // remove the successor
      right, err := removeNode(node.right, value)
      if err != nil {
        return nil, err
      }
      node.right = right

      // copy the successor value to the current node
      node.value = value
    } else if node.left != nil || node.right != nil {
      // has 1 child
      // move the child position to the current node
      if node.left != nil {
        node = node.left
      } else {
        node = node.right
      }
    } else if node.left == nil && node.right == nil {
      // has no child
      // simply remove the node
      node = nil
    }
  }

  return node, nil
}

func findNode(node *node, val int) *node {
  if node == nil {
    return nil
  }

  // if the node is found, return the node
  if node.value == val {
    return node
  }

  // if value is greater than current node's value, search recursively to the right
  if val > node.value  {
    return findNode(node.right, val)
  }

  // if value is less than current node's value, search recursively to the left
  if val < node.value {
    return findNode(node.left, val)
  }

  return nil
}

func least(node *node) *node {
  if node == nil {
    return nil
  }

  if node.left == nil {
    return node
  }

  return least(node.left)
}

func traverse(node *node) {
  // exit condition
  if node == nil {
    return
  }

  traverse(node.left)
  fmt.Println(node.value)
  traverse(node.right)
}
```

## tree.go

```go
package bst

type binarySearchTree struct {
  root *node
}

func New() *binarySearchTree {
  return &binarySearchTree{}
}

func (tree *binarySearchTree) Insert(val int) error {
  // always start insert from the root
  root, err := insertNode(tree.root, val)

  if err != nil {
    return err
  }

  tree.root = root
  return nil
}

func (tree *binarySearchTree) Remove(val int) error {
  root, err := removeNode(tree.root, val)

  if err != nil {
    return err
  }

  tree.root = root
  return nil
}

func (tree *binarySearchTree) Find(val int) *node {
  // as always, search from the root
  return findNode(tree.root, val)
}

func (tree *binarySearchTree) Traverse() {
  // traverse from the root
  traverse(tree.root)
}
```

## main.go

```go
package main

import (
  "learn/bst"
)

func main() {
  tree := bst.New()

  tree.Insert(23)
  tree.Insert(10)
  tree.Insert(15)

  tree.Remove(10)

  tree.Insert(20)
  tree.Insert(2)
  tree.Insert(25)

  tree.Remove(25)
  tree.Remove(23)
  tree.Insert(50)

  tree.Traverse() // 2 15 20 50
}
```