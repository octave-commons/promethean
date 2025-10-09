---
uuid: "72732491-3400-48d2-858a-7e68f6aa7878"
title: "1) Agent registry (flat, ESM)"
slug: "1-agent-registry-flat-esm"
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

- Path: docs/labeled/2025.10.07.00.54.37.md

## 📝 Context Summary

Alright, let’s lock in **Pantheon — Part 6**: registry, local model clients (vLLM/OpenVINO), a safer `modelCall()` wrapper for function-calling, the morning-report aggregator, and a tiny QLoRA trainer stub + CLI glue. All GPL-3.0-only, FP-leaning TS, ESM, AVA. Night stays **local-only**—period.

I’m citing a few core references below for the choices (vLLM’s continuous batching/PagedAttention, QLoRA adapters, Toolformer-style trace mining, Qwen function-calling, OpenVINO agent path, Erlang-C, κ). vLLM gives you throughput via **continuous batching** and **PagedAttention**; QLoRA is the pragmatic path to local specialization; Qwen’s function calling is well-documented and pairs nicely with a deterministic tool loop. ([VLLM Documentation][1]) ([arXiv][2]) ([arXiv][3]) ([Qwen][4]) ([OpenVINO Documentation][5])

---

# 1) Agent registry (flat, ESM)

---

# 2) Local model clients (vLLM / OpenVINO)

Two swappable drivers behind one interface. vLLM runs an OpenAI-compatible server locally (gives you **continuous batching** + **PagedAttention** throughput). OpenVINO keeps you fully local on CPU/iGPU with a Qwen function-calling tutorial you can crib from. ([VLLM Documentation][1]) ([OpenVIN

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
