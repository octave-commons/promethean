---
uuid: "ce8babff-f013-4e3e-a7ca-0824cb67d7d5"
title: "Files you’ll add to your repo"
slug: "files-youll-add-to-your-repo"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.818Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.10.07.22.05.53.md

## 📝 Context Summary

Great links — they change the plan a bit. Short version: use **Aider’s Polyglot benchmark** for coding and **BFCL** for tool use. Both have solid, actively maintained harnesses and are already wired for OpenAI-compatible endpoints (which Ollama can expose). Unsloth’s Qwen3 GGUFs also support **/think** vs **/no_think**, so we’ll test both. ([Aider][1])

Below is a single, opinionated bash script that:

* builds multiple **Ollama** variants from local GGUFs (you can mix 8B/14B, and different quants)
* runs **Aider Polyglot** (in Docker, as the harness recommends) and collects Pass-1/Pass-2
* runs **BFCL** (tool use) against your **OpenAI-compatible** endpoint
* compares **/think** vs **/no_think** modes for Qwen3 (important for coding accuracy & latency)

> Reality check: BFCL measures *function/tool calling*. If you point it at a plain base instruct model with no function-calling finetune, don’t expect pretty scores. If you want a fair “tool use” comparison for open models, add at least one purpose-built FC model (e.g., Gorilla OpenFunctions) as a reference. ([Gorilla][2])

---

# Files you’ll add to your repo

### `models.tsv`

A flat, editable list of model variants to test. Path

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
