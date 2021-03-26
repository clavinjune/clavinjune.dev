---
category: Notes
tags: linux cron date
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
