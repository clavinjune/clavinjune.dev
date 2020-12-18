---
category: Tips & Tricks
tags: monetization micro-payment
thumbnail: https://images.unsplash.com/photo-1517232117795-40c9d8212a04?w=1920
description: >
  This post contains my own experience monetizing my blog using Web Monetization.
---

![Photo by @veato on Unsplash](https://images.unsplash.com/photo-1517232117795-40c9d8212a04?w=1920)

In my [first post]({{ site.url }}/blog/i-create-this-blog-using-jekyll-65efbd/), I said that:

> Perhaps I’m gonna try to integrate this blog using Webmention and Web Monetization after getting a bunch of visitors, but I’m gonna save it for later.

Though my blog visitors still not that much, I integrated `Webmention` and `Web Monetization` yesterday. I'm still exploring `Webmention` due to a lack of resources, so I'm going to make another post featuring Webmention. So for now, let's talk about `Web Monetization`.

The first time I heard about 'Web Monetization' was from [this Hackathon](https://dev.to/devteam/announcing-the-grant-for-the-web-hackathon-on-dev-3kd1) held by [DEV](https://dev.to/). But yeah, I only implemented yesterday. I read [this post](https://dev.to/hacksultan/web-monetization-like-i-m-5-1418) posted by [@hacksultan](https://dev.to/hacksultan) and really helps me to learn about the concept behind `Web Monetization` itself.

The implementation was so easy, you just need to have a digital wallet account. Currently, `Web Monetization` only supports digital wallet like [Gatehub](https://webmonetization.org/docs/gatehub),  [Uphold](https://webmonetization.org/docs/uphold), and [XRP Tipbot](https://webmonetization.org/docs/xrptipbot). I personally use uphold because it has many withdrawal currencies. You can follow the registration steps by clicking the link that I referred on each wallet, find your `Interledger payment pointer` (**ILP**) which has this format `$wallet.example.com/alice`, and finally put it on your blog's `meta tag`. [This docs](https://webmonetization.org/docs/getting-started) is to the point and clear.

## Where the money comes from?

Currently, [Web Monetization](https://webmonetization.org) only provider is [Coil](https://coil.com). For every Coil paid members that visit your monetized content will stream a micro amount of money to your ILP automatically. `Coil` will pay you per second for about `$0.36/hour` according to [this FAQ](https://help.coil.com/accounts/creator-accounts#faqs) which you should read to learn how Coil works. As the paid members of Coil, you can enjoy exclusive contents from [these websites](https://coil.com/explore). This is my content income after integrated with `Web Monetization`.

![Moneeeeeeyyy]({{ site.url }}/assets/img/monetize-your-content-with-web-monetization-e3ee66/f63ccc7c.png)

To make your “premium” visitors feel more valued when visiting your content, you can give them exclusive content that free member can’t access, or perhaps removing ads. Then, the next question is how can you differentiate premium visitors from free visitors? The answer is in [this documentation](https://webmonetization.org/docs/api) along with the examples. Besides your personal web, you can also monetize your [Youtube](https://help.coil.com/for-creators/youtube-channels), [Twitch](https://help.coil.com/for-creators/twitch-stream) contents, and [DEV](https://dev.to/devteam/you-can-now-web-monetize-your-dev-posts-but-don-t-get-your-hopes-up-too-quickly-goc) posts.

Even though this post is like sponsoring some companies (which I hope so), they didn't sponsor me to write this. The whole content of this post is to encourage you to try Web Monetization because I think this is the new future for monetizing digital contents. I really hate it when I only need to read one or two articles from a web then I meet paywall.

![Paywall]({{ site.url }}/assets/img/monetize-your-content-with-web-monetization-e3ee66/fed8e470.png)

I like the concept behind this `Web Monetization` to only subscribe to one provider, then you can consume exclusive contents from many websites instead of subscribing to a lot of websites which perhaps you wouldn't consume their contents daily. Despite the costs, it's hard to manage this kind of subscription model.

Though `Web Monetization` is not a standard yet for monetizing digital content, it is currently being proposed as a [W3C standard](https://discourse.wicg.io/t/proposal-web-monetization-a-new-revenue-model-for-the-web/3785). I hope it become one and implemented everywhere ASAP.