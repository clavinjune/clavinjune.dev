---
title: "I Create This Blog Using Jekyll"
date: 2020-10-24T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1542435503-956c469947f6?w=1920&q=50"]
aliases: ["/blog/i-create-this-blog-using-jekyll-65efbd"]
description: "This post contains my own experience in building the Jekyll static site from scratch until integrating this post using RSS."
---

{{< unsplash user="@jessbaileydesigns" src="photo-1542435503-956c469947f6" q="50" >}}

[This blog](https://clavinjune.dev/) is the result of my learning journey about a static-site generator made on top of [Jekyll](https://jekyllrb.com/). The design is kinda bad due to my lacked sense of design. To avoid creating a whole trash blog, I tried to ask my friends to give me feedback about the design a bit.

I have tried using the provided theme like [Minima](https://github.com/jekyll/minima) but, I just don't like it after all. That's why I think it's better to create my own. I tried to create the simplest design as long as it is easy to be read. I used [Coolors](https://coolors.co/), [Google Font](https://fonts.google.com/), [Rogue](http://rouge.jneen.net/), [Jekyll Paginate](https://github.com/sverrirs/jekyll-paginate-v2), [Jekyll Feed](https://github.com/jekyll/jekyll-feed), and write a bit of Ruby, CSS, and JS for creating the theme itself. I didn't think creating this simple blog costs me 2 Saturdays, even though it only consists of as many as 3 pages.

After I think the whole template is ready to be published, I create [this template repository](https://github.com/anon-org/jekyll-blog) just in case there's someone who wants to try Jekyll using my template. It is ready to be deployed, just adjust `_config.yaml` a bit and a whole blog is ready with it's auto-generated RSS feeds.

Integrating blog posts to [DEV](https://dev.to) using RSS is not a new thing. But this is a new experience for me since I only write two posts on DEV before. Despite this is a new blog, I have written my thoughts at [Medium](https://medium.com/@ClavinJune). I was looking for a way to publish to Medium via RSS feeds, but I didn't find any. Luckily DEV supports this kind of thing with simple configuration, perhaps I need to adjust the post a bit before publishing it.

Perhaps I'm gonna try to integrate this blog using [Webmention](https://webmention.io/) and [Web Monetization](https://webmonetization.org/) after getting a bunch of visitors, but I'm gonna save it for later.

Thank you for reading!
