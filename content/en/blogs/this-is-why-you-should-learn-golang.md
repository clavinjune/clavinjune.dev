---
title: "This Is Why You Should Learn Golang"
date: 2021-10-27T13:22:21+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["/img/this-is-why-you-should-learn-golang/golang.png"]
aliases: []
description: >
  My opinion about why you should consider learning Golang
---

{{< img src="/img/this-is-why-you-should-learn-golang/golang.png" alt="Photo by <a class=\"link unsplash-ref\" rel=\"noreferrer nofollow noopener\" target=\"_blank\" href=\"https://www.kindpng.com/userpngs/469/\">Dun Liu</a> on KindPNG" >}}

## Introduction

[Golang](https://golang.org/) is one of the youngest programming languages. Until this post is published, the current stable Golang version is 1.17.2. Besides that, it is considered a popular programming language amongst developers. It can be built and run on many platforms and environments (Sorry, Java), bundled with solid and supportive built-in packages, and many more.

I use Golang due to the lack of magic of the language, verbose, structured, and clean. Within this article, you are going to discover reasons why you should consider learning Golang. I'm not going to compare Golang with other programming languages because I think that will end in smoke. So let's start with the language structure itself.

## Language Structure

```go
package main

import (
  "errors"
  "fmt"
)

type Numbers []int

func (n Numbers) Repeat() error {
  if n == nil {
    return errors.New("Numbers is nil")
  }

  for i, e := range n {
    fmt.Printf("%02d => %3d\n", i+1, e)
  }

  return nil
}

func main() {
  if err := Numbers(nil).Repeat(); err != nil {
    fmt.Println(err)
  }

  _ = Numbers([]int{1, 99, 100}).Repeat()
}
```

I will not cover all the language syntax, but the code above is an example of Golang's code. You don't need to understand it right now, but you can learn the structure of the code starts from the `package` and `import` as a code scope, `func main` as an entry point, `if-else` and `for loop` as one of the control structure, `types`, `nil`, `errors`, etc.

It is `strictly typed`, using `curly braces` as scope even though you only write a single line of control structure, using `nil` instead of `null` (you save 1 character here), and only using a semicolon to separate statements, not to ends it. All that said, Golang's syntax is beginner-friendly, at least that's what I thought.

You won't be afraid of writing a dirty code syntax or whatsoever, because not only Golang has its [guide](https://golang.org/doc/effective_go) to writing it better, it also has its own `linter` and `formatter` that tells you what variable is unused built right in. And that's what you're gonna know about.

## Built-in Support

Golang brings its own tools to build a great application. Linter? Formatter? Tester? You [named](https://pkg.go.dev/cmd/go) it. It also has a `garbage collector`, natively support [concurrency](https://gobyexample.com/goroutines), and a [playground](https://play.golang.org/). Besides that, Golang also has supportive built-in packages. You can write a [web application](https://gobyexample.com/http-servers), [command-line interface application](https://gobyexample.com/command-line-arguments), and even a [Web Assembly application](https://github.com/golang/go/wiki/WebAssembly#getting-started) without any third-party module. But, what if you want to create a Golang module? Let's talk about it.

## Module

You can create a Golang module easily both local and remote. Just execute `go mod init <module-name>` and then just code like usual. Golang module support git out of the box, you can just push your Golang module to a git repository, and then import it into your code. For example, if you want to import a Postgres plugin or my database credential rotator module, you can import it just by typing the git repo name.

```go
import (
  "context"
  "database/sql"
  "log"
  "time"

  "github.com/ClavinJune/rotator"
  "github.com/lib/pq"
)
```

## Build Result

Binary! Golang builds your code into a binary. If you are on Windows, it will build your code into executable files, if you are on Linux it will build an ELF file, and so on. Also, you can control the build by only using an Environment variable. Let's say you are on a Linux machine, but you want to create an executable file for windows, just tell it so.

```bash {linenos=false}
$ ls
main.go
$ GOOS=windows GOARCH=amd64 go build main.go 
$ file main.exe 
main.exe: PE32+ executable (console) x86-64 (stripped to external PDB), for MS Windows
$ GOOS=darwin GOARCH=amd64 go build main.go 
$ file main
main: Mach-O 64-bit x86_64 executable
```

You can also create a Web Assembly module:

```bash {linenos=false}
$ GOOS=js GOARCH=wasm go build -o main.wasm main.go
$ file main.wasm
main.wasm: WebAssembly (wasm) binary module version 0x1 (MVP)
```

## Conclusion

I know that I'm not covering all the language specifications. All the reasons above are quite subjective to me as a developer, you may find your interests in Golang by referring to the [FAQ page](https://golang.org/doc/faq) or the [specification page](https://golang.org/ref/spec). Also, Golang is on its way to the [2nd version](https://go.googlesource.com/proposal/+/master/design/go2draft.md) which will support Generic and better error handling.

Thank you for reading!
