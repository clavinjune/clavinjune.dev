---
title: "Speed Up Golang Test Execution Time"
date: 2021-11-15T16:06:19+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1517026575980-3e1e2dedeab4?w=1920&q=50"]
aliases: []
description: "Speed up golang test execution time using parallel test"
---

{{< unsplash user="@chrisliverani" src="photo-1517026575980-3e1e2dedeab4" q="50" >}}

## Introduction

Code Testing is a requirement for production codes. Some people ignore it, some people write it. Why do some people don't write tests? One of the reasons is it takes time to think and write the test cases, and it may slow down the development and CI/CD process. When you think of good test cases and corner cases, you may produce tons of test cases to handle. Some tests complete in no time, some are not.

To help developers handle this issue, Golang provides a parallelization inside its standard library. You can do a parallel test without any 3rd party libraries or create a goroutine manually. In this article, you will learn how to make a parallel test to speed up the execution of the test.

## Function to be Tested

Let's say you have this time-based `EvenOrSleep` function which you may use on a login failed event to avoid spam or brute-force.

```go
var ErrNotEven = errors.New("not an even number")

func EvenOrSleep(n int) error {
    if n%2 == 0 {
        time.Sleep(time.Duration(n) * time.Second)
        return nil
    }

    return ErrNotEven
}
```

## Unit Test Function

```go
func TestEvenOrSleep(t *testing.T) {
    tt := []struct {
        n        int
        expected error
    }{
        {1, ErrNotEven},
        {3, ErrNotEven},
        {5, ErrNotEven},
        {2, nil},
        {4, nil},
    }

    for _, tc := range tt {
        actual := EvenOrSleep(tc.n)

        if tc.expected != actual {
            t.Errorf(`expected "%v", actual "%v"`, tc.expected, actual)
        }
    }
}
```

If you run the test, it will take around 6 seconds to execute all the test cases.

```bash
 $ go test -v
=== RUN   TestEvenOrSleep
--- PASS: TestEvenOrSleep (6.00s)
PASS
ok      example 6.004s
```

But, if you make the test cases parallel, It will take around 4 seconds because all the test cases are running at the same time. So let's improve the test using `t.Parallel()`.

## Modified Unit Test Function

```go
for _, tc := range tt {
    t.Run(fmt.Sprint(tc.n), func(t *testing.T) {
        t.Parallel()
        actual := EvenOrSleep(tc.n)

        if tc.expected != actual {
            t.Errorf(`expected "%v", actual "%v"`, tc.expected, actual)
        }
    })
}
```

You only need to change the code inside the iteration. Make all the test cases become subtests using `t.Run` and name them using their input `tc.n`. And then, inside the subtest, call the `t.Parallel()` function so it makes Golang run all the subtests at the same time.

```bash
$ go test -v
=== RUN   TestEvenOrSleep
=== RUN   TestEvenOrSleep/1
=== PAUSE TestEvenOrSleep/1
=== RUN   TestEvenOrSleep/3
=== PAUSE TestEvenOrSleep/3
=== RUN   TestEvenOrSleep/5
=== PAUSE TestEvenOrSleep/5
=== RUN   TestEvenOrSleep/2
=== PAUSE TestEvenOrSleep/2
=== RUN   TestEvenOrSleep/4
=== PAUSE TestEvenOrSleep/4
=== CONT  TestEvenOrSleep/1
=== CONT  TestEvenOrSleep/5
=== CONT  TestEvenOrSleep/3
=== CONT  TestEvenOrSleep/2
=== CONT  TestEvenOrSleep/4
--- PASS: TestEvenOrSleep (0.00s)
    --- PASS: TestEvenOrSleep/2 (4.00s)
    --- PASS: TestEvenOrSleep/4 (4.00s)
    --- PASS: TestEvenOrSleep/1 (4.00s)
    --- PASS: TestEvenOrSleep/5 (4.00s)
    --- PASS: TestEvenOrSleep/3 (4.00s)
PASS
ok      example 4.004s
```

