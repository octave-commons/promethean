---
uuid: "4e8f0a2b-3c4d-5e6f-8a9b-1c2d3e4f5a6b"
title: "duck-web — PCM16k worklet + mic wiring fixes -web -web -web"
slug: "pcm16k-worklet-and-mic-fixes"
status: "todo"
priority: "P1"
labels: ["duck-web", "audio", "worklet"]
created_at: "2025-10-08T22:25:23.676Z"
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
