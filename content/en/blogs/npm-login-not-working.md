---
title: "NPM Login Not Working"
date: 2021-11-18T13:18:24+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1543966888-7c1dc482a810?w=1920&q=50"]
aliases: []
description: "how to fix NPM login not working on Node v16.13.0 and NPM v8.1.3"
---

{{< unsplash user="@pinjasaur" src="photo-1543966888-7c1dc482a810" q="50" >}}

## TL;DR

[This solution](#the-solution) works for `Node v16.13.0` and `NPM v8.1.3`

## Introduction

I don't always hate working using NPM unless it starts downloading tons of node_modules and giving not so verbose logs. Today, my colleague and I found an NPM login bug that's not so interesting and hard to debug. It takes me about an hour to find out what is the root cause.

In this article, I will write the solution just in case you meet the same issue.

## Current Condition

In my current company, we use `Nexus3` as our private repository for the NPM module. I also use `Node v12.22.4` and `NPM v8.1.3` for working on my local machine. To login into our Nexus repository, I use `.npmrc` with this format:

```bash
@myorg:registry=https://repo.myorg.com/repository/npm-private
always-auth=true
_auth={{ base64 of username:password redacted here }}
```

And we're happy with it. No issue.

## The Issue

The issue comes when my colleague wants to try using `Node v16.13.0`. When the `npm i @myorg/utils` command is executed, it starts saying `401`.

```bash
npm ERR! code E401
npm ERR! Unable to authenticate, need: BASIC realm="Sonatype Nexus Repository Manager"

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/user/.npm/_logs/2021-11-18T06_37_02_136Z-debug.log
```

## Finding a Solution

I wonder if it's the `Nexus 3` is not compatible with the `Node v16` or what. So I tried to re-login to the Nexus repository.

```bash
$ npm login --registry=https://repo.myorg.com/repository/npm-private/ --scope=@myorg/
npm notice Log in on https://repo.myorg.com/repository/npm-private/
Username: {{ username }}
Password: 
Email: (this IS public) {{ email@myorg.com }}
Logged in as {{ username }} on https://repo.myorg.com/repository/npm-private/.
```

Okay, now we're logged in. But as soon as I check using `npm whoami`, it said `401` again.

```bash
$ npm whoami --registry=https://repo.myorg.com/repository/npm-private/ 
npm ERR! code E401
npm ERR! Unable to authenticate, need: BASIC realm="Sonatype Nexus Repository Manager"

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/user/.npm/_logs/2021-11-18T06_49_38_788Z-debug.log
```

Then I check my `.npmrc` file content, turns out Node v16 has a different format of `.npmrc`. Here is my current `.npmrc` file content:

```bash
//repo.myorg.com/repository/npm-private/:_authToken=NpmToken.{{ uuid redacted here }}
```

What a strange format. It doesn't reflect the scope, also I am still confused with the `_authToken` format itself. Of course, as a good developer, we need a fast hand for searching every keyword on google for our bugs. And then, I found [this comment](https://github.com/npm/cli/issues/3284#issuecomment-846057616) by [@apottere](https://github.com/apottere). So, I tried to rewrite my `.npmrc` file content manually. This is my current `.npmrc` file content:

```bash
//repo.myorg.com/repository/npm-private/:always-auth=true
//repo.myorg.com/repository/npm-private/:_auth={{ base64 of username:password redacted here }}
```

Seems promising, so I tried again to execute `npm i @myorg/utils` again. And it failed.

```bash
$ npm install @myorg/utils
npm ERR! code E404
npm ERR! 404 Not Found - GET https://registry.npmjs.org/@myorg%2futils - Not found
npm ERR! 404 
npm ERR! 404  '@myorg/utils@^0.2.0' is not in this registry.
npm ERR! 404 You should bug the author to publish it (or use the name yourself!)
npm ERR! 404 
npm ERR! 404 Note that you can also install from a
npm ERR! 404 tarball, folder, http url, or git url.

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/user/.npm/_logs/2021-11-18T07_04_32_033Z-debug.log
```

Yep, not found. I thought it was because the scope isn't reflected in the `.npmrc` file.

## The Solution

So I tried using the old way, rewriting the content manually. This is my current and final `.npmrc` file content:

```bash
@myorg:registry=https://repo.myorg.com/repository/npm-private
//repo.myorg.com/repository/npm-private/:always-auth=true
//repo.myorg.com/repository/npm-private/:_auth={{ base64 of username:password redacted here }}
```

Lastly, I tried again the `npm i @myorg/utils` command and it worked.

```bash
$ npm install @myorg/utils

added 1 package, and audited 2 packages in 2s

found 0 vulnerabilities
```

## Conclusion

So, It was the `npm login` command all along. I still can't find the whole documentation about the new `.npmrc` format, I might miss the docs, or maybe there isn't one. If you have the same issue, I hope you find this article and can fix the issue.

Thank you for reading!
