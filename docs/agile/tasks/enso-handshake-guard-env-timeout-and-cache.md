---
uuid: "7f5d0e5d-2a38-4bb7-bb3a-2f8a4b1b2e31"
title: "enso-browser-gateway — handshake guard env timeout + cache ready"
slug: "enso-handshake-guard-env-timeout-and-cache"
status: "todo"
priority: "P2"
tags: ["enso", "gateway", "handshake", "ops"]
created_at: "2025-10-10T03:23:55.970Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







#Todo

## 🛠️ Description
Add `ENSO_HANDSHAKE_TIMEOUT_MS` env override. Short-circuit `ensureHandshake()` once ready; avoid hot-path awaits.

## Requirements
- [ ] Read timeout from env with sane default 10_000
- [ ] Cache readiness in ensureHandshake()
- [ ] Tests cover timeout override + cache

## ⛓️ Blocks
- ~~Merge PR #1451~~ ✅ MERGED 2025-10-02T20:51:28Z

## 🔍 Related
- PR #1451






