---
uuid: "dcca8f9b-36fc-460f-b189-657288f0bdb2"
title: "1) Workspace skeleton"
slug: "1-workspace-skeleton"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-08T20:10:46.013Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.10.08.01.09.53.md

## 📝 Context Summary

Rad. Let’s ship the actual scaffold so you can run it on your 8 GB box and compare locals (Gemma 3 “tools”, Gemma 3n Tools, MiniCPM-V 4.5) against remote judges (OpenRouter / Z.ai).

I’m giving you a **pnpm workspace** (Native ESM, AVA, functional style) with:

* runners for **BFCL** (tool-use) and **Aider Polyglot** (coding)
* a minimal **vision** check (MiniCPM-V 4.5 via OpenAI-compatible `/v1` with `image_url`)
* an **SDK** to define your own benchmarks + a simple LLM judge

All the moving parts map to current, documented interfaces (Ollama OpenAI-compat + tools, Aider’s `ollama_chat`, BFCL CLI). ([Ollama][1])

---

# 1) Workspace skeleton

**root/package.json**

**pnpm-workspace.yaml**

---

# 2) Core SDK (types, provider, judge)

**bench-core/src/types.ts**

**bench-core/src/providers/openaiLike.ts**

**bench-core/src/judges/llmJudge.ts**

**bench-core/src/sdk/bench.ts** – for *your* custom benchmarks

---

# 3) CLI (runs BFCL, Polyglot, and your custom tasks)

**bench-cli/config.example.yaml**

**bench-cli/src/index.ts**

**bench-cli/ava.config.mjs**

**bench-cli/test/smoke.test.ts**

---

# 4) Tiny web viewer (Web Components)

**bench-web/index.html**

**bench-web/src/result

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
