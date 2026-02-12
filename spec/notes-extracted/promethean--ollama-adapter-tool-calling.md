---
title: "1) Canonical tool call format (the only thing your runtime needs)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/ollama-adapter-tool-calling.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) Canonical tool call format (the only thing your runtime needs)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/ollama-adapter-tool-calling.md`
- Category: `promethean`

## Draft Requirements
- accept **soft / sloppy tool calls** (json-ish, yaml-ish, function-call-ish)
- **repair** them into a canonical structure
- **validate** with `clojure.spec.alpha` (your “core.alpha” intent)
- execute tools through the **registry + hooks**
- loop until a **final answer**
- optionally support **stream performer mode** (emit partial text + tool events)
- model is OpenAI-native tool calling
- Ollama with some template
- random multimodal model that prints pseudo calls
- **repair layer** can keep trying until it matches spec
- benchmark can score: “was tool call parsable + valid?”
- missing `arguments`

## Summary Snippets
- Alright — now we build the **Ollama adapter** that makes the whole framework actually usable with “kinda tool calling” models like `PetrosStav/gemma3-tools:4b`.
- This adapter will:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
