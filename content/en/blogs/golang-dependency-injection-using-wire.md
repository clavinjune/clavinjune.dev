---
title: "Golang Dependency Injection Using Wire"
date: 2022-02-02T18:18:57+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1611690828749-66c846dbd1b4?w=1920&q=50"]
aliases: []
description: "Implementing dependency injection in Golang using Google Wire"
---

{{< unsplash user="@diana_pole" src="photo-1611690828749-66c846dbd1b4" q="50" >}}

## Introduction

When it comes to maintaining a large application codebase, sometimes you are confused with dependencies. Moreover, when you create a new struct that depends on a struct with many attributes, you need to provide those attributes manually. What if those attributes need other structs? It will take forever.

Dependency injection is a technique you need to learn to maintain a large application codebase. It helps you to provide the necessary attribute to a struct automatically. Using dependency injection from a small codebase is a good investment. Although a dependency injection on a small code base seems like an over-engineered solution, it will help you whenever your codebase grows big or when the team members are increasing.

In Go, there are many dependency injection tools out there. You can choose whichever you want. Some dependency injection tools work at runtime levels, which use reflection to provide the dependencies but are hard to debug. [Google Wire](https://github.com/google/wire/) provides a dependency injection tool that works at compile-time. Google Wire utilises code generation to help developers achieve a dependency injection pattern at compile-time. So, in this article, you will learn how to implement a dependency injection pattern using Google Wire.

## Directory Structure

```shell
tree .
.
├── cmd
│   └── web
│       └── main.go
├── domain
│   └── user.go
├── go.mod
├── go.sum
└── user
    ├── handler.go
    ├── provider.go
    ├── repository.go
    ├── service.go
    └── wire.go

4 directories, 9 files
```

Let's say you have this `example` module structure.

### domain/user.go

`domain/user.go` is where you put your structs and interfaces, for example:

```go
package domain

import (
	"context"
	"net/http"
)

type (
	User struct {
		ID       string `json:"id"`
		Username string `json:"username"`
	}

	UserEntity struct {
		ID       string
		Username string
		Password string
	}

	UserRepository interface {
		FetchByUsername(ctx context.Context, username string) (*UserEntity, error)
	}

	UserService interface {
		FetchByUsername(ctx context.Context, username string) (*User, error)
	}

	UserHandler interface {
		FetchByUsername() http.HandlerFunc
	}
)
```

`user/` directory is where you put your implementation for those interfaces, for example:

### user/handler.go

```go
package user

import (
	"example/domain"
	"net/http"
)

type handler struct {
	svc domain.UserService
}

func (h *handler) FetchByUsername() http.HandlerFunc {
	panic("implement me")
}
```

### user/service.go

```go
package user

import (
	"context"
	"example/domain"
)

type service struct {
	repo domain.UserRepository
}

func (s *service) FetchByUsername(ctx context.Context, username string) (*domain.User, error) {
	panic("implement me")
}
```

### user/repository.go

```go
package user

import (
	"context"
	"database/sql"
	"example/domain"
)

type repository struct {
	db *sql.DB
}

func (r *repository) FetchByUsername(ctx context.Context, username string) (*domain.UserEntity, error) {
	panic("implement me")
}
```

As you can see from the code above:

```
-> Handler depends on Service
-> Service depends on Repository
-> Repository depends on Database Connection
```

It is pretty much straightforward. So If you want to create the `handler`, first you need to create `a database connection`, `repository`, and finally the `service`. That's all for one domain. If you have multiple domains, and each struct has many attributes, it will be more bulky, right? Before it gets more complicated, let's try to use `Google Wire`.

## Using Google Wire

```shell
# installing wire code generator
$ go install github.com/google/wire/cmd/wire@latest
# downloading wire module
$ go get github.com/google/wire@latest
go get: added github.com/google/wire v0.5.0
```

After installing Google Wire, let's talk about `provider`.

### Provider

`Provider` is an initializer function where you create a single struct. For example:

```go
func ProvideRepository(db *sql.DB) *repository {
	return &repository{
		db: db,
	}
}
```

Pretty much it. Other than that, you can also create a singleton provider using `sync.Once` to keep the creation only running once. For example, here is what your `user/provider.go` file contents look like:

```go
package user

import (
	"database/sql"
	"example/domain"
	"sync"
)

var (
	hdl     *handler
	hdlOnce sync.Once

	svc     *service
	svcOnce sync.Once

	repo     *repository
	repoOnce sync.Once
)

func ProvideHandler(svc domain.UserService) *handler {
	hdlOnce.Do(func() {
		hdl = &handler{
			svc: svc,
		}
	})

	return hdl
}

func ProvideService(repo domain.UserRepository) *service {
	svcOnce.Do(func() {
		svc = &service{
			repo: repo,
		}
	})

	return svc
}

func ProvideRepository(db *sql.DB) *repository {
	repoOnce.Do(func() {
		repo = &repository{
			db: db,
		}
	})

	return repo
}
```

### Provider Set

As it sounds, a `provider set` is a set of providers. It groups providers into one. If you are going to use those providers are frequently together, a provider set will be helpful. You can add a provider set to your `user/provider.go` file.

```go
...

ProviderSet wire.ProviderSet = wire.NewSet(
    ProvideHandler,
    ProvideService,
    ProvideRepository,
)

...
```

So, in case you need to import your providers one by one, you can easily import your provider set.

### Interface Binding

`Interface binding` is needed to **bind an abstract interface to its concrete implementation**. Your `UserService interface` depends on a `UserRepository interface`, but your `repository provider` returns `a pointer of the repository struct`, not a `UserRepository interface`. There are two ways to fix this problem:

1. Change `ProvideRepository`'s return type to `domain.UserRepository`
2. Bind `*repository` to the `domain.UserRepository`

But since there's a Go proverb that says `accept interfaces, return structs`. It would be wise if you chose the second option. Now you can bind your interfaces inside the provider set.

```go
...

ProviderSet wire.ProviderSet = wire.NewSet(
    ProvideHandler,
    ProvideService,
    ProvideRepository,

    // bind each one of the interfaces
    wire.Bind(new(domain.UserHandler), new(*handler)),
    wire.Bind(new(domain.UserService), new(*service)),
    wire.Bind(new(domain.UserRepository), new(*repository)),
)

...
```

### user/wire.go

Now, after all the dependencies have a provider, let's move on to the `user/wire.go` file.

```go
// +build wireinject

package user

import (
	"database/sql"

	"github.com/google/wire"
)

func Wire(db *sql.DB) *handler {
	panic(wire.Build(ProviderSet))
}
```

You need to define the `+build wireinject` tag to make Google Wire generate the complete code from your current file. `wire.Build` is flexible. You can refer to the [documentation](https://github.com/google/wire/blob/main/docs/guide.md) to use all the possibilities. In this case, since you have defined all the providers inside the provider set, you only need to put the provider set as an argument.

## Generate the Code

Now, you can use wire CLI tools to generate the complete code by executing `wire ./...` command in your project root directory.

```shell
$ wire ./...
wire: example/user: wrote /tmp/example/user/wire_gen.go
```

Here is the content of `wire_gen.go` file:

```go
// Code generated by Wire. DO NOT EDIT.

//go:generate go run github.com/google/wire/cmd/wire
//go:build !wireinject
// +build !wireinject

package user

import (
	"database/sql"
)

// Injectors from wire.go:

func Wire(db *sql.DB) *handler {
	userRepository := ProvideRepository(db)
	userService := ProvideService(userRepository)
	userHandler := ProvideHandler(userService)
	return userHandler
}
```

`Wire` function automatically generated by wire. You can directly use the `Wire` function inside your main function.

```go
package main

import (
	"database/sql"
	"example/user"
	"net/http"

	_ "github.com/lib/pq"
)

func main() {
	db, err := sql.Open("postgres", "")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	userHandler := user.Wire(db)
	http.Handle("/user", userHandler.FetchByUsername())
	http.ListenAndServe(":8000", nil)
}
```

## Conclusion

Using Google Wire on a small codebase seems like a waste, but it helps You create a cleaner constructor function. Instead of initializing all the structs at the main function, you can depend on Wire to inject all the dependencies.

Thank you for reading!
