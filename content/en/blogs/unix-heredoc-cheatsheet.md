---
title: "Unix Heredoc Cheatsheet"
date: 2022-01-13T10:27:14+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1520004434532-668416a08753?w=1920&q=50"]
aliases: ["/4cd05"]
description: "This post contains unix heredoc (cat EOF) cheatsheets and examples"
---

{{< unsplash user="@kellysikkema" src="photo-1520004434532-668416a08753" q="50" >}}

## Syntax

```bash
[cmd] <<[-] delimeter [cmd]
    contents
delimeter
```

All `contents` will be passed to the cmd as an input, examples below will use `EOF` as a delimeter and `cat` as a command, you can change to whatever you want.

## With Variable

```bash
cat <<EOF
    echo "$HOME"
EOF
```

result:

```bash
    echo "/home/clavinjune"
```

## Escape Variable

Use `\$` instead of `$` to escape specific variable

```bash
cat <<EOF
    echo "$HOME"
    echo "\$HOME"
EOF
```

result:

```bash
    echo "/home/clavinjune"
    echo "$HOME"
```

## Escape All Variables

Use `'EOF'` instead of `EOF` to escape all variables

```bash
cat <<'EOF'
    echo "$HOME"
    echo "\$HOME"
EOF
```

result:

```bash
    echo "$HOME"
    echo "\$HOME"
```

## Remove Leading Tab

Use `<<-` instead of `<<` to remove leading tabs

```bash
cat <<-EOF
    echo "$HOME"
    echo "\$HOME"
EOF
```

result:

```bash
echo "/home/clavinjune"
echo "$HOME"
```

## Add More Pipeline

```bash
cat <<EOF | grep june
    echo "$HOME"
    echo "\$HOME"
EOF
```

result:

```bash
    echo "/home/clavinjune"
```

## Write To a File

```bash
cat <<-'EOF' > /tmp/foo
    echo "$HOME"
    echo "\$HOME"
EOF
```

result:

```bash
$ cat /tmp/foo 
echo "$HOME"
echo "\$HOME"
```

Thank you for reading!
