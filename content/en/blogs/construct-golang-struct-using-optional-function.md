---
title: "Construct Golang Struct Using Optional Function"
date: 2022-02-20T00:00:17+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #5 construct golang struct using optional function"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #5 construct golang struct using optional function" >}}

Using optional function to allow user optionally set attributes

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
)

// ExampleOptFunc sets Example's optional attribute
type ExampleOptFunc func(*Example)

// WithAttr1 sets Example's OptionalAttr1 as true
func WithAttr1() ExampleOptFunc {
	return func(e *Example) {
		e.OptionalAttr1 = true
	}
}

// WithAttr2 sets Example's OptionalAttr2 as i
func WithAttr2(i int) ExampleOptFunc {
	return func(e *Example) {
		e.OptionalAttr2 = i
	}
}

// WithAttr3 sets Example's OptionalAttr3 as s
func WithAttr3(s string) ExampleOptFunc {
	return func(e *Example) {
		e.OptionalAttr3 = s
	}
}

// Example is an example struct with some optional attributes
type Example struct {
	Name          string `json:"name"`
	OptionalAttr1 bool   `json:"optional_attr1"`
	OptionalAttr2 int    `json:"optional_attr2"`
	OptionalAttr3 string `json:"optional_attr3"`
}

// NewExample creates Example ptr
// requires name
func NewExample(name string, opts ...ExampleOptFunc) *Example {
	e := &Example{
		Name: name,
	}

	for _, opt := range opts {
		opt(e)
	}

	return e
}

// String returns json-encoded string
func (e *Example) String() string {
	var b bytes.Buffer
	enc := json.NewEncoder(&b)
	enc.SetIndent("", "  ")
	_ = enc.Encode(e)
	return b.String()
}

func main() {
	e := NewExample("example",
		WithAttr1(),
		WithAttr2(100),
		WithAttr3("testing"))

	fmt.Println(e)
	// {
	//   "name": "example",
	//   "optional_attr1": true,
	//   "optional_attr2": 100,
	//   "optional_attr3": "testing"
	// }
}
```
