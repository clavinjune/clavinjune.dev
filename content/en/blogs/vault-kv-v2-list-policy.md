---
title: "Vault KV V2 List Policy"
date: 2021-03-25T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: []
aliases: []
description: "This post contains notes on how to create vault policy to show KV-V2 secrets config in Vault UI"
---

Enable kv-v2 on secrets `secret`

```bash
$ vault kv enable-versioning secret
```

Put something inside secrets `secret`

```bash
$ vault kv put secret/your-path your-key=your-value
```

Create policy file

```bash
$ tee policyfile.hcl <<EOF
path "secret/*" {
  capabilities = [ "list" ]
}
path "secret/data/your-path" {
  capabilities = [ "read" ]
}
EOF
```

Please notify that we add policy rules for `secret/data/your-path` even though we use `secret/your-path` as a path. Because KV-V2 add `data` prefix before your path name

Apply the policy file to your role

```bash
$ vault policy write your-role policyfile.hcl
```

Thank you for reading!
