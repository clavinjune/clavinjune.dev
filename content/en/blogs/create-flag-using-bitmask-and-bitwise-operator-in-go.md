---
title: "Create Flag Using Bitmask and Bitwise Operator in Go"
date: 2022-07-15T11:23:00+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1569605803663-e9337d901ff9?w=1920&q=50"]
aliases: []
description: "create flag using bitmask and bitwise operator in go"
---

{{< unsplash user="@swimstaralex" src="photo-1569605803663-e9337d901ff9" q="50" >}}

## Introduction

I revisit some of my college notes, and find that in my first year of college, in Algorithm and Programming Course, Bitwise operator was mentioned but wasn't highlighted. It's either I didn't write the notes on that specific topic (*I stopped writing notes in my second semester*) or the Lecturer didn't explain anything about the usage. But then I found it is quite useful for Bitmasking. For example, in Unix' file access control it uses bitmask to represent the access:

```
000 => 0 => can't access anything
001 => 1 => can only execute
010 => 2 => can only read
011 => 3 => can execute+read
100 => 4 => can only write
101 => 5 => can execute+write
110 => 6 => can read+write
111 => 7 => can execute+read+write
```

All of those combination can be construct with just only 3 bits. As you can see, Bitmask uses sets of bit to show specific access is given or not. If it is 0, means that specific access is not given, otherwise it is given. In this article, you will learn how to implement Bitmasking and its operation in Golang.

## Code

```golang
package main

import "fmt"

type Permission uint8

const (
	// 1
	PermissionExecute Permission = 1 << iota

	// 2
	PermissionRead

	// 4
	PermissionWrite
)

const (
	PermissionAll = PermissionExecute | PermissionRead | PermissionWrite
)

func Set(p, flag Permission) Permission {
	return p | flag
}

func Clear(p, flag Permission) Permission {
	return p &^ flag
}

func HasAll(p, flag Permission) bool {
	return p&flag == flag
}

func HasOneOf(p, flag Permission) bool {
	return p&flag != 0
}

func main() {
	var p Permission
    // you can use Set/Clear(p, PermissionExecute|PermissionRead|PermissionWrite) to set multiple bits
	p = Set(p, PermissionAll)
	p = Clear(p, PermissionRead)

	// false, because PermissionRead is cleared
	hasExecuteAndRead := HasAll(p, PermissionExecute|PermissionRead)

	// true, because PermissionExecute and PermissionWrite are set
	hasExecuteAndWrite := HasAll(p, PermissionExecute|PermissionWrite)

	// true, because PermissionExecute is set even though PermissionRead is cleared
	hasExecuteOrRead := HasOneOf(p, PermissionExecute|PermissionRead)

	fmt.Println(hasExecuteAndRead, hasExecuteAndWrite, hasExecuteOrRead)
}
```

Let's go to the explanation line per line.

### Set

```golang
var p Permission // has no permission 000
p = Set(p, PermissionAll) // set all permission 111

// 000 (current permission)
// 111 (PermissionAll)
// --- OR
// 111
```

### Clear

```golang
// clear the bit of PermissionRead (010)
p = Clear(p, PermissionRead)

// reverse the PermissionRead first
// 010
// ---- NOT
// 101 (NOT result)

// 111 (current permission)
// 101 (NOT result)
// --- AND
// 101
```

> It is important to use BITCLEAR (AND NOT) operator instead of NOT (in this case, XOR) operator.
> BITCLEAR is always set the bit to 0 because it reverse the flag first using NOT, then using AND.
> Meanwhile, NOT is reverse the bit, so if you doing NOT operation twice, it will toggle back.
> See the snippet below for example.

### Toggle vs Clear

```golang
// toggling using NOT/XOR
foo := PermissionAll
fmt.Printf("Set All %03b\n", foo) // 111
foo ^= PermissionRead
fmt.Printf("Toggle %03b\n", foo) // 101
foo ^= PermissionRead
fmt.Printf("Toggle %03b\n", foo) // 111 it toggles back!

// clearing using BITCLEAR
bar := PermissionAll
fmt.Printf("Set All %03b\n", bar) // 111
bar &^= PermissionRead
fmt.Printf("Clear %03b\n", bar) // 101
bar &^= PermissionRead
fmt.Printf("Clear %03b\n", bar) // 101
```

### HasAll

```golang
// check whether has both Execute AND Read permission
hasExecuteAndRead := HasAll(p, PermissionExecute|PermissionRead) // false

// PermissionExecute|PermissionRead
// 001 (PermissionExecute)
// 010 (PermissionRead)
// --- OR
// 011 (PermissionRead+PermissionExecute)

// check whether has both Execute AND Read permission
// 101 (current permission)
// 011 (PermissionRead+PermissionExecute)
// --- AND
// 001 (PermissionExecute)

// 001 != 011 so it doesn't have both Execute AND Read permission

// check whether has both Execute AND Write permission
hasExecuteAndWrite := HasAll(p, PermissionExecute|PermissionWrite)

// PermissionExecute|PermissionWrite
// 001 (PermissionExecute)
// 100 (PermissionWrite)
// --- OR
// 101 (Write+Execute)

// check whether has both Execute AND Write permission
// 101 (current permission)
// 101 (PermissionWrite+PermissionExecute)
// --- AND
// 101 (PermissionWrite+PermissionExecute)

// 101 == 101 so it has both Execute AND Write permission
```

### HasOneOf

```golang
// check whether has either Execute OR Read permission
hasExecuteOrRead := HasOneOf(p, PermissionExecute|PermissionRead)

// PermissionExecute|PermissionRead
// 001 (PermissionExecute)
// 010 (PermissionRead)
// --- OR
// 011 (PermissionRead+PermissionExecute)

// check whether has either Execute OR Read permission
// 101 (current permission)
// 011 (PermissionRead+PermissionExecute)
// --- AND
// 001 (PermissionExecute)

// 001 != 0 so it has either Execute OR Read permission
```

## Things To Be Concerned

You can store the bitmasks on your databases also, but it might be not a good idea to use `iota` on your logic. From the code above, let's say you want to remove `PermissionRead`. Then `PermissionWrite` will be represented by 2 instead of 4. To avoid this, you may want to set a [Deprecated flag](https://cs.opensource.google/go/x/tools/+/master:go/packages/packages.go;l=96-117;drc=db8f89b397771c885c6218de3f383d800d72e62a) to your permission instead of remove it completely from your code. Or, as an alternative, you can put the number manually but it just another pain to handle if you have lots of permission.

## Conclusion

In this case, Bitmasking is a useful tool to implement access control. You have implemented the access control in only 1 byte because you only need to use `uint8`. For example, if you use sets of boolean variables to represent the access control, you need more than 1 variable and it will take more than 1 byte to store.

Thank you for reading!
