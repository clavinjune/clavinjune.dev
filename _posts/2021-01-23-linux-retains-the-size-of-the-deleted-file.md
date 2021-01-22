---
category: Notes
title: Linux Retains the Size of the Deleted File
tags: linux descriptor file fd
thumbnail: https://images.unsplash.com/photo-1512317049220-d3c6fcaf6681?w=1920
description: >
  This post contains notes on how to retrieve back the size that Linux preserves from a deleted file if the file is being used by the process that we can't kill or restart
---

![Photo by @ilyapavlov on Unsplash](https://images.unsplash.com/photo-1512317049220-d3c6fcaf6681?w=1920)

While interning, I once had an application that logged every request and response to the Linux file system. That app easily fills up our disks due to traffic. I got confused when I tried to delete log files because disk usage didn't decrease even after the log files were deleted. So I restarted the app and finally, the disk usage decreased.

But it is ineffective because we need to kill the application which is making a downtime at that time. Recently, I learned that it was caused by something called a `file descriptor`.

## TL;DR

```bash
$ df -h <big file dir> # check the current usage
$ rm -f <big file> # remove the big file
$ df -h <big file dir> # it still the same
$ lsof +L1 | grep <big file> # get the running app PID
$ cd /proc/<PID>/fd/ # go to the running app fd
$ ls -l | grep <big file> # get the symlink
$ > <symlink> # empty the symlink
$ df -h <big file dir> # it backs to normal
```

Let's reproduce that incident.

## Creating a big file

We need to create a big file, to fill our disk up. I think 3GB is enough. Well, you don't need to make it big just to reproduce, but more than 1GB could show the difference easily in the `df -h`.

```bash
$ yes lorem ipsum dolor sit amet \
  | head -c 3GB >> big-file.txt
```

Yep, now you have a 3GB file contains lorem ipsum called `big-file.txt`

## Create a simple app

Then we need to create an app that simply read `big-file.txt`. But I want to show you even if the `big-file.txt` is deleted, our app still writing to it. So I make the app read and append the `big-file.txt` using Golang, you can do it with whatever you prefer. Let's call it `write-to-file.go`

```go
package main

import (
  "fmt"
  "os"
)

func main() {
  f, err := os.OpenFile("big-file.txt",
    os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)

  if err != nil {
    panic(err)
  }

  defer f.Close()

  for i := 0; ; i++ {
    fmt.Scanln()
    fmt.Fprintf(f, "%d\n", i)
    fmt.Println(i, "written")
  }
}

```

It will wait for our input and loop forever until we terminate the app.

## Check current disk usage

Well, because I put it in the `home dir`, I check the size of the `/home` using `df`.

```bash
$ df -h /home
Filesystem      Size  Used Avail Use% Mounted on
/dev/sdb1       913G   34G  832G   4% /home
```

## Tail the appended text in the file

`tail -f` will follow the last 10 lines in the file and it would show this

```bash
$ tail -f big-file.txt 
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lor
```

## Run the app

Let's run our `write-to-file.go`

```bash
$ go run write-to-file.go
```

For every `Enter` you input, it will append the `big-file.txt` like this

```bash
$ tail -f big-file.txt 
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lor0
1
2
3
```

```bash
$ go run write-to-file.go 

0 written

1 written

2 written

3 written

```

## Remove the file

Now let's stop the `tail -f` and remove that `big-file.txt`.

```bash
$ rm big-file.txt
```

Does your disk usage decreased? Unfortunately, mine is not. It might be karma working there isn't it?

```bash
$ df -h /home
Filesystem      Size  Used Avail Use% Mounted on
/dev/sdb1       913G   34G  832G   4% /home
```

Now, how to `really remove` the `big-file.txt`?

For doing that we need to check the current running process that still open that `big-file.txt`.

```bash
$ lsof +L1 | grep big-file.txt
write-to- 102333 clavinjune    3w   REG   8,17 3000000008     0  7341204 /home/clavinjune/Public/file-descriptor/big-file.txt (deleted)
```

Now we got the app's name, its PID, and we know that the Linux know the `big-file.txt` is already `deleted`.

Let's open the `file descriptor` of the app at `/proc/<PID>/fd`.

```bash
$ cd /proc/102333/fd
$ ls -l | grep big-file.txt
l-wx------ 1 clavinjune clavinjune 64 Jan 23 01:38 3 -> /home/clavinjune/Public/file-descriptor/big-file.txt (deleted)
```

It seems like, we have a symlink called `3` that linked to our `big-file.txt`.

Now if you `tail -f` to the symlink and input some `Enter` to the app, it will show something like this

```bash
$ tail -f 3
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lorem ipsum dolor sit amet
lor0
1
2
3
4
5
6
7
8
9
10
```

Interesting isn't it? Even if the `big-file.txt` is deleted, the app still writing into the symlink. That symlink held our disk space, so we need to make that symlink is empty. By simply echoing nothing to the symlink in this case echoing nothing to `3`.

```bash
$ > 3
```

Now check the disk usage it will return to normal like we really delete the `big-file.txt` and the program is still running and still appending to the file.

```bash
$ df -h /home
Filesystem      Size  Used Avail Use% Mounted on
/dev/sdb1       913G   32G  835G   4% /home
```

Let's input some `Enter` to the app again then the symlink will filled up again by the app.

```bash
$ tail -f 3 
11
12
13
14
15
16
```