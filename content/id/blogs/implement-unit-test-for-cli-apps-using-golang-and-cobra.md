---
title: "Implementasi Unit Test untuk Aplikasi CLI menggunakan Golang dan Cobra"
date: 2022-09-21T11:05:24+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1576444356170-66073046b1bc?w=1920&q=50"]
aliases: []
description: "Mengimplemen unit test untuk aplikasi command-line interface (CLI) menggunakan Golang dan Cobra"
---

{{< unsplash user="@flowforfrank" src="photo-1576444356170-66073046b1bc" q="50" >}}

## Introduction

Test-driven development (TDD) terkadang membutuhkan banyak waktu untuk membuat sebuah aplikasi. Entah itu sebuah aplikasi web atau sebuah aplikasi CLI, sama saja. Disiplin untuk melakukan testing adalah hal yang sangat sulit. Tetapi  ini sangat merupakan investasi yang sangat layak. Siapa tahu, ini akan membantu kalian mencegah bug-bug zero-day yang tidak diinginkan.

Selain itu, membuat tests akan membantu kalian mengembangkan kode yang lebih baik. Kode yang dapat ditest adalah kode yang lebih baik. Setidaknya itu yang saya pikirkan. Karena itu memaksa kalian untuk berpikir mengenai kasus-kasus yang mungkin terjadi, membuat fungsi-fungsi terpisah yang lebih kecil, dll. Walaupun ini memakan waktu, ini membuat kode kalian menjadi lebih dapat dibaca dan hanya memberikan kesempatan kecil untuk bug dapat muncul ke permukaan.

Cobra juga tidak memiliki alasan untuk tidak memiliki test. Walaupun itu hanya membantu kalian membuat aplikasi CLI, itu membutuhkan kode yang dapat ditest juga. Di postingan blog ini, kalian akan belajar bagaimana cara mengimplementasi unit test untuk Cobra.

## Initialisasi Projek Cobra

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

## Memodifikasi Command Root

Untuk mengimplemen sebuah unit test sederhana, kalian bisa menghapus semua konten dari file `root.go` dan buat itu seminimum mungkin. Sebagai contoh:

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

Sekarang kalian memiliki aplikasi CLI sederhana. Mari coba jalankan.

Dengan toggle

```bash
$ go run main.go -t
ok
```

Tanpa toggle

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

Sekarang kodenya berjalan, tetapi tidak terlihat seperti kode yang dapat ditest. Mari modifikasi. Untuk mengubah kodenya dan membuat itu dapat ditest, kalian memiliki beberapa pilihan.

1. Mengubah struktur Cobra, membuat fungsi yang mengembalikan `rootCmd` dan mengirimnya ke fungsi `Execute` sehingga bisa dieksekusi dari file `main`
2. Pertahankan struktur Cobra yang natural, dan bekerja lebih banyak pada testnya. 

### Pilihan 1

Ini adalah `root.go`:

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

Ini adalah `root_cmd_test.go`:

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

### Pilihan 2

Ini adalah `root.go`:

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

Ini adalah `root_cmd_test.go`:

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

Kembali kepada kalian untuk memilih opsi [1](#pilihan-1) atau [2](#pilihan-2). Kalian bisa menyesuaikan dengan proyek kalian. Tetapi, jika kalian ingin mempertahankan struktur Cobra yang mengekspos `cmd` sebagai variabel, kalian bisa menggunakan `opsi 2`.

## Membuat Test Cases

Katakanlah kalian menggunakan `opsi 2`. Sekarang kalian harus membuat test casenya, test casenya akan menjadi `dengan toggle` atau `tanpa toggle`. Tetapi sebelum itu, mari buat sebuah fungsi untuk membantu mengeksekusi command root dan menyimpan outputnya ke sebuah variabel. Dengan menyimpan output ke sebuah variabel, kalian dapat membandingkan outputnya dengan apa yang kalian harapkan.

```go {linenostart=9}
...

func execute(t *testing.T, c *cobra.Command, args ...string) (string, error) {
  t.Helper()

  buf := new(bytes.Buffer)
  c.SetOut(buf)
  c.SetErr(buf)
  c.SetArgs(args)

  err := c.Execute()
  return strings.TrimSpace(buf.String()), err
}

...
```

Setelah membuat fungsi pembantunya, mari buat test casenya.

```go {linenostart=21}
...

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

Dan itulah bagaimana kalian mengimplemen unit test untuk aplikasi Cobra.

Terima kasih telah membaca!