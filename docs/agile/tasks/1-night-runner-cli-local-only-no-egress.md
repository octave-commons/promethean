---
uuid: "91b3c12c-3d6a-4d09-87ad-d6fb1f8cc5f0"
title: "1) Night runner + CLI (local-only, no egress)"
slug: "1-night-runner-cli-local-only-no-egress"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-08T20:10:46.009Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.10.07.00.45.09.md

## 📝 Context Summary

love it. here’s **Pantheon — Part 5**: a compact, runnable-ish skeleton you can drop into your monorepo to start night runs, trace mining, and adapter training — without ever touching the cloud at night.

I’m keeping this practical and opinionated. Citations back the big design levers (throughput, tool-calling, adapter training, queue math).

---

# 1) Night runner + CLI (local-only, no egress)

> Ops: run the night user under a profile with outbound egress blocked. This is your “never fallback to cloud” seatbelt.

---

# 2) vLLM + OpenVINO: pick one (or both)

* **vLLM (GPU)** — run a local OpenAI-compatible server; it gives you **PagedAttention** (KV cache paging) and **continuous batching** out of the box, so lots of small jobs amortize prefill and throughput spikes. ([arXiv][1])
* **OpenVINO (CPU/iGPU/NPU)** — there’s a step-by-step **Qwen-Agent function-calling** tutorial that stays fully local; great for low-VRAM hosts. ([OpenVINO Documentation][2])

You can point Pantheon’s `modelCall()` at either engine; both support function/tool calling flows with Qwen templates. ([Qwen][3])

---

# 3) Deterministic tool loop (finite-state, schema-strict)

This is the boring backbone that

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
