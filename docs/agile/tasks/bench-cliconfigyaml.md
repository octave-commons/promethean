---
uuid: "a81b76df-28b7-4500-9c1f-981cf057de48"
title: "bench-cli/config.yaml"
slug: "bench-cliconfigyaml"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.817Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🗂 Source

- Path: docs/labeled/2025.10.07.22.55.04.md

## 📝 Context Summary

awesome—let’s lock this into a real, repeatable framework you can drop into your monorepo. i’ll give you:

* the **suite** to run (coding, tool-use, vision, knowledge)
* the **SDK shape** (TypeScript, ESM, AVA) for custom benchmarks
* a **config** that targets your 8 GB VRAM reality (Gemma3 “tools”, Gemma3n Tools, MiniCPM-V 4.5) + remote judges (OpenRouter / Z.ai)
* the boring-but-critical **repro & security knobs**

I’m grounding every claim to working docs/tools so you’re not chasing vibes.

---

## what we’re standardizing on

* **Tool-calling:** BFCL (Berkeley Function Calling). It’s an executable function-calling eval with a maintained CLI (`bfcl-eval`) that can talk to any OpenAI-compatible endpoint, including **Ollama’s `/v1`**. Use the “prompt” track for generic instruct models, and FC track if the model natively supports OpenAI tools. ([PyPI][1])
* **Coding:** Aider **Polyglot** (225 Exercism problems). It ships a Docker harness and supports **Ollama via `ollama_chat/<model>`**. This is the coding eval Unsloth itself uses for Dynamic GGUF claims. ([Aider][2])
* **Vision (local):** **MiniCPM-V 4.5** (Ollama card + GH docs). Good single-image VLM that will run on consumer ri

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs



