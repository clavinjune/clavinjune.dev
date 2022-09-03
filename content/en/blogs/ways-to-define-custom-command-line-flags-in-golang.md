---
title: "Ways to Define Custom Command-Line Flags in Golang"
date: 2022-09-04T01:18:05+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1527012878741-0b725a6c006f?w=1920&q=50"]
aliases: []
description: "some ways to define custom command line flags in golang"
---

{{< unsplash user="@joshuafuller" src="photo-1527012878741-0b725a6c006f" q="50" >}}

## Introduction

If you're familiar with command-line interfaces, you might have seen flags like `-h`, `-v`, `--name foo`, etc. Some of the flags use primitive data types like `string`, `int`, `bool`, etc. The rest of the flags are custom flags that using specific patterns or data structure like `IP`, `URL`, `Array`, `Map`, etc. Golang provides a built-in library called `flag` to define command-line flags. Some of the provided functions to define flags are straight forward like `flag.String`, `flag.Int`, etc. But, how about the custom flags? In this article, you will learn some ways to define custom command-line flags in Golang.

## Example

Let's say you want to create a custom flags that accepts a list of string values. The usage of the flag should be like this:

```bash
$ go run main.go --list a --list b,c,d
[a b c d]
```

Below are some ways how to define the custom flag.

## Flag Var

`flag.Var` is a way to define a custom flag. It accepts a custom struct that implements `flag.Value` interface.

```go
type ListFlag []string

func (f *ListFlag) String() string {
	b, _ := json.Marshal(*f)
	return string(b)
}

func (f *ListFlag) Set(value string) error {
	for _, str := range strings.Split(value, ",") {
		*f = append(*f, str)
	}
	return nil
}

func main() {
    // foo and bar as a default value
	list := ListFlag([]string{"foo", "bar"})
	flag.Var(&list, "list", "your flag usage")

	flag.Parse()
	fmt.Println(list) // [foo bar a b c d]
}
```

The important thing to note is the `Set` method. Everytime your flag is called, the `Set` method will be called.

## Flag Func

`flag.Func` is a straight forward way to define a custom flag. It uses `flag.Var` under the hood so you don't need to create a custom struct.

```go
func main() {
	list := ListFlag([]string{"foo", "bar"})
	flag.Func("list", "your flag usage", func(s string) error {
		for _, str := range strings.Split(s, ",") {
			list = append(list, str)
		}
		return nil
	})

	flag.Parse()
	fmt.Println(list) // [foo bar a b c d]
}
```

As you see, the last parameter of `flag.Func` is a `Set` method you implemented in the previous example.

## Flag TextVar

`flag.TextVar` is a new way introduced in `go1.19`. It uses `flag.Var` under the hood like `flag.Func`, but it accepts a `encoding.TextUnmarshaler` and `encoding.TextMarshaler` interface instead of `flag.Value` interface. It means you can use built-in struct like `big.Int`, `netip.Addr`, and `time.Time` as flags without needed to implement a custom struct.

```go
type ListFlag []string

func (f *ListFlag) MarshalText() ([]byte, error) {
	return json.Marshal(*f)
}

func (f *ListFlag) UnmarshalText(b []byte) error {
	for _, str := range strings.Split(string(b), ",") {
		*f = append(*f, str)
	}
	return nil
}

func main() {
	list := ListFlag([]string{"foo", "bar"})
	flag.TextVar(&list, "list", &list, "your flag usage")

	flag.Parse()
	fmt.Println(list)
}
```

As you see, it's similar to `flag.Var` but it uses `MarshalText` and `UnmarshalText` instead of `String` and `Set` method.

## Conclusion

Now you know some ways to define custom command-line flags in Golang. If you want to learn more about `flag` package, you can read the official documentation [here](https://pkg.go.dev/flag).

Thank you for reading!
