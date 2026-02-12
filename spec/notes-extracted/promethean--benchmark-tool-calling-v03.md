---
title: "1) Replace `promethean.benchmark.tools` (adds spec validation)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v03.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) Replace `promethean.benchmark.tools` (adds spec validation)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v03.md`
- Category: `promethean`

## Draft Requirements
- ✅ `def-tool` now supports **`clojure.spec.alpha` arg validation** (your “core.alpha” intent, but using the real spec namespace)
- ✅ Tool-choice test support (correct tool selection among multiple)
- ✅ New `def-agent` macro + agent registry (OpenAI Agent SDK-ish shape)
- ✅ Benchmark can optionally load `agents.clj` + run cases with a chosen agent
- registry entry (name -> {:name :description :parameters :invoke :args-spec ...})
- Ollama/OpenAI-ish tool schema:
- required keys are checked via JSON schema `required`
- optional clojure.spec.alpha validation via :args-spec"
- keyword/symbol keys -> string keys
- keyword/symbol values -> string values"
- a map
- a JSON string

## Summary Snippets
- Yep — let’s do it.
- Below are **repo-ready full-file replacements + a new namespace**:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
