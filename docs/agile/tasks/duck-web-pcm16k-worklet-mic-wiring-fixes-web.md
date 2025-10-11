---
uuid: "4e8f0a2b-3c4d-5e6f-8a9b-1c2d3e4f5a6b"
title: "duck-web — PCM16k worklet + mic wiring fixes -web"
slug: "duck-web-pcm16k-worklet-mic-wiring-fixes-web"
status: "ready"
priority: "P1"
labels: ["audio", "duck-web", "worklet"]
created_at: "2025-10-11T19:22:57.820Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Todo

## 🛠️ Description
Fix syntax errors in `pcm16k-worklet.js`, track fractional position to avoid drift; correct imports in `mic.ts`; reuse `duck-audio` helpers.

## Requirements
- [x] `registerProcessor('pcm16k', ...)` correct
- [x] Drift-free decimator
- [x] `float32ToInt16` from `duck-audio`
- [ ] Integration test: mic → worklet → PCM16

## ⛓️ Blocks
- Merge PR #1443

## 🔍 Related
- PR #1443, PR #1442
