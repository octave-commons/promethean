---
uuid: "3d7e9f1a-2b3c-4d5e-8f9a-0b1c2d3e4f5a"
title: "duck-web — throttled RTCDataChannel sender with backpressure -web -web -web -web -web -web -web"
slug: "throttled-datachannel-sender"
status: "review"
priority: "P1"
tags: ["duck-web", "webrtc", "perf"]
created_at: "2025-10-10T03:23:55.971Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
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






