---
uuid: "e02f9c17-8d25-48bf-bad9-bd145a14c9a3"
title: "Task: Context Layer Between Codex and Local LLMs"
slug: "openai-compatable-api"
status: "done"
priority: "P3"
labels: ["between", "codex", "context", "local"]
created_at: "2025-10-11T19:22:57.823Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Task: Context Layer Between Codex and Local LLMs

## Description

We need to design and implement a **context-building service** under `services/ts/` that sits between Codex and local language models (e.g., Ollama). This service must **expose an OpenAI-compatible API** so that Codex and other OpenAI SDK-based clients can interact with it without modification.

The service will:

* Accept requests via OpenAI-compatible REST endpoints `/v1/chat/completions`, `/v1/completions`, etc..
* Retrieve relevant Promethean monorepo context (functions, agents, configs, docs) using the SmartGPT Bridge `/search`, `/grep`, `/symbols`.
* Authorize all requests to the SmartGPT Bridge with a static token.
* Dynamically enrich model prompts with this context before forwarding to Ollama (first backend) or other local LLMs.
* Provide standardized outputs in OpenAI response format, while also persisting enriched context into Obsidian artifacts under `docs/`.

## Requirements / Definition of Done ✅

* [ ] Service implemented under `services/ts/codex-context/`.
* [ ] Exposes OpenAI-compatible API endpoints `/v1/chat/completions`, `/v1/completions`, etc..
* [ ] Accepts OpenAI-style requests (same JSON schema) and returns OpenAI-style responses.
* [ ] Codex requests transparently pass through this service.
* [ ] Relevant repo context (code, AGENTS.md, docs) is retrieved via SmartGPT endpoints.
* [ ] SmartGPT requests must be authorized with a static token.
* [ ] Prompt construction supports append-only structured augmentation (preserves provenance & citations).
* [ ] Configurable for different LLM backends (Ollama first, extend later).
* [ ] Outputs are standardized into:

  * OpenAI API response developer-facing.
  * Obsidian artifacts under `docs/` (structured markdown with citations).
* [ ] Tests are written for:

  * OpenAI API compatibility (request schema, response schema).
  * CLI interception and request routing.
  * SmartGPT Bridge request authorization.
  * Context assembly and augmentation logic.
  * Output format validation CLI + Obsidian.
* [ ] Verified against at least one coding workflow (e.g., agent development guided by AGENTS.md).

## Tasks 🛠️

* [ ] Step 1: Define OpenAI-compatible API surface `/v1/chat/completions`, `/v1/completions`.
* [ ] Step 2: Build `services/ts/codex-context/` with service scaffolding.
* [ ] Step 3: Implement CLI interception layer Codex → Context Service → LLM.
* [ ] Step 4: Integrate SmartGPT Bridge retrieval `/search`, `/grep`, `/symbols` with static token auth.
* [ ] Step 5: Implement context-aware prompt builder (citations, provenance, structured outputs).
* [ ] Step 6: Add backend configurability (Ollama first, extend later).
* [ ] Step 7: Write full test suite (API compatibility, routing, token auth, prompt assembly, outputs).
* [ ] Step 8: Test with a sample workflow e.g., `agents/duck/AGENTS.md`.
* [ ] Step 9: Export results into `docs/architecture/codex-context.md` with Obsidian graphs.

## Relevant Resources 📚

* ChatGPT - Using Codex with Ollama(https://chatgpt.com/share/68a74084-31fc-8004-b327-68ea8a979fab)
* AI-assisted Coding with Cody: Lessons from Context Retrieval and Evaluation for Code Recommendations(https://arxiv.org/html/2408.05344v1)

## Comments 💬

Agents can use this task to maintain append-only discussions on design decisions, tradeoffs, and testing.
