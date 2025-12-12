---
title: "Certified Kubernetes Administrator"
date: 2025-12-12T23:06:11+07:00
draft: false
iscjklanguage: false
isarchived: false
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1735802247361-b5902cf33049?w=1920&q=50"]
aliases: []
description: "Experience taking the linux foundation certified kubernetes administrator exam"
---

{{< unsplash user="@syhussaini" src="photo-1735802247361-b5902cf33049" q="50" >}}

April 2025, I took the [Certified GitOps Associate (CGOA)](https://training.linuxfoundation.org/certification/certified-gitops-associate-cgoa/) exam and shared my experience in [this blog post](/blogs/certified-gitops-associate/). Today, I want to share my experience taking the [Certified Kubernetes Administrator (CKA)](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/) exam.

At first I was hesitant to take this exam because I thought that it would be too difficult for me. I didn't know what was "administering" Kubernetes meant in practice. I only have experience spawnning Kubernetes clusters using [K3S](https://k3s.io/) and that only for Bootcamp purposes although it is a production-grade deployment. I have never read or follow the [Kubernetes The Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way) by [Kelsey Hightower](https://x.com/kelseyhightower) or even using [kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/). But I decided to schedule the exam at 6 December 2025.

## Preparation

I have been working with Kubernetes and Helm around work for the past few years, so I have some basic knowledge about Kubernetes concepts. However, I knew that I needed to study more in order to pass the exam. I re-open the [course](https://www.techworld-with-nana.com/kubernetes-administrator-cka) by [Nana Janashia](https://www.nanajanashia.com/) that I bought I think last year or so. It was a great course that covers all the topics that I need to know for the exam. But after scrolling here and there, I found out that the exam topics have been updated since February 2025. So I need to find another resource to cover the updated topics. I saw that since the Kubernetes version is updated to v1.34, the exam topics will contains Gateway API, dynamic storage provisioning, and some other topics so I read the [official documentation](https://kubernetes.io/docs/home/) to cover those topics. Although, I found this [youtube video](https://www.youtube.com/watch?v=eGv6iPWQKyo) that also covers the updated topics, haven't gone through it yet. You might want to check it out, it might be helpful.

A week before the exam, I tried out the mock exam in [killer.sh](https://killer.sh) which is a great platform to simulate the real exam environment. The questions are similar to the real exam, and it gave me a good idea of what to expect during the exam. It also gives the solution of each question, so I can learn from my mistakes. I suggest you to try this platform if you want to prepare for the exam. I got around 69-75% score in the mock exams, which gave me some confidence to take the real exam. The mock exam is included when you buy the exam. You got 2 attempts for free, but you can buy more attempts if you want to practice more. I suggest to try both attempts, it gives you different questions set.

## Exam Day!

Same like my experience taking the CGOA exam, the CKA exam was also needing to use the PSI Exam Browser, cleaning up my table, closing processes, and showing my room. I got 17 questions that I need to answer in 120 minutes with 66% passing grade. Unlike CGOA which is multiple-choice questions, CKA exam is a practical exam where I need to do the tasks in a real Kubernetes cluster with kubectl and shells.

I was given an access to a Kubernetes documentation page and a working remote terminal to a Kubernetes cluster. A little tips from me, you might want to familiarize yourself with the Kubernetes documentation page, it would be very helpful during the exam. You might also want to familiarize yourself with the terminal, kubectl commands, and some bash commands to make your work easier.

To start working on the questions, We need to ssh to a specific machine which was given in the questions. So one question one ssh session. **Don't forget to exit the ssh session when you're done with the question**. I suggest you to read all the questions first, and start with the easiest one. Don't spend too much time on a question, if you find it difficult, skip it and come back later if you have time.

Another tips, try to find out how to copy-paste from the PSI Exam Browser to the ssh terminal. It would save you a lot of time instead of typing the commands one by one and avoiding typos. I wasn't aware about the copy-paste feature, so I spent a lot of time typing the commands.

## Useful Commands

During the exam, I found some useful commands that helped me to create the resources quickly. Here are some of them:

### Creating Resources with Dry-Run

```shell
k create args... --dry-run=client -oyaml > file.yaml
```

### Run a Pod with Interactive Shell

```shell
k run foo --image=nginx:latest --rm -it -- bash
```

### Expose a Pod as a Service

```shell
k expose <resources/name> --port=80 --target-port=80 args...
```

### Autoscale a Deployment

```shell
k autoscale <resource/name> --min=2 --max=5 args...
```

## The Most Difficult Question

For me, the most difficult question was about installing CNI plugin, the helm chart was given, but I need to figure out how to install it properly. I think I got low score on this question.

## Conclusion

My final score is 88%, I passed the exam! After that I bought [Certified Kubernetes Security Specialist (CKS)](https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/) exam which I will take next year hopefully January / March. I hope this blog post can help you to prepare for the CKA exam. Good luck on your CKA!

{{< spotify src="https://open.spotify.com/embed/album/7tUfjtfQLYCIRoStmdboBB?utm_source=generator" text="I'm listening to ONE OK ROCK while writing this article" >}}

Thank you for reading!
