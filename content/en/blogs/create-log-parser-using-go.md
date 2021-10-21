---
title: "Create Log Parser Using Go"
date: 2021-10-21T15:42:38+07:00
draft: true
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=1920&q=50"]
aliases: []
description: >
  Create a log parser using Go and Regex to read and understand the system logs
---

{{< unsplash user="@iammrcup" src="photo-1461360228754-6e81c478b882" w="1920" q="50" >}}

## Introduction

Log File is a file that contains all events that happened in the system. By simply reading the log file, Developers can understand what happened, who did something to the system, and many more. Some systems have their standard way to write logs like [Apache](https://httpd.apache.org/docs/2.4/logs.html), [Nginx](https://nginx.org/en/docs/http/ngx_http_log_module.html), [Envoy](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage), Etc. But how about the custom one? Of course, developers need to write the log file as descriptive as possible to read it easily.

Perhaps writing logs is not an issue, but reading it? Do developers review and read their logs? Do they can easily understand the logs? Do they know what happened to the system right now? Perhaps not. That's where monitoring apps like [Elastic](https://www.elastic.co/) or [Grafana](https://grafana.com/) come to help parse and monitor the logs file.

Monitoring apps could help developers read the system logs, creating an alert if something went wrong. But they don't understand what happened to the system. They only follow the rules created by the developers. What if the developers want to put a little `brain` to the monitoring system so the monitoring apps could understand what happened? Sure by creating a `deep learning model` to analyze the logs is more than a help. But before that, developers should make sure they can parse the logs.

In this blog post, you will create a simple logs parser using Go as a first step to understand the logs file better.

## Define the Log Format

Let's say there's a single line of log formatted like this:

```plain
[2021-08-27T07:39:54.173Z] "GET /healthz HTTP/1.1" 200 - 0 61 225 - "111.114.195.106,10.0.0.11" "okhttp/3.12.1" "0557b0bd-4c1c-4c7a-ab7f-2120d67bee2f" "example.com" "172.16.0.1:8080"
```

You could extract the data you want from that line, for example:

1. Timestamp
2. HTTP Method
3. Request Path
4. Response Code
5. IPs

Then create the log format according to that line. Let's say you want to name the `timestamp` as `$timestamp`, and the unimportant data as `$_`. Now you will have a formatted string like this:

```plain
[$time_stamp] "$http_method $request_path $_" $response_code - $_ $_ $_ - "$ips" "$_" "$_" "$_" "$_"
```

So you can read your logs data like this:

```plain
  $time_stamp    => 2021-08-27T07:39:54.173Z
  $http_method   => GET
  $request_path  => /healthz
  $response_code => 200
  $ips           => 111.114.195.106,10.0.0.11
```

## Create the parser

Let's create a `main.go` file with the logs data and the format. To be easily used by the regex, you should escape the special symbol in your format using `\`.

```go
func main() {
  logsExample := `[2021-08-27T07:39:54.173Z] "GET /healthz HTTP/1.1" 200 - 0 61 225 - "111.114.195.106,10.0.0.11" "okhttp/3.12.1" "0557b0bd-4c1c-4c7a-ab7f-2120d67bee2f" "example.com" "172.16.0.1:8080"`
  logsFormat := `\[$time_stamp\] \"$http_method $request_path $_\" $response_code - $_ $_ $_ - \"$ips\" \"$_\" \"$_\" \"$_\" \"$_\"`
}
```

After define the format, adjust your `logFormat` to a format that regex could read. Because your variable starts with `$` and only contains `alphanumeric` and `underscore`. You can match the variable using this regex `\$([\w_]*)` then change all of the variables into a `named capturing group` in regex. Which is `(?P<name>re)`. Because you want to `replace` the `<name>` to your defined variable name, you can modify the `named capturing group` to `(?P<$1>.*)`. So if you put that in the code, it should be like this:

```go
  ...

  regexFormat := regexp.MustCompile(`\$([\w_]*)`).ReplaceAllString(logsFormat, `(?P<$1>.*)`)

  ...
```

Now your `regexFormat` looks like this:

```plain
\[(?P<time_stamp>.*)\] \"(?P<http_method>.*) (?P<request_path>.*) (?P<_>.*)\" (?P<response_code>.*) - (?P<_>.*) (?P<_>.*) (?P<_>.*) - \"(?P<ips>.*)\" \"(?P<_>.*)\" \"(?P<_>.*)\" \"(?P<_>.*)\" \"(?P<_>.*)\"
```

Then compile your `regexFormat` to find all data in the logs line.

```go
  ...

  re := regexp.MustCompile(regexFormat)
  matches := re.FindStringSubmatch(logsExample)

  ...
```

Now `matches` should have all your matched data. Let's print it.

```go
  ...

  for i, k := range re.SubexpNames() {
    // ignore the first and the $_
    if i == 0 || k == "_" {
      continue
    }

    fmt.Printf("%-15s => %s\n", k, matches[i])
  }

  ...
```

The output should be like this:

```plain
$ go run main.go 
time_stamp      => 2021-08-27T07:39:54.173Z
http_method     => GET
request_path    => /healthz
response_code   => 200
ips             => 111.114.195.106,10.0.0.11
```

After parsing a single logs line, you should be able to parse all your logs files. The only thing you need to do is define your logs file format. And then transform it into a human-readable format like the [previous step](#define-the-log-format).

Here is the complete code:

```go
package main

import (
  "fmt"
  "regexp"
)

func main() {
  // a line of log
  logsExample := `[2021-08-27T07:39:54.173Z] "GET /healthz HTTP/1.1" 200 - 0 61 225 - "111.114.195.106,10.0.0.11" "okhttp/3.12.1" "0557b0bd-4c1c-4c7a-ab7f-2120d67bee2f" "example.com" "172.16.0.1:8080"`

  // your defined log format
  logsFormat := `\[$time_stamp\] \"$http_method $request_path $_\" $response_code - $_ $_ $_ - \"$ips\" \"$_\" \"$_\" \"$_\" \"$_\"`

  // transform all the defined variable into a regex-readable named format
  regexFormat := regexp.MustCompile(`\$([\w_]*)`).ReplaceAllString(logsFormat, `(?P<$1>.*)`)

  // compile the result
  re := regexp.MustCompile(regexFormat)

  // find all the matched data from the logsExample
  matches := re.FindStringSubmatch(logsExample)

  for i, k := range re.SubexpNames() {
    // ignore the first and the $_
    if i == 0 || k == "_" {
      continue
    }

    // print the defined variable
    fmt.Printf("%-15s => %s\n", k, matches[i])
  }
}
```

Thank you for reading!
