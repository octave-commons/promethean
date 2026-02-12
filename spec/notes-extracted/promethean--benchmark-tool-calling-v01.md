---
title: "1) Shared Ollama namespace (for all benchmarks)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v01.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) Shared Ollama namespace (for all benchmarks)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v01.md`
- Category: `promethean`

## Draft Requirements
- a shared **`ollama`** client namespace (for all benchmarks)
- a tiny **tool registry + `def-tool` macro** (so `tools.clj` can define tools + implementations)
- a new **tool-calling benchmark** that loads `tools.clj`, runs an agent loop, and scores tool-calling quality
- Tool calling: https://docs.ollama.com/capabilities/tool-calling"
- :host          (default http://localhost:11434)
- :model         (required)
- :messages      (required) [{:role \"user\" :content \"...\"} ...]
- :tools         (optional) ollama tool schemas [{:type \"function\" :function {...}} ...]
- :stream        (default false) (this helper is non-streaming)
- :think         (optional true/false for models that support it)
- :options       (optional map) passed to Ollama (temperature, seed, etc)
- :timeout-ms    (default 5 minutes)

## Summary Snippets
- Below is a complete, repo-ready implementation of:
- 1. a shared **`ollama`** client namespace (for all benchmarks) 2. a tiny **tool registry + `def-tool` macro** (so `tools.clj` can define tools + implementations) 3. a new **tool-calling benchmark** that loads `tools.clj`, runs an agent loop, and scores tool-calling quality

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
