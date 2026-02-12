---
title: "Vision + Image Generation Benchmark Suite Specification"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/vision-benchmark-spec.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Vision + Image Generation Benchmark Suite Specification

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/vision-benchmark-spec.md`
- Category: `promethean`

## Draft Requirements
- `PetrosStav/gemma3-tools:4b` (small, **vision + tool calling**) ([Ollama][1])
- performative “streaming / entertainment / YouTube” workflows (fast, punchy, visually aware, tool-using)
- **Understand images** (captioning, VQA, OCR-ish tasks, UI understanding)
- **Use tools correctly** *because of what it saw* (vision-grounded tool choice)
- **Act performatively** (streaming commentary, comedic bits, “host energy”, thumbnail copy)
- **Drive image generation** by calling an image-gen tool (prompt + parameters + constraints), even if the model itself can’t render images
- This suite does **not** try to “fully solve” fuzzy creative judging with only deterministic checks.
- This suite does **not** assume the model can directly output images; image generation is tested via **tool calling**.
- This suite is not a leaderboard; it’s for **practical selection** for your streaming/content workflows.
- `PetrosStav/gemma3-tools:4b` ([Ollama][1])
- Vision input is delivered via `messages[i].images` in Ollama Chat API. ([GitHub][2])
- Tool calling behavior depends on the model template; the “tools Gemma3” variants explicitly instruct tool formatting (e.g. `<tool> { "name": ..., "parameters": ... } </tool>`). ([Ollama][3])

## Summary Snippets
- Below is a **new benchmark spec** for **vision + image-generation (via tool-calling)**, designed to plug into the exact framework we’ve been building (suites → cases → JSONL events → UI report), and aimed directly at benching:
- * `PetrosStav/gemma3-tools:4b` (small, **vision + tool calling**) ([Ollama][1]) * performative “streaming / entertainment / YouTube” workflows (fast, punchy, visually aware, tool-using)

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
