---
title: "Comparing String to Avoid Time Based Attacks"
date: 2022-03-27T02:10:21+07:00
draft: false 
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #9 comparing string to avoid time based attacks"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #9 comparing string to avoid time based attacks" >}}

## Code

```go
package foo_test

import (
	"crypto/rand"
	"crypto/subtle"
	"fmt"
	"strings"
	"testing"
	"time"
)

var (
	a      []byte
	length int = 100000
	batch  int = length / 10
)

func init() {
	a = make([]byte, length, length)
	rand.Read(a)
}

func getCopied(changedIndex int) []byte {
	b := make([]byte, length, length)
	copy(b, a)
	b[changedIndex] = byte(1)

	return b
}

func wrapper(fn func(a, b []byte) bool) {
	for i := length - 1; i > 0; i -= batch {
		b := getCopied(i)

		n := time.Now()
		fn(a, b)

		m := time.Since(n)
		fmt.Printf("Differences at Index: %d, time takes: %s\n", i, m.String())
	}
}

func Cmp(a, b []byte) bool {
	return string(a) == string(b)
}

func CmpSub(a, b []byte) bool {
	return subtle.ConstantTimeCompare(a, b) == 1
}

func TestCmp(t *testing.T) {
	fmt.Printf("length of chars: %d\n", length)
	fmt.Println("comparison using: string(a) == string(b)")
	wrapper(Cmp)
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("comparison using: subtle.ConstantTimeCompare(a, b) == 1")
	wrapper(CmpSub)
}
```

## Test

```shell
$ go version
go version go1.18 darwin/arm64
$ go test . -v -count=1
=== RUN   TestCmp
length of chars: 100000
comparison using: string(a) == string(b)
Differences at Index: 99999, time takes: 2.875µs
Differences at Index: 89999, time takes: 2.583µs
Differences at Index: 79999, time takes: 2.375µs
Differences at Index: 69999, time takes: 2.209µs
Differences at Index: 59999, time takes: 1.75µs
Differences at Index: 49999, time takes: 1.5µs
Differences at Index: 39999, time takes: 1.209µs
Differences at Index: 29999, time takes: 958ns
Differences at Index: 19999, time takes: 666ns
Differences at Index: 9999, time takes: 375ns
============================================================
comparison using: subtle.ConstantTimeCompare(a, b) == 1
Differences at Index: 99999, time takes: 50.792µs
Differences at Index: 89999, time takes: 50.583µs
Differences at Index: 79999, time takes: 50.958µs
Differences at Index: 69999, time takes: 50.709µs
Differences at Index: 59999, time takes: 51µs
Differences at Index: 49999, time takes: 51.333µs
Differences at Index: 39999, time takes: 55.875µs
Differences at Index: 29999, time takes: 50.75µs
Differences at Index: 19999, time takes: 51.709µs
Differences at Index: 9999, time takes: 51.167µs
--- PASS: TestCmp (0.00s)
PASS
ok  	example	0.092s
```

## Conclusion
Thus, `subtle.ConstantTimeCompare(a, b) == 1` is more likely to be safe to use to avoid time-based attacks. Also, to avoid the length of the string to be guessed, you can hash the string first.