---
title: "1) Replace `promethean.benchmark.tools`"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v02.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) Replace `promethean.benchmark.tools`

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v02.md`
- Category: `promethean`

## Draft Requirements
- ✅ **JSON Schema is now actually JSON** (string keys, string `"type"`, etc). Your previous `:parameters` could silently be “Clojure schema-ish” and break tool calling.
- ✅ **Tool call args can be a map OR a JSON string** (both show up in the wild).
- ✅ **Tool result messages include `tool_call_id`** (critical for compatibility; Ollama ecosystems often expect this). ([GitHub][1])
- ✅ **Cases can expect multiple tool calls** in sequence, not just the first.
- ✅ Adds optional final-answer expectations (`:final {:contains ...}` or `:final {:regex ...}`).
- registry entry (name -> {:name :description :parameters :invoke ...})
- Ollama/OpenAI-ish tool schema:
- JSON Schema must be *real JSON* (string keys), we normalize for you.
- Tool call arguments may arrive as a map OR a JSON string; we coerce both."
- keyword/symbol keys -> string keys
- keyword/symbol values -> string values
- vectors/lists -> vectors

## Summary Snippets
- Alright — here’s the **next chunk**: I’m going to harden what you already have into something you can actually lean on for real tool-calling eval.
- Big fixes / upgrades:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
