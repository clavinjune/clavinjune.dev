---
title: "Asymmetric Cryptography Signing vs Encrypting"
date: 2020-12-07T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: ["https://images.unsplash.com/photo-1575908539614-ff89490f4a78?w=1920&q=50"]
aliases: ["/blog/asymmetric-cryptography-signing-vs-encrypting-90e288"]
description: >
  This post contains notes about the differences between Signing and Encrypting methods in terms of asymmetric cryptography and its implementation using golang, featuring Alice and Bob.
---

{{< unsplash user="@hocza" src="photo-1575908539614-ff89490f4a78" w="1920" q="50" >}}

When we talk about crypto-something, we need to talk about Alice and Bob acting as actors in the example section. I hope you don't get bored with them as I will use them as examples too. Here, Alice and Bob will use RSA for the asymmetric key, SHA256 for hash function, OAEP for encrypt/decrypt, PSS for sign/verify, and Base64 for the encoding.

## Encrypting

Alice wants to send Bob an important message securely and **`Alice doesn't want anybody to read that message except Bob`**. It might be a love confession, a nuclear code, or perhaps just private spam. Due to their close relationship, Alice and Bob have exchanged their public keys, so romantic, isn't it? So Alice thought of creating a small Go program to create encrypted messages to send to Bob and **`encrypt the message with Bob's public key`**.

```go
import (
  "crypto/rand"
  "crypto/rsa"
  "crypto/sha256"
  "encoding/base64"
  "fmt"
)

func encrypt(key *rsa.PublicKey, plainText string) (string, error) {
  cipherText, err := rsa.EncryptOAEP(sha256.New(), rand.Reader, key, []byte(plainText), nil)

  if err != nil {
    return "", fmt.Errorf("encrypt error: %w", err)
  }

  return base64.StdEncoding.EncodeToString(cipherText), nil
}
```

Alice's encrypted message looks like this:

```plain
fUYx0yO6gkkCah9LmcX2e7puUkl0x4WsCl8UOajVG6sNse6ly6uGnXIXcRKY2R6khxHrPcvsuTaPK6b83QBgNmO0KU7C6kK2kYvah1/rkRK0WAiAfvA3Z+/i5CvUDJ2ZvbvCHjl9YH97qgUrXrZk7DrYMi+J8VIiF6h85ltLRBxAsTtE2zyYr5gZsWYBCp/NRV4i2kF5mBskbDMW6f/f6jm3jWl5zmaxcxF2NX14itK9VIoNUlFukx+5vR/y17ei7ClX4hgkF/Kdw8ruMpyxX74f9RpqK5KRHSjoJThOp2oDqdpK8r4T8wNGx/VfVcwRM8SyV+VMR91w37ppSCCm2E+XzZeFysKGG9Csbwgsh/KzsuJ3rZ30hYit0fDBqJ1PJTt3bNR05503xY7yaoUtQeDRzr+kfi0hdAYHZyiod/ZkUuphB7zYPS26Utn1synocQ82p1FlH8aAtSOREL9Pw9pNNNMi8Cq18Kcn0rmsjC+JFwlnEk5PkFY5ZLdSNMaXcwfh2kx6bH5d65GgRS1rbrRMBPwywkMmQgukjS9QN2R/GXqZlGeznrt/Pf4r0dV+ZLSgRPb0hSDRfEvjMBWLOvGFI/1dxx7AJhoGB/F9VveBHE6Ry5gMrgNs9Fr0cuMw8I651+GhpatwGVoX13WZaa5Q675RGaiVQaZW/W5bYrs=
```

When Bob receives the encrypted message from Alice, Bob wants to read it immediately. So Bob created a program to **`decrypt the message with his private key`**.

```go
import (
  "crypto/rand"
  "crypto/rsa"
  "crypto/sha256"
  "encoding/base64"
  "fmt"
)

func decrypt(key *rsa.PrivateKey, cipherText string) (string, error) {
  cipherBytes, err := base64.StdEncoding.DecodeString(cipherText)

  if err != nil {
    return "", fmt.Errorf("decode error: %w", err)
  }

  plainText, err := rsa.DecryptOAEP(sha256.New(), rand.Reader, key, cipherBytes, nil)

  if err != nil {
    return "", fmt.Errorf("decrypt error: %w", err)
  }

  return string(plainText), nil
}
```

And finally, Bob was able to read Alice's message. Because **` Bob keeps his private key to himself, People can't decrypt Alice's message `** including me, so I can't show the plain message to you in this blog post. Sorry guys.

## Signing

After receiving the message from Alice, Bob was very happy. Bob wants to reply to Alice's message. But Bob forgot where to put Alice's public key. Bob thought of announcing a reply where everyone would know how happy he was after receiving Alice's message. But the problem is, how can **`Bob ensure that the reply isn't modified by others and can be ensured that Bob who announces the reply`**. Bob starts creating a Go program to **`sign the message with his private key so everyone who has Bob's public key can verify that the reply is announced by Bob`** including Alice.

```go
import (
  "crypto"
  "crypto/rand"
  "crypto/rsa"
  "crypto/sha256"
  "encoding/base64"
  "fmt"
)

