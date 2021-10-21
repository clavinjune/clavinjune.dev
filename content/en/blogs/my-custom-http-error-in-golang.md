---
title: "My Custom HTTP Error in Golang"
date: 2021-05-18T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: []
aliases: ["/blog/my-custom-http-error-in-golang-9c193b"]
description: >
  This post contains notes on how I handle http error in golang
---

This is how I handle error with golang on http server

```go
package e

import (
  "errors"
  "fmt"
  "net/http"
  "runtime"
)

// Error implements built in error with status code, caller, and message attribute
type Error struct {
  Err        error
  statusCode int
  message    string
  caller     string
}

// New wraps err with defined statusCode and message
func New(err error, statusCode int, message string) error {
  return &Error{
    Err:        err,
    statusCode: statusCode,
    message:    message,
    caller:     getCaller(),
  }
}

// Wrap wraps err with custom message
// Wrap's result inherit statusCode from err if err equals *Error
func Wrap(err error, msg string) error {
  var e *Error
  statusCode := http.StatusInternalServerError

  if errors.As(err, &e) {
    statusCode = e.statusCode
  }

  return &Error{
    Err:        err,
    statusCode: statusCode,
    message:    msg,
    caller:     getCaller(),
  }
}

// From creates new error from defined statusCode
// if statusCode doesn't have any status text
// statusCode changed to http.StatusInternalServerError
func From(statusCode int) error {
  text := http.StatusText(statusCode)

  if text == "" {
    text = http.StatusText(http.StatusInternalServerError)
    statusCode = http.StatusInternalServerError
  }

  return &Error{
    Err:        errors.New(text),
    statusCode: statusCode,
    message:    "",
    caller:     getCaller(),
  }
}

// Error returns error message with caller
func (e Error) Error() string {
  if e.message == "" {
    return e.Err.Error()
  }

  return fmt.Sprintf("%v\n[ %v ] > %v", e.Err, e.caller, e.message)
}

// Unwrap enables errors.As and errors.Is
func (e Error) Unwrap() error {
  return e.Err
}

// StatusCode returns e.statusCode
func (e Error) StatusCode() int {
  return e.statusCode
}

// getCaller uses log.Lshortfile to format the caller
func getCaller() string {
  _, file, line, ok := runtime.Caller(2)
  if !ok {
    file = "???"
    line = 0
  }

  short := file
  for i := len(file) - 1; i > 0; i-- {
    if file[i] == '/' {
      short = file[i+1:]
      break
    }
  }
  file = short

  return fmt.Sprintf("%s:%d", file, line)
}
```

Usage:

```go
package main

import (
  "database/sql"
  "errors"
  "fmt"

  "e"
)

func main() {
  base := e.New(sql.ErrNoRows, 404, "user not found")
  base2 := e.Wrap(base, "bleh")
  concrete := e.Wrap(base2, "there's no user with such credentials")

  fmt.Println(concrete)
  fmt.Println(errors.Is(concrete, base))

  var ee *Error
  if errors.As(concrete, &ee) {
    fmt.Println(ee.StatusCode())
  }
}
```

Result:

```bash
sql: no rows in result set
[ main.go:11 ] > user not found
[ main.go:12 ] > bleh
[ main.go:13 ] > there's no user with such credentials
true
404
```

Thank you for reading!
