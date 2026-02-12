---
title: "1) Replace `tool_calling` benchmark with choice stats + decoys"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v04.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) Replace `tool_calling` benchmark with choice stats + decoys

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v04.md`
- Category: `promethean`

## Draft Requirements
- ✅ **Tool-choice confusion matrix**
- ✅ **Per-tool precision / recall / F1**
- ✅ **Penalize extra tool calls** (globally + per-case)
- ✅ **Decoy pressure support** via per-case tool subsets (`:tools [...]`)
- ✅ **“Should NOT call tools” cases** (`:expect {:none true}`)
- --tools tools.clj (required) tool defs + implementations via def-tool
- --agents agents.clj (optional) agent defs via def-agent
- --agent \"name\" (optional) which agent to use
- --cases cases.edn (optional) overrides tool-provided cases
- strict call sequence:
- tool choice (first call must pick correct tool):
- should NOT call tools:

## Summary Snippets
- Cool — here’s the next **full upgrade pass**:
- * ✅ **Tool-choice confusion matrix** * ✅ **Per-tool precision / recall / F1** * ✅ **Penalize extra tool calls** (globally + per-case) * ✅ **Decoy pressure support** via per-case tool subsets (`:tools [...]`) * ✅ **“Should NOT call tools” cases** (`:expect {:none true}`)

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
