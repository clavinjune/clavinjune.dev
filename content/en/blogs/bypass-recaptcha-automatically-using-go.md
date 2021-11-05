---
title: "Bypass ReCAPTCHA Automatically Using Go"
date: 2021-11-05T07:16:12+07:00
draft: true
iscjklanguage: false
isarchived: false
categories: ["sponsored"]
images: ["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&q=50"]
aliases: []
description: "Bypassing Google ReCAPTCHA automatically using 2Captcha, Chromedp, and Go"
---

{{< unsplash user="@agk42" src="photo-1485827404703-89b55fcc595e" q="50" >}}

## Introduction

A captcha sometimes could be annoying. It is even more annoying when you are working on automation software. A captcha, from a simple calculation, a slider captcha, HCpatcha, and ReCaptcha are not easy to be solved using automation. You may create a deep/machine learning model to solve the captcha. But, how about the training datasets? It will be bulky to work with the training datasets, or else, it will be hard. That's why many sites use captcha to prevent automation/bot.

But, what if you have someone that would solve the captcha for you? Wouldn't it be easier? You don't need to think about solving the captcha and start focusing on the real problem. That's where [2Captcha](https://2captcha.com/) comes as a captcha solver. `2Captcha` is a captcha solving software that may help you with solving captchas. `2Captcha` has a varied library to work with various programming languages. So whatever languages you use, 2Captcha's API is there for you.

In this sponsored article, you will learn how to bypass Google ReCaptcha using 2Captcha and Golang. You will also use Chromedp to automate the job. [Here](https://github.com/ClavinJune/2captcha-example), I already have created a Github repository that you may want to clone.

## Clone the Repository

```bash
$ git clone https://github.com/ClavinJune/2captcha-example
$ cd 2captcha-example/
$ tree .
.
├── go.mod
├── go.sum
├── main.go
├── Makefile
└── README.md

0 directories, 5 files
```

## Usage

```bash
$ go mod download
$ $ API_KEY=XXXXXXXX make run
2021/11/05 08:06:46 Status 200 OK data OK|684...
2021/11/05 08:06:59 Status 200 OK data CAPCHA_NOT_READY
2021/11/05 08:07:10 Status 200 OK data CAPCHA_NOT_READY
2021/11/05 08:07:21 Status 200 OK data CAPCHA_NOT_READY
2021/11/05 08:07:32 Status 200 OK data CAPCHA_NOT_READY
2021/11/05 08:07:44 Status 200 OK data CAPCHA_NOT_READY
2021/11/05 08:07:57 Status 200 OK data OK|03A...
2021/11/05 08:07:57 bypass recaptcha success 1m20.852741298s
```

Let me explain how the code works.

## Main File

You may want to focus only on the `main.go` file because the other file is just supportive files.

### Helper Function

```go {linenostart=13}
...

func wait(sel string) cdp.ActionFunc {
  return run(1*time.Second, cdp.WaitReady(sel))
}

func run(timeout time.Duration, task cdp.Action) cdp.ActionFunc {
  return runFunc(timeout, task.Do)
}

func runFunc(timeout time.Duration, task cdp.ActionFunc) cdp.ActionFunc {
  return func(ctx context.Context) error {
    ctx, cancel := context.WithTimeout(ctx, timeout)
    defer cancel()

    return task.Do(ctx)
  }
}

...
```

- `runFunc` creates timeouts for the given `chromedp actionFunc`
- `run` wraps `runFunc` to help it works with `chromedp action`
- `wait` wraps `run` to make Chromedp wait for the element given as a selector inside the parameter

### Captcha Solver

```go {linenostart=30}
...

func solveReCaptcha(client *api2captcha.Client, targetURL, dataSiteKey string) (string, error) {
  c := api2captcha.ReCaptcha{
    SiteKey:   dataSiteKey,
    Url:       targetURL,
    Invisible: true,
    Action:    "verify",
  }

  return client.Solve(c.ToRequest())
}

...
```

`solveRecaptcha` solves your Google ReCAPTCHA using the 2Captcha Golang library which you can see the code and documentation [here](https://github.com/2captcha/2captcha-go#recaptcha-v2).

### Chromedp Actions

```go {linenostart=41}
...

func recaptchaDemoActions(client *api2captcha.Client) []cdp.Action {
  const targetURL string = "https://www.google.com/recaptcha/api2/demo"
  var siteKey string
  var siteKeyOk bool

  return []cdp.Action{
    run(5*time.Second, cdp.Navigate(targetURL)),
    wait(`[data-sitekey]`),
    wait(`#g-recaptcha-response`),
    wait(`#recaptcha-demo-submit`),
    run(time.Second, cdp.AttributeValue(`[data-sitekey]`, "data-sitekey", &siteKey, &siteKeyOk)),
    runFunc(5*time.Minute, func(ctx context.Context) error {
      if !siteKeyOk {
        return errors.New("missing data-sitekey")
      }

      token, err := solveReCaptcha(client, targetURL, siteKey)
      if err != nil {
        return err
      }

      return cdp.
        SetJavascriptAttribute(`#g-recaptcha-response`, "innerText", token).
        Do(ctx)
    }),
    cdp.Click(`#recaptcha-demo-submit`),
    wait(`.recaptcha-success`),
  }
}

