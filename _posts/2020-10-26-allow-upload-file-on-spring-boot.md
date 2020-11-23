---
category: Notes
tags: java spring-boot
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