As you see, it takes around 4 seconds to complete the whole test. But there's something wrong. If you see the test output on lines 19-23, you will see that each test was executed for 4 seconds.

```bash {linenostart=18}
...
    --- PASS: TestEvenOrSleep/2 (4.00s)
    --- PASS: TestEvenOrSleep/4 (4.00s)
    --- PASS: TestEvenOrSleep/1 (4.00s)
    --- PASS: TestEvenOrSleep/5 (4.00s)
    --- PASS: TestEvenOrSleep/3 (4.00s)
...
```

Let's add some log inside the `EvenOrSleep` function to debug it.

```go
func EvenOrSleep(n int) error {
    log.Println("input", n)
    if n%2 == 0 {
        time.Sleep(time.Duration(n) * time.Second)
        return nil
    }

    return ErrNotEven
}
```

And then run the test again without the `-v` flags to make the output less verbose.

```bash
$ go test
2021/11/15 17:22:13 input 4
2021/11/15 17:22:13 input 4
2021/11/15 17:22:13 input 4
2021/11/15 17:22:13 input 4
2021/11/15 17:22:13 input 4
PASS
ok      example 4.006s
```

Why is it always 4? Because the `tc` is always mutated on each iteration. You can see my other [blog post](/blogs/my-mistake-on-converting-slice-to-slice-of-ptr-in-golang/#result) to fix this issue. Or you can use this alternative solution below.

```go
for _, tc := range tt {
    tc := tc
    t.Run(fmt.Sprint(tc.n), func(t *testing.T) {
        t.Parallel()
        actual := EvenOrSleep(tc.n)
        
        if tc.expected != actual {
            t.Errorf(`expected "%v", actual "%v"`, tc.expected, actual)
        }
    })
}

// or

for i := range tt {
    tc := tt[i]
    t.Run(fmt.Sprint(tc.n), func(t *testing.T) {
        t.Parallel()
        actual := EvenOrSleep(tc.n)
        
        if tc.expected != actual {
            t.Errorf(`expected "%v", actual "%v"`, tc.expected, actual)
        }
    })
}
```

`tc := tc` copies the value of `tc` and makes it a new local variable so it won't be mutated on each iteration. Of course, you can change the `tc` to the other variable let's say `newTc := tc`, it doesn't need to be the same, just like creating a variable. Now let's remove the log, and re-run the tests again.

```bash
 $ go test -v
=== RUN   TestEvenOrSleep
=== RUN   TestEvenOrSleep/1
=== PAUSE TestEvenOrSleep/1
=== RUN   TestEvenOrSleep/3
=== PAUSE TestEvenOrSleep/3
=== RUN   TestEvenOrSleep/5
=== PAUSE TestEvenOrSleep/5
=== RUN   TestEvenOrSleep/2
=== PAUSE TestEvenOrSleep/2
=== RUN   TestEvenOrSleep/4
=== PAUSE TestEvenOrSleep/4
=== CONT  TestEvenOrSleep/1
=== CONT  TestEvenOrSleep/2
=== CONT  TestEvenOrSleep/3
=== CONT  TestEvenOrSleep/4
=== CONT  TestEvenOrSleep/5
--- PASS: TestEvenOrSleep (0.00s)
    --- PASS: TestEvenOrSleep/1 (0.00s)
    --- PASS: TestEvenOrSleep/3 (0.00s)
    --- PASS: TestEvenOrSleep/5 (0.00s)
    --- PASS: TestEvenOrSleep/2 (2.00s)
    --- PASS: TestEvenOrSleep/4 (4.00s)
PASS
ok      example 4.003s
```

It's fixed!

## Conclusion

By using a parallel test, you just reduced your test execution time as well as your CI/CD process. The processes are easy, just modify your test into a subtest for each case, and call the `t.Parallel()` function. That's it!

Thank you for reading!
