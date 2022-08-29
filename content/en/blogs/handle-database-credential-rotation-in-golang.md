---
title: "Handle Database Credential Rotation in Golang"
date: 2022-08-29T16:30:58+07:00
draft: true
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1559402900-f5e7feea8679?w=1920&q=50"]
aliases: []
description: "handle database credential rotation in golang"
---

{{< unsplash user="@picoftasty" src="photo-1559402900-f5e7feea8679" q="50" >}}

## Introduction

Many of you might have heard of the database credential rotation. It is a common solution for securing your database. Many providers have implemented this solution such as Hashicorp Vault, AWS Secret Manager, etc. By automatically rotating your database credential, no one can really know how to connect to the database. Indeed it is secure, but it leads to another problem. By rotating your database credential, your application might not be able to connect to the database after some times. Especially when you declare your database maximum connection lifetime. In this article, you will learn how to rotate your database credential programmatically in golang.

## Custom Driver

To implement this rotator as a generic solution, you will need to create a `customDriver struct` which holds your base database driver (e.g postgres, sqlite3, mysql, etc) and a `Fetcher interface` which will be used to fetch the database credential.

```go
type Fetcher interface {
	Fetch() (string, error)
}

type FetcherFunc func() (string, error)
func (f FetcherFunc) Fetch() (string, error) {
	return f()
}

// customDriver implements the `sql.Driver` interface.
type customDriver struct {
    // base is the base database driver
	base      driver.Driver
    
    // fetcherFn is the function that will be used to fetch the database credential
	fetcherFn FetcherFunc
}

func (d *customDriver) Open(_ string) (driver.Conn, error) {
    // fetch the database credential
	dsn, err := d.fetcherFn()
	if err != nil {
		return nil, err
	}

    // open the database connection using the fetched credential and base driver
	return d.base.Open(dsn)
}
```

## Register the Driver and Open the Connection

Now to be able to use the driver, you need to register the driver and open the connection.

```go
func OpenWithRotator(name string, base driver.Driver, fetcher Fetcher) (*sql.DB, error) {
	sql.Register(name, &customDriver{
		base:      base,
		fetcherFn: fetcher.Fetch,
	})

    // you don't need to fill the dsn, it will be fetched from the fetcher.
	return sql.Open(name, "")
}
```

## Implement Fetcher Interface

Let's implement the `Fetcher interface` by using a simple function. Let's assume that you want to connect to a different database for every time your database lifetime is up.

```go
var counter int

func simpleFetcher() (string, error) {
	log.Println("fetcher called")

	// add your custom logic
	// e.g. fetching from vault / config / etc.

	counter++
	return fmt.Sprintf("file:foobar-%d.sqlite", counter), nil
}
```

## Open the Connection with Rotator

Open and set the maximum lifetime of the connection to 2 seconds. `simpleFetcher` will be called every 2 seconds.

> If your database credential is rotated faster than your connection lifetime, Golang still can use the old connection.

```go
// you can adjust the `&sqlite3.SQLiteDriver{}` accordingly (e.g. &pq.Driver{}, etc.)
db, err := OpenWithRotator("foobar", &sqlite3.SQLiteDriver{}, FetcherFunc(simpleFetcher))
if err != nil {
    log.Fatal(err)
}
defer db.Close()
db.SetConnMaxLifetime(2 * time.Second)
```

## Test the Connection

To simply test whether the connection is working, you can use the `Ping` method every second.

```go
for range time.Tick(time.Second) {
    if err := db.Ping(); err != nil {
        log.Fatal(err)
    }
}
```

Now when you run the program, you will see the following output:

```shell
$ go run .
2022/08/29 16:56:16 fetcher called
2022/08/29 16:56:19 fetcher called
2022/08/29 16:56:22 fetcher called
2022/08/29 16:56:25 fetcher called
2022/08/29 16:56:28 fetcher called
2022/08/29 16:56:31 fetcher called
```

Here's the sqlite3 database files:

```shell
$ ls | grep foobar-
foobar-1.sqlite
foobar-2.sqlite
foobar-3.sqlite
foobar-4.sqlite
foobar-5.sqlite
foobar-6.sqlite
```

Here's the full code:

```go
package main

import (
	"database/sql"
	"database/sql/driver"
	"fmt"
	"log"
	"time"

	"github.com/mattn/go-sqlite3"
)

type Fetcher interface {
	Fetch() (string, error)
}

type FetcherFunc func() (string, error)
func (f FetcherFunc) Fetch() (string, error) {
	return f()
}

// customDriver implements the `sql.Driver` interface.
type customDriver struct {
    // base is the base database driver
	base      driver.Driver
    
    // fetcherFn is the function that will be used to fetch the database credential
	fetcherFn FetcherFunc
}

func (d *customDriver) Open(_ string) (driver.Conn, error) {
    // fetch the database credential
	dsn, err := d.fetcherFn()
	if err != nil {
		return nil, err
	}

    // open the database connection using the fetched credential and base driver
	return d.base.Open(dsn)
}

func OpenWithRotator(name string, base driver.Driver, fetcher Fetcher) (*sql.DB, error) {
	sql.Register(name, &customDriver{
		base:      base,
		fetcherFn: fetcher.Fetch,
	})

    // you don't need to fill the dsn, it will be fetched from the fetcher.
	return sql.Open(name, "")
}

var counter int
func simpleFetcher() (string, error) {
	log.Println("fetcher called")

	// add your custom logic
	// e.g. fetching from vault / config / etc.

	counter++
	return fmt.Sprintf("file:foobar-%d.sqlite", counter), nil
}

func main() {
	// you can adjust the `&sqlite3.SQLiteDriver{}` accordingly (e.g. &pq.Driver{}, etc.)
	db, err := OpenWithRotator("foobar", &sqlite3.SQLiteDriver{}, FetcherFunc(simpleFetcher))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	db.SetConnMaxLifetime(2 * time.Second)

	for range time.Tick(time.Second) {
		if err := db.Ping(); err != nil {
			log.Fatal(err)
		}
	}
}
```

## Conclusion

This is the simple implementation of a database rotator. You might want to implement your fetcher accordingly depends on your use case.

Thank you for reading!
