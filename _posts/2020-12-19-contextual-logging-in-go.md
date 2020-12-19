---
category: Development
tags: go logging context
thumbnail: https://images.unsplash.com/photo-1580245492316-d542d595001b?w=1920
description: >
  This post contains a reference for creating a contextual logging in golang.
---
![Photo by @borisview on Unsplash](https://images.unsplash.com/photo-1580245492316-d542d595001b?w=1920)

I’ve just woke up and somehow I remember that when I created [taboo]({{site.url}}/blog/creating-taboo-error-handler-for-go-f8e220) to trace the error log. And then I think, would it be better if I pass the logger instead of the error log itself?

As the context passed, it will contain a sub-logger that has `x-request-id` inside it. It’ll trace all the requested event from HTTP Handler to the most corner of the function.

I don't know if this gonna be good because I wrote this immediately right after I woke up. This might be not optimized or perhaps an anti-pattern. But at least this could be a reference for you to create a contextual logger.

## Logger

First thing first, you need a logger. Might be anything, but I will use [zerolog](https://github.com/rs/zerolog) in this post. I won't explain about zerolog since you can use anything you want.

Format the base logger to match your logging style.

```go
func configureBaseLogger() {
  output := zerolog.ConsoleWriter{
    Out: os.Stdout,
    FormatTimestamp: func(i interface{}) string {
      parse, _ := time.Parse(time.RFC3339, i.(string))
      return parse.Format("2006-01-02 15:04:05")
    },
    FormatLevel: func(i interface{}) string {
      return strings.ToUpper(fmt.Sprintf(" %-6s ", i))
    },
  }

  log.Logger = zerolog.New(output).With().
    Timestamp().CallerWithSkipFrameCount(2).Logger()
}
```

Let's test our base logger

```go
func main() {
  configureBaseLogger()
  log.Info().Msg("testing")
}
```

Output:
```
2020-12-19 01:01:37  INFO    logger/main.go:57 > testing
```

LGTM! Let's continue creating our handler!

## Middleware

Here I'll log the request using the middleware. So I'm gonna make a new type of handler to matched my middleware.

```go
type HandlerFuncWithStatus func(writer http.ResponseWriter, request *http.Request) int

const (
  LoggerCtxKey = iota
)

func middleware(next HandlerFuncWithStatus) http.HandlerFunc {
  return func(writer http.ResponseWriter, request *http.Request) {
    requestId := request.Header.Get("x-request-id")

    if requestId == "" {
      requestId = uuid.New().String()
    }

    subLogger := log.With().Str("requestId", requestId).Logger()

    subLogger.Info().
      Str("path", request.URL.Path).
      Str("method", request.Method).Msg("in")

    ctx := context.WithValue(context.Background(), LoggerCtxKey, subLogger)
    statusCode := next(writer, request.WithContext(ctx))
    writer.WriteHeader(statusCode)

    subLogger.Info().Int("status", statusCode).Msg("out")
  }
}
```

The main idea is:
1. Get `x-request-id` if exists, otherwise create one with UUIDv4 format
2. Create a sub-logger from our base-logger and then initiate it with the `request id`
3. Log the method and path, you can do anything in this step tho
4. Put the logger into the context and pass it to the http handler
5. Finally set and log the http status code

## HTTP Handler

Now we're gonna create the http handler that will use our middleware. It doesn't need to be fancy.

```go
func anotherFunc(ctx context.Context) {
  logger := ctx.Value(LoggerCtxKey).(zerolog.Logger)
  logger.Info().Msg("inside anotherFunc")
}

func handler (writer http.ResponseWriter, request *http.Request) int {
  logger := request.Context().Value(LoggerCtxKey).(zerolog.Logger)
  logger.Info().Msg("inside handler")
  
  anotherFunc(request.Context())

  return 204
}
```

So now all the function that has the context passed from the middleware can access the logger by the context key.

Let's assemble all the codes.

## Final
This will be the final look of our code.

```go
package main

import (
  "context"
  "fmt"
  "github.com/google/uuid"
  "github.com/rs/zerolog"
  "github.com/rs/zerolog/log"
  "net/http"
  "os"
  "strings"
  "time"
)

type HandlerFuncWithStatus func(writer http.ResponseWriter, request *http.Request) int

const (
  LoggerCtxKey = iota
)

func middleware(next HandlerFuncWithStatus) http.HandlerFunc {
  return func(writer http.ResponseWriter, request *http.Request) {
    requestId := request.Header.Get("x-request-id")

    if requestId == "" {
      requestId = uuid.New().String()
    }

    subLogger := log.With().Str("requestId", requestId).Logger()

    subLogger.Info().
      Str("path", request.URL.Path).
      Str("method", request.Method).Msg("in")

    ctx := context.WithValue(context.Background(), LoggerCtxKey, subLogger)
    statusCode := next(writer, request.WithContext(ctx))
    writer.WriteHeader(statusCode)

    subLogger.Info().Int("status", statusCode).Msg("out")
  }
}

func anotherFunc(ctx context.Context) {
  logger := ctx.Value(LoggerCtxKey).(zerolog.Logger)
  logger.Info().Msg("inside anotherFunc")
}

func handler (writer http.ResponseWriter, request *http.Request) int {
  logger := request.Context().Value(LoggerCtxKey).(zerolog.Logger)
  logger.Info().Msg("inside handler")

  anotherFunc(request.Context())

  return 204
}

func configureBaseLogger() {
  output := zerolog.ConsoleWriter{
    Out: os.Stdout,
    FormatTimestamp: func(i interface{}) string {
      parse, _ := time.Parse(time.RFC3339, i.(string))
      return parse.Format("2006-01-02 15:04:05")
    },
    FormatLevel: func(i interface{}) string {
      return strings.ToUpper(fmt.Sprintf(" %-6s ", i))
    },
  }

  log.Logger = zerolog.New(output).With().
    Timestamp().CallerWithSkipFrameCount(2).Logger()
}

func main() {
  configureBaseLogger()
  log.Info().Msg("testing")

  http.Handle("/", middleware(handler))

  if err := http.ListenAndServe(":8000", nil) ; err != nil {
    log.Error().Msg(err.Error())
  }
}
```

Try it by accessing [http://localhost:8000](http://localhost:8000). The output looks like this if I accessed it twice.

```
2020-12-19 01:25:16  INFO    logger/main.go:75 > testing
2020-12-19 01:25:20  INFO    logger/main.go:33 > in method=GET path=/ requestId=6eb1f209-dac9-42b2-8ba4-883efffcbd9e
2020-12-19 01:25:20  INFO    logger/main.go:50 > inside handler requestId=6eb1f209-dac9-42b2-8ba4-883efffcbd9e
2020-12-19 01:25:20  INFO    logger/main.go:45 > inside anotherFunc requestId=6eb1f209-dac9-42b2-8ba4-883efffcbd9e
2020-12-19 01:25:20  INFO    logger/main.go:39 > out requestId=6eb1f209-dac9-42b2-8ba4-883efffcbd9e status=204
2020-12-19 01:25:31  INFO    logger/main.go:33 > in method=GET path=/ requestId=88a140b8-2aed-4d82-bf56-0ab9a1c7cce0
2020-12-19 01:25:31  INFO    logger/main.go:50 > inside handler requestId=88a140b8-2aed-4d82-bf56-0ab9a1c7cce0
2020-12-19 01:25:31  INFO    logger/main.go:45 > inside anotherFunc requestId=88a140b8-2aed-4d82-bf56-0ab9a1c7cce0
2020-12-19 01:25:31  INFO    logger/main.go:39 > out requestId=88a140b8-2aed-4d82-bf56-0ab9a1c7cce0 status=204
```

Now if you want to trace all the event you can log it to the file and grep the request id.

```bash
$ grep 88a140b8-2aed-4d82-bf56-0ab9a1c7cce0 /tmp/log
2020-12-19 01:25:31  INFO    logger/main.go:33 > in method=GET path=/ requestId=88a140b8-2aed-4d82-bf56-0ab9a1c7cce0
2020-12-19 01:25:31  INFO    logger/main.go:50 > inside handler requestId=88a140b8-2aed-4d82-bf56-0ab9a1c7cce0
2020-12-19 01:25:31  INFO    logger/main.go:45 > inside anotherFunc requestId=88a140b8-2aed-4d82-bf56-0ab9a1c7cce0
2020-12-19 01:25:31  INFO    logger/main.go:39 > out requestId=88a140b8-2aed-4d82-bf56-0ab9a1c7cce0 status=204
```

That should be enough for the reference. Please modify the code according to your usage. I didn't test for the performance nor benchmarking it so take it with a grain of salt.