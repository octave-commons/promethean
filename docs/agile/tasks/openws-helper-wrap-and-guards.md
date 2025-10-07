---
```
uuid: 2c6e5a8d-7c9b-4a1b-b2d3-4e5f6a7b8c9d
```
title: duck-web — openWs helper DI wrapper + bearer guard
```
status: in_progress
```
priority: P2
labels:
  - duck-web
  - websocket
  - auth
```
created_at: '2025-10-02T00:00:00.000Z'
```
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
