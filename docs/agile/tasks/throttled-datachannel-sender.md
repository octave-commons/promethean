---
```
uuid: 3d7e9f1a-2b3c-4d5e-8f9a-0b1c2d3e4f5a
```
title: duck-web — throttled RTCDataChannel sender with backpressure
```
status: in_progress
```
priority: P1
labels:
  - duck-web
  - webrtc
  - perf
```
created_at: '2025-10-02T00:00:00.000Z'
```
---
#Todo

## 🛠️ Description
Implement `makeThrottledSender(ch, threshold)` using `bufferedamountlow` event; fix typos; default threshold ~1 MiB.

## Requirements
- [ ] Unit tests simulate bufferedAmount changes
- [ ] Type-correct (`RTCDataChannel`)
- [ ] No magic globals

## ⛓️ Blocks
- Merge PR #1445

## 🔍 Related
- PR #1445
