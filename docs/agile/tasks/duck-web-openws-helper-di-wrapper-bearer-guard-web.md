---
uuid: "2c6e5a8d-7c9b-4a1b-b2d3-4e5f6a7b8c9d"
title: "duck-web — openWs helper DI wrapper + bearer guard -web"
slug: "duck-web-openws-helper-di-wrapper-bearer-guard-web"
status: "done"
priority: "P2"
labels: ["auth", "duck-web", "websocket"]
created_at: "2025-10-11T19:22:57.822Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

#Todo

## 🛠️ Description
Wrap `openWs` with injectable factory; skip `bearer.*` subprotocol when token absent.

## Requirements
- [ ] Pure helper with DI
- [ ] Unit tests mocking Ws factory

## ⛓️ Blocks
- Merge PR #1446

## 🔍 Related
- PR #1446
