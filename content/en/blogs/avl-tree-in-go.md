---
title: "AVL Tree in Go"
date: 2020-11-15T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1561900478-5001f6b4d8ed?w=1920&q=50"]
aliases: []
description: "This post contains my own experiences in Modifying the BST Code to AVL"
---

{{< unsplash user="@loicleray" src="photo-1561900478-5001f6b4d8ed" q="50" >}}

After I tried to implement [BST in Go](/blogs/binary-search-tree-in-go/), it seems like I want to modify the BST to AVL because BST is not a fairly optimal tree data structure.

When I said this:

> To find a specific node you don't have to go around the whole tree, you need to know that BST can route to a specific node by checking the node value

It's half true because there's a case that BST makes a linear tree like this:

![linear tree](/img/avl-tree-in-go/linear-tree.png)

And if you want to find a node with value 6, in the end, you will travel the whole tree. That’s why we need AVL to improve the time complexity. AVL will try to rebalance the tree whenever it becomes imbalance after insertion/deletion.

The whole concept of AVL is much the same with BST besides the rebalancing algorithm. In AVL we need to rebalance the tree by rotating every imbalance sub-tree in every insertion/deletion. So we're gonna use all the code from [here](/blogs/binary-search-tree-in-go/) and modified it a bit.

To see the tree is balanced or not, we need to define the height on each node. We can calculate the height by counting the maximum height of the left and the right node recursively. If the node has no child, it means its height is 1 otherwise we compare the maximum height of the children.

Update the `node struct` by adding the `height` attribute, add the `Getter` function, and set the value to 1 inside the constructor.

```go
type node struct {
  height, value int
  left, right   *node
}

func (n *node) Height() int {
  if n == nil {
    return 0
  }

  return n.height
}

func newNode(val int) *node {
  return &node{
    height: 1,
    value:  val,
    left:   nil,
    right:  nil,
  }
}
```

And to keep track of the height and the balance of the tree after insertion/deletion, we need to have a `updateHeight` and `balanceFactor` function.

```go
func (n *node) balanceFactor() int {
  if n == nil {
    return 0
  }

  return n.left.Height() - n.right.Height()
}

func max(a, b int) int {
  if a > b {
    return a
  }
  return b
}

func (n *node) updateHeight() {
  // compare the maximum height of the children + its own height
  n.height = max(n.left.Height(), n.right.Height()) + 1
}
```

`balanceFactor` function determines whether the tree is heavier on the left or the right side. If it returns an integer below 0, it means it's heavier on the right side and we need to rotate to the left side of the tree. The thresholds for imbalanced tree are -1 and 1, so if the `balanceFactor` function returns less then -1 or greater than 1, we need to rotate the tree.

Now let's create the rotate function. There are 2 types of rotate, `rotateLeft` and `rotateRight`. But there are 4 conditions to rotate the tree on insertion and deletion. You can read it and see the picture from [here](https://www.tutorialspoint.com/data_structures_algorithms/avl_tree_algorithm.htm).

```go
func rightRotate(x *node) *node {
  y := x.left
  t := y.right

  y.right = x
  x.left = t

  x.updateHeight()
  y.updateHeight()

  return y
}

func leftRotate(x *node) *node {
  y := x.right
  t := y.left

  y.left = x
  x.right = t

  x.updateHeight()
  y.updateHeight()

  return y
}
```

The conditions to rotate the tree on insertion are:

1. When the tree `linearly to the right`, you need to use `leftRotate` on the `current node`
2. When the tree `linearly to the left`, you need to use `rightRotate` on the `current node`
3. When the tree creates `Less Than` Symbol, you need to `leftRotate` on the `left child`, and `rightRotate` on the `current node`
4. When the tree creates `Greater Than` Symbol, you need to `rightRotate` on the `right child`, and `leftRotate` on the `current node`

## Insertion

