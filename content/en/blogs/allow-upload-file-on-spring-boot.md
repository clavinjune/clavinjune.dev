---
title: "Allow Upload File on Spring Boot"
date: 2020-10-26T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: []
aliases: ["/blog/allow-upload-file-on-spring-boot-4374a8"]
description: >
  This post contains notes how to enabling upload file on spring boot.
---

Add this on application configuration:

```yaml
spring:
  mvc:
   hiddenmethod:
     filter:
       enabled: true
```

[reference](https://github.com/spring-projects/spring-boot/issues/18644)

Thank you for reading!
