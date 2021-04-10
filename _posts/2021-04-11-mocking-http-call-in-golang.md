---
category: Notes
title: Mocking HTTP Call in Golang
tags: golang http test
thumbnail: https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1920
description: This post contains notes on how to mock HTTP Call in golang.
---

![Photo by @kellysikkema on Unsplash](https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1920)

This blog post code is running on go1.16.2

## API Interface to be tested

```go
type API interface {
  // this function will do http call to external resource
  FetchPostByID(ctx context.Context, id int) (*APIPost, error)
}

type APIPost struct {
  ID     int    `json:"id"`
  UserID int    `json:"userId"`
  Title  string `json:"title"`
  Body   string `json:"body"`
}
```

We can simply mock the `API interface FetchPostByID function` result in our unit test by creating a mock implementation of the `API interface` like this:

## API Mock implementation

```go
type APIMock struct {}

func (a APIMock) FetchPostByID(ctx context.Context, id int) (*APIPost, error) {
  return nil, fmt.Errorf(http.StatusText(http.StatusNotFound))
}
```

But by doing that, it doesn't increase the test coverage and it will skip the rest of the code inside the `FetchPostByID` real implementation.

So we're gonna make the testable real implementation first of the `API interface`.

## Implementation

To mock only the HTTP Call, we need to create http.Client mock implementation. the `real http.Client` have `Do function` that executed whenever we want to do HTTP call. So we need to mock the `Do function`. Because `http.Client` doesn't have any interface implemented by it, we need to create one.


### HTTP Client Mock

```go
type HTTPClient interface {
  Do(*http.Request) (*http.Response, error)
}

type HTTPClientMock struct {
  // DoFunc will be executed whenever Do function is executed
  // so we'll be able to create a custom response
  DoFunc func(*http.Request) (*http.Response, error)
}

func (H HTTPClientMock) Do(r *http.Request) (*http.Response, error) {
  return H.DoFunc(r)
}
```

### API Implementation Struct

```go
func NewAPI(client HTTPClient, baseURL string, timeout time.Duration) API {
  return &apiV1{
    c:       client,
    baseURL: baseURL,
    timeout: timeout,
  }
}

type apiV1 struct {
  // we need to put the http.Client here
  // so we can mock it inside the unit test
  c       HTTPClient
  baseURL string
  timeout time.Duration
}

func (a apiV1) FetchPostByID(ctx context.Context, id int) (*APIPost, error) {
  u := fmt.Sprintf("%s/posts/%d", a.baseURL, id)

  ctx, cancel := context.WithTimeout(ctx, a.timeout)
  defer cancel()

  req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
  if err != nil {
    return nil, err
  }

  resp, err := a.c.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode != http.StatusOK {
    return nil, fmt.Errorf(http.StatusText(resp.StatusCode))
  }

  var result *APIPost
  return result, json.NewDecoder(resp.Body).Decode(&result)
}
```

### Unit Test

```go
var (
  // our custom client
  client = &HTTPClientMock{}
  // our api
  api = NewAPI(client, "", 0)
)

func TestApiV1_FetchPostByID(t *testing.T) {
  // test table
  tt := []struct {
    // Body mock the response body
    Body string
    // StatusCode mock the response statusCode
    StatusCode int

    // Expected Result
    Result *APIPost
    // Expected Error
    Error error
  }{
    {
      Body:       `{"userId": 1,"id": 1,"title": "test title","body": "test body"}`,
      StatusCode: 200,
      Result: &APIPost{
        ID:     1,
        UserID: 1,
        Title:  "test title",
        Body:   "test body",
      },
      Error: nil,
    },
    {
      Body:       `{"userId": 2,"id": 2,"title": "test title2","body": "test body2"}`,
      StatusCode: 200,
      Result: &APIPost{
        ID:     2,
        UserID: 2,
        Title:  "test title2",
        Body:   "test body2",
      },
      Error: nil,
    },
    {
      Body:       ``,
      StatusCode: http.StatusNotFound,
      Result:     nil,
      Error:      fmt.Errorf(http.StatusText(http.StatusNotFound)),
    },
    {
      Body:       ``,
      StatusCode: http.StatusBadRequest,
      Result:     nil,
      Error:      fmt.Errorf(http.StatusText(http.StatusBadRequest)),
    },
  }

  for _, test := range tt {
    // we adjust the DoFunc for each test case
    client.DoFunc = func(r *http.Request) (*http.Response, error) {
      return &http.Response{
        // create the custom body
        Body: io.NopCloser(strings.NewReader(test.Body)),
        // create the custom status code
        StatusCode: test.StatusCode,
      }, nil
    }

    // execute the func
    p, err := api.FetchPostByID(context.Background(), 0)

    // validation
    if err != nil && err.Error() != test.Error.Error() {
      t.Fatalf("want %v, got %v", test.Error, err)
    }

    if !reflect.DeepEqual(p, test.Result) {
      t.Fatalf("want %v, got %v", test.Result, p)
    }
  }
}
```

Because we only change the `http.Client`, our `FetchPostByID func` is tested as it is except for this line:

```go
resp, err := a.c.Do(req)
```

Because the `a.c.Do` is already adjusted with our mock `DoFunc` inside the unit test, the `a.c.Do` behavior will be changed according to this line:

```go
client.DoFunc = func(r *http.Request) (*http.Response, error) {
  return &http.Response{
    Body: io.NopCloser(strings.NewReader(test.Body)),
    StatusCode: test.StatusCode,
  }, nil
}
```

Let's run the test

```bash
$ go test ./... -race -coverprofile /tmp/coverage.out && go tool cover -html=/tmp/coverage.out
```

![Test Coverage]({{ site.url }}/assets/img/mocking-http-call-in-golang-92d768/f6191b56.png)