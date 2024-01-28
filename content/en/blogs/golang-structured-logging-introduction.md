---
title: "Golang Structured Logging Introduction"
date: 2024-01-28T12:00:00+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1602501437125-71e4a5c16c26?w=1920&q=50"]
aliases: []
description: "introduction to a new standard library for structured logging in Golang"
---

{{< unsplash user="@izgubljenausvemiru" src="photo-1602501437125-71e4a5c16c26" q="50" >}}

I was doing sharing session this week related to structured logging and how we can utilize it in my team at works. My team has already used Zerolog, but I guess it would be no harm if we update the knowledge regarding a new library more over because it is Golang standard library which we don't need to depends 3rd party. Here's the [presentation](https://go-talks.appspot.com/github.com/clavinjune/presents/golang-structured-logging-introduction/index.slide#1) I created.

## Introduction

Golang has introduced their first structured logging library when they released go [1.20.x](https://pkg.go.dev/golang.org/x/exp@v0.0.0-20240119083558-1b970713d09a/slog) as an experimental library. Then they included it as their standard library in the release of [1.21.x](https://tip.golang.org/doc/go1.21#slog). The API of the structured logging is quite easy to understand it is similar to the popular structured logging library out there like [Zerolog](https://pkg.go.dev/github.com/rs/zerolog) or [Logrus](https://pkg.go.dev/github.com/sirupsen/logrus).

## Code Example

Golang `log/slog` is integrated with `log` library as its default logger, but you can also create a new text/JSON logging handler or create your own handler by just implementing its interfaces. Below is the code example on how to use `log/slog`:

```go
var (
    textLogger *slog.Logger = slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{}))
    jsonLogger *slog.Logger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{}))
)

func main() {
    slog.Info("this is info using default logger")
    textLogger.Warn("this is warning", slog.Int("response_code", http.StatusNotFound))
    jsonLogger.Error("this is error",
        slog.String("status", http.StatusText(http.StatusInternalServerError)),
        slog.Bool("is_json", true),
    )
}
```

`slog.Info/Warn/Error` means that you will send an `info/warn/error` level logs, followed with the message and the attributes (`slog.String/Bool/Int`). The output of code above will be like:

```shell
2009/11/10 23:00:00 INFO this is info using default logger
time=2009-11-10T23:00:00.000Z level=WARN msg="this is warning" response_code=404
{"time":"2009-11-10T23:00:00Z","level":"ERROR","msg":"this is error","status":"Internal Server Error","is_json":true}
```

## Allocations to be Concerned

The `log/slog` API is very flexible that you can put your log attributes as a `key/pair variadic` arguments, but please be aware that it might introduce extra allocations:

```go
func main() {
    slog.Info("❌ have more allocations since we don't define the type",
        "key", "value",
        "key2", time.Minute,
    )
    slog.LogAttrs(context.Background(), slog.LevelInfo,
		"✅ avoid extra allocations",
        slog.String("key", "value"),
        slog.Duration("key2", time.Minute),
    )
}
```

Output:

```shell
2009/11/10 23:00:00 INFO ❌ have more allocations since we don't define the type key=value key2=1m0s
2009/11/10 23:00:00 INFO ✅ avoid extra allocations key=value key2=1m0s
```

Both code above will output the same thing, the only difference is you don't create the attributes using `slog.LogAttrs`. Here's the benchmark result:

```shell
benchstat keyval.txt attr.txt
name     old time/op    new time/op    delta
Slog-10    1.39µs ± 1%    1.45µs ± 2%   +4.37%  (p=0.000 n=10+9)

name     old alloc/op   new alloc/op   delta
Slog-10      734B ± 2%      676B ± 1%   -7.90%  (p=0.000 n=10+9)

name     old allocs/op  new allocs/op  delta
Slog-10      7.00 ± 0%      5.00 ± 0%  -28.57%  (p=0.000 n=10+10)
```

## Derive Logger from another Logger

You can also derive a logger from one logger and keep the atrributes, let's say you have a complex nested struct where you want to keep atrributes from parent struct inside their child struct.

```go
func main() {
    logger2 := slog.With(slog.Int("num", 3))

    logger2.Info("whenever logger2 is called, you can see the num attribute derived")
}
```

The output will be similar to this:

```shell
2009/11/10 23:00:00 INFO whenever logger2 is called, you can see the num attribute derived num=3
```

## Logger Group

You can also group logger attributes so you could know the scope of those attributes

```go
func main() {
    foobarLogger := slog.
        With(slog.String("non_grouped", "value")).
        WithGroup("grouped")

	foobarLogger.Info("from foboar",
		slog.Any("args", []string{"a", "b"}),
		slog.Bool("ok", true),
	)
}
```

Output:

```shell
2009/11/10 23:00:00 INFO from foboar non_grouped=value grouped.args="[a b]" grouped.ok=true
```

## The Most Efficient Way to Use Slog

here's the recommended way on how to use slog:

```go
func main() {
    slog.LogAttrs(context.Background(), // context
        slog.LevelInfo,          // level
        "your message",          // message
        slog.Float64("key", 10), // keys
        slog.Group("latency", // grouping keys
            slog.Duration("duration", time.Millisecond),
            slog.Time("start", time.Now()),
        ),
    )
}
```

1. Use `LogAttrs` to avoid extra allocations. [ref](https://pkg.go.dev/log/slog#hdr-Attrs_and_Values)
1. Send `context` in case your handler handles the context (tracing, metrics, etc)
1. Define the `slog.Level`
1. Define the `message`
1. Put contextual `attributes`
1. `Group attributes` together if needed

## Use Case

### Dynamic Log Level

Dynamic log level means you can change your log level at runtime level without needing any re-deployment

```go
var (
    level  = new(slog.LevelVar)
    logger = slog.New(slog.NewTextHandler(
        os.Stdout, &slog.HandlerOptions{Level: level}))
)

func main() {
    logger.Debug("won't be shown") // by default log level is INFO
    level.Set(slog.LevelDebug)     // change it to DEBUG
    logger.Debug("shown")
}
```

Output:

```shell
time=2009-11-10T23:00:00.000Z level=DEBUG msg=shown
```

### Redact Data

You can manipulate the atrributes value by utilizing `ReplaceAttr` inside the `slog.HandlerOptions` struct.

```go
var (
    logger = slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		ReplaceAttr: func(g []string, a slog.Attr) slog.Attr {
            if "password" == a.Key {
                a.Value = slog.StringValue("[PII DATA]")
            }
            return a
        }
	}))
)

func main() {
    logger.Info("password will be redacted",
        slog.String("password", "P@$$w0rd?!"))
}
```

Output:

```shell
time=2009-11-10T23:00:00.000Z level=INFO msg="password will be redacted" password="[PII DATA]"
```

### Custom Handler

By default, `log/slog` provides you with three handler, the `default`, `text`, and `JSON`. You can create your own custom handler by just implementing their interfaces.

```go
type CustomHandler struct {
    slog.Handler
}

func (c *CustomHandler) Handle(ctx context.Context, r slog.Record) error {
    // handle context here for tracing, monitoring, logging, etc
    return c.Handler.Handle(ctx, r)
}
```

Here's the [reference](https://github.com/golang/example/blob/master/slog-handler-guide/README.md) on how to do it. Perhaps I'll cover this in another article.

Thank you for reading!
