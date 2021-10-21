---
title: "Execute Date Format in Cron"
date: 2021-03-26T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: []
aliases: ["/blog/execute-date-format-in-cron-2d96c1"]
description: >
  This post contains notes on how to execute date formatting in cron
---

Escaping `%` in crontab using `\%`

example

```bash
0 0 * * 5 cat ~/log >> \
~/log-`date +"\%Y-\%m-\%d"` && \
> ~/log
```

Thank you for reading!
