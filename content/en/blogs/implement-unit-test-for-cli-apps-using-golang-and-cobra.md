---
title: "Implement Unit Test for CLI Apps using Golang and Cobra"
date: 2021-10-21T21:28:31+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1576444356170-66073046b1bc?w=1920&q=50"]
aliases: []
description: >
  Implementing unit test for command-line interface (CLI) Apps using Golang and Cobra
---

{{< unsplash user="@flowforfrank" src="photo-1576444356170-66073046b1bc" w="1920" q="50" >}}

## Introduction

Test-driven development (TDD) sometimes takes too much time when it comes to creating an app. Whether it is a web app or a CLI app, it doesn't matter. Being disciplined on testing is a hard thing to do. But it is a worthy investment to bet. Who knows, it will help you prevent unwanted zero-day bugs.

Besides that, creating tests will help you develop a better code. A testable code is a better code. At least that's what I think. Because it forced you to think about the corner cases, create smaller decoupled functions, Etc. Even though it takes time, it makes your code more readable and gives only a few chances for bugs to have showtime.

Cobra also has no excuse for no tests. Even though it only helps you to create a CLI app, it needs proper testable code too.  In this blog post, you will learn how to implement unit tests for Cobra.

## Initialize Cobra Project

```bash
$ cobra init example --pkg-name example
Your Cobra application is ready at
/tmp/example
$ cd example && go mod init example
go: creating new go.mod: module example
go: to add module requirements and sums:
  go mod tidy
$ tree .
.
├── cmd
│   └── root.go
├── go.mod
├── LICENSE
└── main.go

1 directory, 4 files
```

## Modify Root Command

To implement a simple unit test, you can remove all the `root.go` file content and make it as minimum as possible. For example:

```go
package cmd

import (
  "errors"

  "github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
  Use:  "example",
  RunE: func(cmd *cobra.Command, args []string) error {
    t, err := cmd.Flags().GetBool("toggle")

    if err != nil {
      return err
    }

    if t {
      cmd.Println("ok")
      return nil
    }

    return errors.New("not ok")
  },
}

func Execute() {
  cobra.CheckErr(rootCmd.Execute())
}

func init() {
  rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

```

Now we have a simple running CLI app. Let's try to run it.

With toggle

```bash
$ go run main.go -t
ok
```

Without toggle

```bash
$ go run main.go 
Error: not ok
Usage:
  example [flags]

Flags:
  -h, --help     help for example
  -t, --toggle   Help message for toggle

Error: not ok
exit status 1
```

Now the code is running, but it doesn't seem like it is a testable code. Let's modify it. To alter the code and make it testable, you have several options.

1. Change the Cobra structure, create a function that returns the rootCmd and pass it to the Execute function so you can execute it from the main file
2. Keep the nature of the Cobra code, and work harder on the test

### Option 1

This is the `root.go`:

```go
package cmd

import (
  "errors"

  "github.com/spf13/cobra"
)

func RootCmd() *cobra.Command {
  return &cobra.Command{
    Use: "example",
    RunE: func(cmd *cobra.Command, args []string) error {
      t, err := cmd.Flags().GetBool("toggle")

      if err != nil {
        return err
      }

      if t {
        cmd.Println("ok")
        return nil
      }

      return errors.New("not ok")
    },
  }
}

func Execute(cmd *cobra.Command) error {
  cmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
  return cmd.Execute()
}
```

This is the `root_cmd_test.go`:

```go
package cmd_test

import (
  "example/cmd"
  "testing"

  "github.com/matryer/is"
)

func Test(t *testing.T) {
  is := is.New(t)
  root := cmd.RootCmd()

  err := cmd.Execute(root)

  is.NoErr(err)
}
```

### Option 2

This is the `root.go`:

```go
package cmd

import (
  "errors"

  "github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
  Use:  "example",
  RunE: RootCmdRunE,
}

func RootCmdRunE(cmd *cobra.Command, args []string) error {
  t, err := cmd.Flags().GetBool("toggle")

  if err != nil {
    return err
  }

  if t {
    cmd.Println("ok")
    return nil
  }

  return errors.New("not ok")
}

func RootCmdFlags(cmd *cobra.Command) {
  cmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

func Execute() {
  cobra.CheckErr(rootCmd.Execute())
}

func init() {
  RootCmdFlags(rootCmd)
}
```

This is the `root_cmd_test.go`:

```go
package cmd_test

import (
  "example/cmd"
  "testing"

  "github.com/matryer/is"
  "github.com/spf13/cobra"
)

func TestRootCmd(t *testing.T) {
  is := is.New(t)

  root := &cobra.Command{Use: "root", RunE: cmd.RootCmdRunE}
  cmd.RootCmdFlags(root)

  err := root.Execute()

  is.NoErr(err)
}
```

It's up to you to choose either option [1](#option-1) or [2](#option-2). You can adjust it with your project. But if you want to keep the nature of the Cobra code that exposes the cmd as a variable, you can stick to `option 2`.

## Create the Test Cases

Let's say you stick with `option 2`. Now you need to create the test cases. In this case, the test cases will be either `with the toggle flag` or `without`. But first, let's make a helper function that will execute the root command and store the output to a variable. By storing the command output to a variable, you can compare the command output with your expectations.

```go
func execute(t *testing.T, c *cobra.Command, args ...string) (string, error) {
  t.Helper()

  buf := new(bytes.Buffer)
  c.SetOut(buf)
  c.SetErr(buf)
  c.SetArgs(args)

  err := c.Execute()
  return strings.TrimSpace(buf.String()), err
}
```

After creating the helper function, let's make the test cases.

```go
func TestRootCmd(t *testing.T) {
  is := is.New(t)

  tt := []struct {
    args []string
    err  error
    out  string
  }{
    {
      args: nil,
      err:  errors.New("not ok"),
    },
    {
      args: []string{"-t"},
      err:  nil,
      out:  "ok",
    },
    {
      args: []string{"--toggle"},
      err:  nil,
      out:  "ok",
    },
  }

  root := &cobra.Command{Use: "root", RunE: cmd.RootCmdRunE}
  cmd.RootCmdFlags(root)

  for _, tc := range tt {
    out, err := execute(t, root, tc.args...)

    is.Equal(tc.err, err)

    if tc.err == nil {
      is.Equal(tc.out, out)
    }
  }
}
```

And that's how you implement unit test for Cobra apps.

Thank you for reading!