```go
func rotateInsert(node *node, val int) *node {
  // update the height on every insertion
  node.updateHeight()

  // bFactor will tell you which side the weight is on
  bFactor := node.balanceFactor()

  // linearly to the left
  if bFactor > 1 && val < node.left.value {
    return rightRotate(node)
  }

  // linearly to the right
  if bFactor < -1 && val > node.right.value {
    return leftRotate(node)
  }

  // less than symbol
  if bFactor > 1 && val > node.left.value {
    node.left = leftRotate(node.left)
    return rightRotate(node)
  }

  // greater than symbol
  if bFactor < -1 && val < node.right.value {
    node.right = rightRotate(node.right)
    return leftRotate(node)
  }

  return node
}
```

Lastly, you need to update the return statement of the `insertNode` function.

```go
func insertNode(node *node, val int) (*node, error) {
  ...
  return rotateInsert(node, val), nil
}
```

## Traverse Operation and Validation

So that the results are easy to visualize, you need to change the traverse function becomes `pre-order` and open [BST Visualization page](https://www.cs.usfca.edu/~galles/visualization/BST.html) & [AVL Visualiztion Page](https://www.cs.usfca.edu/~galles/visualization/AVLtree.html).

```go
func traverse(node *node) {
  // exit condition
  if node == nil {
    return
  }

  fmt.Println(node.value)
  traverse(node.left)
  traverse(node.right)
}

func main() {
  tree := avl.New()

  // to check if your implementation is correct
  // First insert this sequentially
  // to the AVL Visualiztion Page
  tree.Insert(0)
  tree.Insert(1)
  tree.Insert(2)
  tree.Insert(3)
  tree.Insert(4)
  tree.Insert(5)
  tree.Insert(6)
  tree.Insert(7)

  // Second insert Traverse function results sequentially
  // to the BST Visualization page
  tree.Traverse() // 3 1 0 2 5 4 6 7
}
```

If you find the tree visualizations are the same and balanced, then it’s correct.

## Deletion

```go
func rotateDelete(node *node) *node {
  node.updateHeight()
  bFactor := node.balanceFactor()

  // linearly to the left
  if bFactor > 1 && node.left.balanceFactor() >= 0 {
    return rightRotate(node)
  }
  
  // less than symbol
  if bFactor > 1 && node.left.balanceFactor() < 0 {
    node.left = leftRotate(node.left)
    return rightRotate(node)
  }

  // linearly to the right
  if bFactor < -1 && node.right.balanceFactor() <= 0 {
    return leftRotate(node)
  }

  // greater than symbol
  if bFactor < -1 && node.right.balanceFactor() > 0 {
    node.right = rightRotate(node.right)
    return leftRotate(node)
  }

  return node
}
```

`Deletion` is not like `insertion` in that we can compare the entered values, because the node we are looking for is already deleted. That's why we need to compare the current node's balance factor with the balance factor of the child. Now, you need to modify the `removeNode` function. Remember when removing a node with 2 children, we need to find the `successor` and there are 2 ways to find the `successor`.

1. Find the least valueable node from the right child of the node
2. Find the greatest valueable node from the left child of the node

We used the first way while the BST & AVL Visualization Page using the second way. You can also change the code so it's easy to visualize.

```go
func greatest(node *node) *node {
  if node == nil {
    return nil
  }

  if node.right == nil {
    return node
  }

  return greatest(node.right)
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
      successor := greatest(node.left)
      value := successor.value

      // remove the successor
      left, err := removeNode(node.left, value)
      if err != nil {
        return nil, err
      }
      node.left = left

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

  if node == nil {
    return nil, nil
  }

  return rotateDelete(node), nil
}
```

You can validate and recheck your AVL implementation with the BST & AVL visualization page.

Here is the modifed `node.go` file.

## node.go

```go
package avl

import (
  "errors"
  "fmt"
)

var (
  ErrDuplicatedNode error = errors.New("bst: found duplicated value on tree")
  ErrNodeNotFound   error = errors.New("bst: node not found")
)

type node struct {
  height, value int
  left, right   *node
}

func (n *node) balanceFactor() int {
  if n == nil {
    return 0
  }

  return n.left.Height() - n.right.Height()
}

func (n *node) updateHeight() {
  max := func (a, b int) int {
    if a > b {
      return a
    }

    return b
  }
  n.height = max(n.left.Height(), n.right.Height()) + 1
}

func (n *node) Height() int {
  if n == nil {
    return 0
  }

  return n.height
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
    height: 1,
    value:  val,
    left:   nil,
    right:  nil,
  }
}

func insertNode(node *node, val int) (*node, error) {
  // if there's no node, create one
  if node == nil {
    return newNode(val), nil
  }

  // if there's duplicated node returns error
  if node.value == val {
    return nil, ErrDuplicatedNode
  }

  // if value is greater than current node's value, insert to the right
  if val > node.value {
    right, err := insertNode(node.right, val)

    if err != nil {
      return nil, err
    }

    node.right = right
  }

  // if value is less than current node's value, insert to the left
  if val < node.value {
    left, err := insertNode(node.left, val)

    if err != nil {
      return nil, err
    }

    node.left = left
  }

  return rotateInsert(node, val), nil
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
      successor := greatest(node.left)
      value := successor.value

      // remove the successor
      left, err := removeNode(node.left, value)
      if err != nil {
        return nil, err
      }
      node.left = left

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

  if node == nil {
    return nil, nil
  }

  return rotateDelete(node), nil
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
  if val > node.value {
    return findNode(node.right, val)
  }

  // if value is less than current node's value, search recursively to the left
  if val < node.value {
    return findNode(node.left, val)
  }

  return nil
}

func rotateInsert(node *node, val int) *node {
  // update the height on every insertion
  node.updateHeight()

  // bFactor will tell you which side the weight is on
  bFactor := node.balanceFactor()

  // linearly to the left
  if bFactor > 1 && val < node.left.value {
    return rightRotate(node)
  }

  // linearly to the right
  if bFactor < -1 && val > node.right.value {
    return leftRotate(node)
  }

  // less than symbol
  if bFactor > 1 && val > node.left.value {
    node.left = leftRotate(node.left)
    return rightRotate(node)
  }

  // greater than symbol
  if bFactor < -1 && val < node.right.value {
    node.right = rightRotate(node.right)
    return leftRotate(node)
  }

  return node
}

func rotateDelete(node *node) *node {
  node.updateHeight()
  bFactor := node.balanceFactor()

  // linearly to the left
  if bFactor > 1 && node.left.balanceFactor() >= 0 {
    return rightRotate(node)
  }

  // less than symbol
  if bFactor > 1 && node.left.balanceFactor() < 0 {
    node.left = leftRotate(node.left)
    return rightRotate(node)
  }

  // linearly to the right
  if bFactor < -1 && node.right.balanceFactor() <= 0 {
    return leftRotate(node)
  }

  // greater than symbol
  if bFactor < -1 && node.right.balanceFactor() > 0 {
    node.right = rightRotate(node.right)
    return leftRotate(node)
  }

  return node
}

func rightRotate(x *node) *node {
  y := x.left
  t := y.right

  y.right = x
  x.left = t

  x.updateHeight()
  y.updateHeight()

  return y
}

func leftRotate(x *node) *node {
  y := x.right
  t := y.left

  y.left = x
  x.right = t

  x.updateHeight()
  y.updateHeight()

  return y
}

func greatest(node *node) *node {
  if node == nil {
    return nil
  }

  if node.right == nil {
    return node
  }

  return greatest(node.right)
}

func traverse(node *node) {
  // exit condition
  if node == nil {
    return
  }

  fmt.Println(node.value)
  traverse(node.left)
  traverse(node.right)
}

func max(a, b int) int {
  if a > b {
    return a
  }
  return b
}
```

Thank you for reading!
