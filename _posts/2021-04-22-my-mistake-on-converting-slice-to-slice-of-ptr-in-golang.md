---
category: Notes
tags: golang pointer slice
thumbnail: https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920
description: This post contains notes on my mistake when converting slice of int to slice of int ptr
---

![Photo by @iavnt on Unsplash](https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920)

I once made a function to convert a slice to slice of ptr and made a mistake.

## My Function

```go
func Slice2SliceOfPtr(slice []int) []*int {
	n := len(slice)
	r := make([]*int, n, n)

	for i, s := range slice {
		r[i] = &s
	}

	return r
}
```

It seems normal to me until I realize something was wrong.

## My Main Func

```go
func main() {
	x := []int{1, 2, 3}
	y := Slice2SliceOfPtr(x)

	fmt.Println(x)

	for _, yy := range y {
		fmt.Printf("%d ", *yy)
	}
}
```

## Result

```shell
$ go run main.go 
[1 2 3]
3 3 3
```

Why only the last element copied to the result?

Because the `&s` I used is mutated every iteration.

```go
for i, s := range slice {
	r[i] = &s
}
```

`s` never created as a new variable on every iteration, but its value is mutated inside the for loop

So I changed the iteration like this:

## Better One

```go
for i := range slice {
	r[i] = &slice[i]
}
```
