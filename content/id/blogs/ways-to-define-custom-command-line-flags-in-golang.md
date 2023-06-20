---
title: "Cara Membuat Command-Line Flags Custom di Golang"
date: 2023-06-19T23:09:05+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1527012878741-0b725a6c006f?w=1920&q=50"]
aliases: []
description: "beberapa cara membuat custom command line flags di golang"
---

{{< unsplash user="@joshuafuller" src="photo-1527012878741-0b725a6c006f" q="50" >}}

## Pengenalan

Jika kalian familiar dengan _command-line interface_, kalian mungkin pernah melihat _flag_ atau penanda seperti `-h`, `-v`, `--name foo`, dan sebagainya. Beberapa _flag_ menggunakan tipe data primitif seperti `string`, `int`, `bool`, dan sejenisnya. Sisanya adalah _flag_ khusus yang menggunakan pola spesifik atau struktur data seperti `IP`, `URL`, `Array`, `Map`, dan sebagainya. Golang menyediakan sebuah _library_ bawaan `flag` untuk membuat _flag command-line_ khusus. Beberapa fungsi yang disediakan untuk membuat _flag_ sudah cukup jelas, seperti `flag.String`, `flag.Int`, dsb. Tapi, bagaimana dengan _custom flag_? Di artikel ini, kalian akan mempelajari beberapa cara untuk membuat _flag command-line custom_ pada Golang.

## Contoh

Misalnya kalian mau membuat _flag custom_ yang menerima sebuah _list_ berisi `string`. Penggunaan _flag_-nya akan seperti ini:

```bash
$ go run main.go --list a --list b,c,d
[a b c d]
```

Di bawah ini adalah beberapa cara untuk mendefinisikan _flag custom_ tersebut.

## Flag Var

`flag.Var` adalah cara mendefinisikan _flag custom_. `flag.Var` menerima sebuah _custom struct_ yang mengimplementasikan _interface_ `flag.Value`.

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

Hal penting yang perlu diperhatikan adalah metode `Set`. Setiap _flag_ kalian dipanggil, metode `Set` akan dipanggil.

## Flag Func

`flag.Func` adalah cara yang mudah untuk mendefinisikan sebuah _flag custom_. `flag.Func` menggunakan `flag.Var` sebagai basisnya, jadi kalian tidak perlu membuat _custom struct_.

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

Seperti kalian lihat, parameter terakhir dari `flag.Func` adalah metode `Set` yang kalian implementasikan pada contoh sebelumnya.

## Flag TextVar

`flag.TextVar` adalah cara baru yang diperkenalkan pada `go1.19`. `flag.TextVar` menggunakan `flag.Var` sebagai basisnya seperti `flag.Func`, tapi menerima _interface_ `encoding.TextUnmarshaler` dan `encoding.TextMarshaler`, dan bukan `flag.Value`. Artinya, kalian dapat menggunakan _struct_ bawaan seperti `big.Int`, `netip.Addr`, dan `time.Time` sebagai _flag_ tanpa harus mengimplementasikan _custom struct_.

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

Seperti yang kalian lihat, ini mirip dengan `flag.Var`, tapi menggunakan `MarshalText` dan `UnmarshalText`, sebagai pengganti metode `String` dan `Set`.

## Kesimpulan

Sekarang kalian tahu beberapa cara mendefinisikan _command-line flag custom_ menggunakan Golang. Jika ingin mempelajari _package_ `flag` lebih lanjut, kalian bisa membaca dokumentasi resminya [di sini](https://pkg.go.dev/flag).

Terima kasih sudah membaca!