...
```

Inside the `recaptchaDemoActions`, you can define your `targetURL` as for this example is [Google ReCAPTCHA demo page](https://www.google.com/recaptcha/api2/demo).

### Actions Explanation

```go {linenostart=49}
  run(5*time.Second, cdp.Navigate(targetURL)),
```

Navigate to the `targetURL` and give it a timeout depending on your internet speed.

```go {linenostart=50}
  wait(`[data-sitekey]`),
```

Wait for the element that has `[data-sitekey] attribute` which is the Google ReCAPTCHA site key that you will pass as the `solveRecaptcha` function.

```go {linenostart=51}
  wait(`#g-recaptcha-response`),
```

Wait for the element where you can put the Google ReCAPTCHA solution that the `solveRecaptcha` function will provide.

```go {linenostart=52}
  wait(`#recaptcha-demo-submit`),
```

Wait for the submit button element.

```go {linenostart=53}
  run(time.Second, cdp.AttributeValue(`[data-sitekey]`, "data-sitekey", &siteKey, &siteKeyOk)),
```

Fetch the `data-sitekey` attribute from the `[data-sitekey]` element, then put it on the `siteKey` and `siteKeyOk` variables.

```go {linenostart=54}
  runFunc(5*time.Minute, func(ctx context.Context) error {
    if !siteKeyOk {
      return errors.New("missing data-sitekey")
    }

    token, err := solveReCaptcha(client, targetURL, siteKey)
    if err != nil {
      return err
    }

    return cdp.
      SetJavascriptAttribute(`#g-recaptcha-response`, "innerText", token).
      Do(ctx)
  }),
```

If the `siteKeyOk` variable returns false, it means the `siteKey` is not found. Otherwise, you pass it to the `solveRecaptcha` function along with `2Captcha's client` and your `targetURL`. The function blocks the flow until it returns the `token`. And then, you set the token as the `#g-recaptcha-response` element's `innerText`.

```go {linenostart=68}
  cdp.Click(`#recaptcha-demo-submit`),
```

Click the submit button right after the `token` is set.

```go {linenostart=69}
  wait(`.recaptcha-success`),
```

Wait for the `.recaptcha-success` element that indicates that your captcha is successfully bypassed.

### Main Function

```go {linenostart=71}
...

func main() {
  client := api2captcha.NewClient(os.Getenv("API_KEY"))
  actions := recaptchaDemoActions(client)

  opts := append(cdp.DefaultExecAllocatorOptions[:],
    cdp.WindowSize(1366, 768),
    cdp.Flag("headless", false),
    cdp.Flag("incognito", true),
  )

  allocCtx, allocCancel := cdp.NewExecAllocator(context.Background(), opts...)
  defer allocCancel()
  ctx, cancel := cdp.NewContext(allocCtx)
  defer cancel()

  start := time.Now()
  err := cdp.Run(ctx, actions...)
  end := time.Since(start)

  if err != nil {
    log.Println("bypass recaptcha failed:", err, end)
  } else {
    log.Println("bypass recaptcha success", end)
  }
}

...
```

To Use the 2Captcha's services, you may need to provide the API Key. You can get the API Key by registering to the 2Captcha's service [here](https://2captcha.com?from=12928628) by using my referral link.

After you have set the 2Captcha's client, pass it to the `recaptchaDemoActions` function to get your Chromedp actions. Optionally, You may set the `opts` on line 77 to configure your Chromedp flags. You can refer to the docs to see other options. Then,  create the Chromedp context and run it. You may see the code's output just like in the [usage](#usage) section.

## Conclusion

After all the journey, you may find it interesting to solve the Google ReCAPTCHA automatically. You may want to use 2Captcha's services to solve other captchas besides Google Recaptcha by referring to the docs. It is straightforward and super easy to use.

Thank you for reading!
