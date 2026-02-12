---
title: "High-level: what you captured correctly ✅"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/spec-review-pt1.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# High-level: what you captured correctly ✅

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/spec-review-pt1.md`
- Category: `promethean`

## Draft Requirements
- **Core framework** (Ollama client, events, bus, locks, config)
- **Tool system** (registry, validation, schema, execution engine)
- **Agent framework** (supervisor tree, tiering, comms, state, tasks)
- **Benchmark framework** (tool-calling, coding agent, interactive, reporting)
- choice policies (`:first`, `:any`, `:best`, `:adaptive`)
- decoy generation config and intent
- metrics that let you build confusion matrices and scoring
- `def-tool` macro resembling OpenAI Agent SDK tool defs
- `def-agent` macro resembling OpenAI Agent SDK agent defs
- both usable in **benchmarks** and **real agents**
- and you want **clj-kondo support**
- `def-tool` -> expands to a tool map + registers it

## Summary Snippets
- Here’s a spec review pass, focused on **coherence**, **missing pieces vs the conversation**, and **the sharp edges that will bite you during implementation**.
- ---

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
