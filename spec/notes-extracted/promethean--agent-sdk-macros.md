---
title: "Architecture"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/agent-sdk-macros.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Architecture

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/agent-sdk-macros.md`
- Category: `promethean`

## Draft Requirements
- gives you a **reusable `promethean.ollama.*` module** (good for *real agents* + *benchmarks*)
- makes **tools / agents / cases** feel *natural to write*
- uses **`clojure.spec.alpha`** for argument validation
- plays perfectly with your **tool-choice benchmark + auto-decoys**
- benchmark runner
- production agents"
- JSON schema (OpenAI tool schema shape)
- spec object validating argument maps"
- model
- instructions
- tools
- options

## Summary Snippets
- Alright — **macro-palooza**. 🦆🔥 Below is a **small “agent SDK” for Clojure** that:
- * gives you a **reusable `promethean.ollama.*` module** (good for *real agents* + *benchmarks*) * makes **tools / agents / cases** feel *natural to write* * uses **`clojure.spec.alpha`** for argument validation * plays perfectly with your **tool-choice benchmark + auto-decoys**

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