func sign(key *rsa.PrivateKey, plainText string) (string, error) {
  hash := sha256.New()
  hash.Write([]byte(plainText))
  digest := hash.Sum(nil)

  signature, err := rsa.SignPSS(rand.Reader, key, crypto.SHA256, digest, nil)

  if err != nil {
    return "", fmt.Errorf("sign error: %w", err)
  }

  return base64.StdEncoding.EncodeToString(signature), nil
}
```

Bob's reply looks like this:

```plain
Dear Alice,
I'm so happy hearing that from you.
Sincerely yours, Bob.
```

Bob's signature looks like this:

```plain
Jsl61bOJIzBs+Ccv8jkrVIeyCBPEU9Ps75ig/GnrP7aUncD3BbIP6AJ8x2jR0UK7aGSE6M/MhRN8zWIgwz8qthcACrec+fz99TGF9CRPn+R9cMezdOzZEMT00unO9u6DppNlQeNHLiCEVfVzvZrRP3GnLBYUzmFNM7LdySbwWmeUE/uOWYQT86FM0i1Tr4DXaVJwyVkIURgRIcmqFAYovQM4m+9Br93+SpnPmEiA4P8eWZ8E+Y5qzA4Hv0HXUHYLnGKUVVsVNhM4o8iL7CVgHr5Fd5JWCmGQPbrNUIOzGRiYOV0BQi/uDRkOW0yGbHtjPHjcuykXeHjgAFE1vVZCT1HwMdsJNOKruuXxoeD43UaoJ/h9ac+8sPKwuWEV476oN2Pm9df0E/JRytGYU7/7MDjs2yEuShhKjGWfj2gWCgJzTbx4IVYs+lwmfcODTkM5b4T+CjINzRXFX73INNWP67g3KxgL4k/3ys7i64HIn3ApMli8aZEvAwjkWyh9JHN7xAeE1TtMN3K3zKXqpRNyfg98kazsV7ViOdP7+oGap9z+22B2SIXgUC4B36UBhk+0chcKJv8fFkowQS0lNLwLM1kRwx69SBEgQpy2KV1ia6X81Q3twEz0nQSiy0iJ5/fN7Wllh+F088SLuyOLo7uK1Ieh+DKJda9R+BsgMC+xBG8=
```

Alice who read the announcement **`wants to make sure that the message isn't modified and sent by Bob`**. So Alice **`verified the message using the signature and Bob's public key`**.

```go
import (
  "crypto"
  "crypto/rand"
  "crypto/rsa"
  "crypto/sha256"
  "encoding/base64"
  "fmt"
)

func verify(key *rsa.PublicKey, message, signature string) (bool, error) {
  hash := sha256.New()
  hash.Write([]byte(message))
  digest := hash.Sum(nil)

  signatureBytes, err := base64.StdEncoding.DecodeString(signature)

  if err != nil {
    return false, fmt.Errorf("decode error: %w", err)
  }

  err = rsa.VerifyPSS(key, crypto.SHA256, digest, signatureBytes, nil)

  return err == nil, err
}
```

And it's verified that Bob announced the reply!
To be summarized, `Encrypt` is the method you want to use when `you don't want anyone to read the message except the recipient` while `Sign` is the method you want to use when `you want to make sure the message hasn't been changed and it can be verified that only you who sent it`

You can read the whole Golang code here:

```go
package main

import (
  "crypto"
  "crypto/rand"
  "crypto/rsa"
  "crypto/sha256"
  "encoding/base64"
  "fmt"
)

func hash(message string) []byte {
  hash := sha256.New()
  hash.Write([]byte(message))
  return hash.Sum(nil)
}

func encode(message []byte) string {
  return base64.StdEncoding.EncodeToString(message)
}

func decode(message string) ([]byte, error) {
  return base64.StdEncoding.DecodeString(message)
}

func encrypt(publicKey *rsa.PublicKey, plainText string) (string, error) {
  cipherText, err := rsa.EncryptOAEP(sha256.New(), rand.Reader, publicKey, []byte(plainText), nil)

  if err != nil {
    return "", fmt.Errorf("encrypt error: %w", err)
  }

  return encode(cipherText), nil
}

func decrypt(key *rsa.PrivateKey, cipherText string) (string, error) {
  cipherBytes, err := decode(cipherText)

  if err != nil {
    return "", fmt.Errorf("decode error: %w", err)
  }

  plainText, err := rsa.DecryptOAEP(sha256.New(), rand.Reader, key, cipherBytes, nil)

  if err != nil {
    return "", fmt.Errorf("decrypt error: %w", err)
  }

  return string(plainText), nil
}

func sign(key *rsa.PrivateKey, plainText string) (string, error) {
  digest := hash(plainText)

  signature, err := rsa.SignPSS(rand.Reader, key, crypto.SHA256, digest, nil)

  if err != nil {
    return "", fmt.Errorf("sign error: %w", err)
  }

  return encode(signature), nil
}

func verify(key *rsa.PublicKey, message, signature string) (bool, error) {
  digest := hash(message)

  signatureBytes, err := decode(signature)

  if err != nil {
    return false, fmt.Errorf("decode error: %w", err)
  }

  err = rsa.VerifyPSS(key, crypto.SHA256, digest, signatureBytes, nil)

  return err == nil, err
}

func getBobKey() (*rsa.PrivateKey, *rsa.PublicKey) {
  privateKey, _ := rsa.GenerateKey(rand.Reader, 4096)
  return privateKey, &privateKey.PublicKey
}

func main() {
  bobPriv, bobPub := getBobKey()
  cipher, _ := encrypt(bobPub, "Dear Bob, <REDACTED>")
  plain, _ := decrypt(bobPriv, cipher)
  fmt.Println("cipher text from Alice:", cipher)
  fmt.Println("plain text from Alice:", plain)

  bobReply := `Dear Alice,
I'm so happy hearing that from you.
Sincerely yours, Bob.`

  replySignature, _ := sign(bobPriv, bobReply)
  fmt.Println("reply from Bob:", bobReply)
  fmt.Println("reply signature from Bob:", replySignature)

  isVerified, _ := verify(bobPub, bobReply, replySignature)
  fmt.Println("Was it Bob who sent the message?", isVerified)
}
```

Thank you for reading!
