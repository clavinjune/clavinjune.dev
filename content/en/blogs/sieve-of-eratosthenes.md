---
title: "Sieve of Eratosthenes"
date: 2021-01-10T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=1920&q=50"]
aliases: []
description: "This post contains notes about how to find first N prime numbers in Go using Sieve of Eratosthenes"
---

{{< unsplash user="@roman_lazygeek" src="photo-1453733190371-0a9bedd82893" q="50" >}}

I don't do anything except converting the pseudocode from [wiki](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes#Pseudocode) into Golang code

```go
package main

import "fmt"

func fetchFirstPrimeNumbersOf(n int) []int {
  var result []int

  // an integer n > 1
  if n <= 1 {
    return result
  }

  // let A be an array of Boolean values
  isPrime := make([]bool, n)

  // indexed by integers 2 to n,
  // initially all set to true.
  for i := 2; i < n; i++ {
    isPrime[i] = true
  }

  // for i = 2, 3, 4, ..., not exceeding √n do
  for i := 2; i*i < n; i++ {
    // I reverse the conditional check in order to make things a bit pretty

    // if A[i] is true
    if !isPrime[i] {
      continue
    }

    // for j = i^2, (i^2)+i, (i^2)+2i, (i^2)+3i, ..., not exceeding n do
    for j := i * i; j < n; j += i {
      // A[j] := false
      isPrime[j] = false
    }
  }

  // return all i such that A[i] is true.
  for i := 2; i < n; i++ {
    if !isPrime[i] {
      continue
    }

    result = append(result, i)
  }

  return result
}

func main() {
  fmt.Println(fetchFirstPrimeNumbersOf(100))
}
```

Thank you for reading!
