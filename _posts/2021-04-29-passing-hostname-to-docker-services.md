---
category: Notes
tags: docker linux hostname
description: >
  This post contains notes on how to pass host hostname to docker services via environment variable without changing service hostname
---

Passing hostname to docker container won't work

```yaml
environment:
  - "HOST_HOSTNAME=$HOSTNAME"
```

Do this instead

{% raw %}
```yaml
environment:
  - "HOST_HOSTNAME={{ .Node.Hostname }}"
```
{% endraw %}

It will fetch the hostname from docker placeholder

[Reference](https://docs.docker.com/engine/reference/commandline/service_create/#create-services-using-templates)
