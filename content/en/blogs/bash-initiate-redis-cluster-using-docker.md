---
title: "Bash Initiate Redis Cluster Using Docker"
date: 2022-04-03T20:17:05+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["sunday-snippet"]
images: ["/img/sunday-snippet/image.png"]
aliases: []
description: "sunday snippet #11 bash initiate redis cluster using docker"
---

{{< img src="/img/sunday-snippet/image.png" alt="Sunday Snippet #11 bash initiate redis cluster using docker" >}}

```shell
#!/bin/sh
set -e

# get accessible docker bridge's IP
DOCKER_BRIDGE_IP=$(docker network inspect bridge | jq ".[0].IPAM.Config[0].Gateway" -r)
PORT_PREFIX="1700"
nodes=""

# create redis configuration for each node
for i in $(seq 1 6);do
    cat <<EOF > "/tmp/$i-redis.conf"
port $PORT_PREFIX$i
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
bind 0.0.0.0
cluster-announce-ip $DOCKER_BRIDGE_IP
cluster-announce-port $PORT_PREFIX$i
EOF

    # stop and remove existing redis
    docker container stop "myredis-$i" || true
    docker container rm "myredis-$i" || true

    # start new redis node containers
    docker run -v "/tmp/$i-redis.conf":/usr/local/etc/redis/redis.conf -d \
    --net=host --name "myredis-$i" redis:alpine3.15 redis-server /usr/local/etc/redis/redis.conf

    nodes="$DOCKER_BRIDGE_IP:$PORT_PREFIX$i $nodes"
done

# create cluster from existing containers
docker container exec myredis-1 redis-cli --cluster-yes --cluster create $nodes --cluster-replicas 1

printf "\n\n=> redis nodes:"

for node in $nodes; do
	echo "$node"
done
```
