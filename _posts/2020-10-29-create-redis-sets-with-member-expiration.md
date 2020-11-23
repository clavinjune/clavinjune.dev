---
category: Tips & Tricks
tags: redis cache sorted-sets
thumbnail: https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1920
description: >
  This post contains my own experience when using redis as a cache to set sets member expiration on the same key.
---

![Photo by @aronvisuals on Unsplash](https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1920)

[Redis](https://redis.io) is a good in-memory key-value data store that supports many types of value. [Sorted Sets](https://redis.io/topics/data-types-intro#sorted-sets) is one of them. According to the docs `sorted sets` is:

> Sorted sets, similar to Sets but where every string element is associated to a floating number value, called score. The elements are always taken sorted by their score, so unlike Sets it is possible to retrieve a range of elements (for example you may ask: give me the top 10, or the bottom 10).

What they didn't say about `sorted sets` is the expiration of `sets members` can't be defined, at least until this blog post is created. Why do we need to define `sets members` expiration?

Well, in my case I've required to create a phone service that could generate and verify OTP that sent to the users with a specific limit. The prior design is using [Golang Rate Limit](https://godoc.org/golang.org/x/time/rate) that I thought it couldn't be horizontally scalable. That's why I thought that I would use Redis for this case. The requirement for generating OTP is only like this:

- Each phone number can request OTP up to `X times` per `Y minutes`

That's why I came up with `Redis sets` but `sets members` can't have its own expiration time. Then I was googling around until I found [this issue comment](https://github.com/redis/redis/issues/135#issuecomment-2361996) by [@pietern](https://github.com/pietern). This is quite a hacky move, but at least it is doable. That's why I tried to implement it. Once again comments on Github saved my job.

The idea is quite simple, using the score on sorted-sets as an expiration millis. Fetch the valid members that have a score between `current millis` and `current millis + Y minutes` and remove the expired members that have a score between zero and `current millis`. So the minimum pseudocode would be like this:

```
# define variables
timeLimit := Y
requestLimit := X
key := +6212312341234
otp := randomString(6)
now := currentMillis()
exp := now + timeLimit

# get total of generated phone number in key
validOTPs := redisQuery("ZRANGEBYSCORE $key $now $exp")

# Limitting request
if count(validOTPs) >= requestLimit
then exit

# Add members to key
redisQuery("ZADD $key $exp $otp")
```

I think this method is good enough and the simplest one to implement. You can add optional operations like, `adding expiration to the key`, or `removing members that are no longer valid`. But this operation is enough to adding expiration to the `sets member`. You can also use this method to limiting the OTP verification to avoid brute-force.