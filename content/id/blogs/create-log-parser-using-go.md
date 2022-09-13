---
title: "Create Log Parser Using Go"
date: 2022-09-13T14:02:31+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=1920&q=50"]
aliases: []
description: "Membuat sebuah log parser menggunakan Go dan Regex untuk membaca dan mengerti sistem log"
---

{{< unsplash user="@iammrcup" src="photo-1461360228754-6e81c478b882" q="50" >}}

## Pengenalan

Log file adalah sebuah file yang yang berisi semua event yang terjadi di sebuah sistem. Dengan membaca log file, developer dapat mengerti apa yang terjadi, siapa melakukan apa ke sebuah sistem, dan lain-lain. Beberapa sistem memiliki standar mereka untuk menulis log seperti [Apache](https://httpd.apache.org/docs/2.4/logs.html), [Nginx](https://nginx.org/en/docs/http/ngx_http_log_module.html), [Envoy](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage), dll.

Mungkin menulis logs bukan sebuah masalah, tetapi bagaimana dengan membacanya? Apakah developers mereview dan membaca logs mereka? Apakah mereka dapat dengan mudah memahami logsnya? Apakah mereka mengetahui apa yang terjadi pada sistem saat ini? Mungkin tidak. Itulah dimana aplikasi monitoring seperti [Elastic](https://www.elastic.co/) atau [Grafana](https://grafana.com/) datang untuk membantu melakukan parsing dan memonitor logs file.

Aplikasi monitoring dapat membantu developers membaca sistem log, membuat sebuah peringantan jika terjadi sesuatu yang salah. Tetapi mereka tidak dapat memahami apa yang terjadi kepada sistem. Mereka hanya mengikuti aturan yang dibuat oleh developer. Bagaimana jika developer ingin menaruh sedikit `otak` di sistem monitoring agar aplikasi monitoring tersebut dapat memahami apa yang terjadi? Tentu saja dengan membuat `model deep learning` untuk menganalisa logs sangat membantu. Tetapi sebelum itu, developer harus memastikan mereka dapat melakukan parsing pada logs.

Di postingan blog ini, kalian akan membuat sebuah logs parser yang sederhana menggunakan Go sebagai langkah awal untuk memahami logs file lebih baik lagi.

## Mendefinisikan Format Log

Katakanlah ada satu baris log yang berformat seperti ini:

```plain
[2021-08-27T07:39:54.173Z] "GET /healthz HTTP/1.1" 200 - 0 61 225 - "111.114.195.106,10.0.0.11" "okhttp/3.12.1" "0557b0bd-4c1c-4c7a-ab7f-2120d67bee2f" "example.com" "172.16.0.1:8080"
```

Kalian bisa mengekstrak data yang kalian ingin dari baris tersebut, sebagai contoh:

1. Timestamp
2. HTTP Method
3. Request Path
4. Response Code
5. IPs

Lalu buat format log sesuai dengan baris tersebut. Katakanlah kalian ingin menamakan `timestamp` menjadi `$time_stamp`, dan data yang tidak penting menjadi `$_`. Sekarang kalian akan memiliki string yang berformat seperti ini:

```plain
[$time_stamp] "$http_method $request_path $_" $response_code - $_ $_ $_ - "$ips" "$_" "$_" "$_" "$_"
```

Jadi kalian bisa membaca logs data kalian seperti ini:

```plain
  $time_stamp    => 2021-08-27T07:39:54.173Z
  $http_method   => GET
  $request_path  => /healthz
  $response_code => 200
  $ips           => 111.114.195.106,10.0.0.11
```

## Membuat Parser

Mari buat sebuah file `main.go` dengan data logs dan formatnya. Agar mudah digunakan dengan regex, kalian harus meng-escape simbol spesial di format kalian menggunakan `\`.

```go  {linenostart=3}
...

func main() {
  logsExample := `[2021-08-27T07:39:54.173Z] "GET /healthz HTTP/1.1" 200 - 0 61 225 - "111.114.195.106,10.0.0.11" "okhttp/3.12.1" "0557b0bd-4c1c-4c7a-ab7f-2120d67bee2f" "example.com" "172.16.0.1:8080"`
  logsFormat := `\[$time_stamp\] \"$http_method $request_path $_\" $response_code - $_ $_ $_ - \"$ips\" \"$_\" \"$_\" \"$_\" \"$_\"`
}
```

Setelah mendefinisikan formatnya, sesuaikan `logFormat` kalian dengan format yang dapat dibaca oleh regex. Karena variable yang kalian buat dimulai dengan `$` dan hanya mengandung `alfanumerik` dan `garis bawah`. Kalian dapat mencocokkan dengan regex ini `\$([\W_]*)` lalu ubah semua variablenya menjadi `named capturing group` di regex. Yang mana menjadi `(?P<name>re)`. Karena kalian ingin mengganti `<name>` menjadi variable yang telah kalian definisikan, kalian bisa ubah `named capturing group`nya menjadi `(?P<$1>.*)`. Jadi jika kalian tulis itu ke dalam code, itu akan menjadi seperti ini:

```go {linenostart=6}
  ...

  regexFormat := regexp.MustCompile(`\$([\w_]*)`).ReplaceAllString(logsFormat, `(?P<$1>.*)`)

  ...
```

Sekarang `regexFormat` kalian terlihat seperti ini:

```plain
\[(?P<time_stamp>.*)\] \"(?P<http_method>.*) (?P<request_path>.*) (?P<_>.*)\" (?P<response_code>.*) - (?P<_>.*) (?P<_>.*) (?P<_>.*) - \"(?P<ips>.*)\" \"(?P<_>.*)\" \"(?P<_>.*)\" \"(?P<_>.*)\" \"(?P<_>.*)\"
```

Lalu compile `regexFormat` kalian untuk mendapatkan semua data di baris logs tadi.

```go {linenostart=7}
  ...

  re := regexp.MustCompile(regexFormat)
  matches := re.FindStringSubmatch(logsExample)

  ...
```

Sekarang `matches` harusnya sudah memiliki semua data yang telah dicocokkan. Mari print.

```go {linenostart=10}
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

Outputnya terlihat seperti ini:

```plain
$ go run main.go 
time_stamp      => 2021-08-27T07:39:54.173Z
http_method     => GET
request_path    => /healthz
response_code   => 200
ips             => 111.114.195.106,10.0.0.11
```

Setelah melakukan parsing satu baris log, kalian harusnya bisa mem-parsing semua logs file kalian. Yang kalian harus lakukan hanya mendefinisikan format file kalian. Lalu ubah itu menjadi format yang human-readable seperti [langkah sebelumnya](#mendefinisikan-format-log).

Ini kode lengkapnya:

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

Terima kasih telah membaca!
