---
uuid: "0a64c49d-5084-404c-b381-edb1b277e3f7"
title: "Monorepo: Promethean Unified LLM Gateway"
slug: "monorepo-promethean-unified-llm-gateway"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-12T02:22:05.425Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































## 🗂 Source

- Path: docs/labeled/2025.10.08.01.18.23.md

## 📝 Context Summary

awesome — I dropped a full TypeScript monorepo scaffold into the canvas with:

* OpenAI/Claude/Ollama-compatible endpoints
* Router + scheduler with backpressure (no 429 to client; it waits until a slot opens, up to a max wait)
* Provider adapters (OpenAI, Anthropic, Ollama)
* Token-bucket rate limits (in-mem with optional Redis)
* Idempotent tools: seed-registry & warmup-healthcheck
* Docker compose for Redis + Ollama

## run it

1. clone the code from the canvas into a new repo (or copy/paste files):

* copy the file blocks into your filesystem preserving paths

2. install + build:

3. smoke test:

## what’s next (I can add this if you want)

* true provider branching in the OpenAI adapter (so a `model` alias mapped to Anthropic/Ollama uses the right backend)
* SSE streaming in each adapter (OpenAI delta / Claude events / Ollama tokens)
* tool/function-call schema normalization (OpenAI ⇄ Anthropic)
* per-user/project budgets + fair-share weights
* embeddings endpoint + cache
* HF/TGI, OpenRouter, Z.ai, OpenVINO adapters

tell me which of those you want first, and I’ll wire it up.
# Monorepo: Promethean Unified LLM Gateway

Below is a complete scaffold you can paste into a new rep

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs








































































































