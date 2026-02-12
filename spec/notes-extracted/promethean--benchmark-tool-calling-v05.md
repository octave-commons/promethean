---
title: "Replace `tool_calling` benchmark runner (adds choose-policy)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v05.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Replace `tool_calling` benchmark runner (adds choose-policy)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-tool-calling-v05.md`
- Category: `promethean`

## Draft Requirements
- ✅ `:choose-policy` modes: `:first` | `:any` | `:best`
- ✅ “wrong-first” penalties (model calls a decoy tool before the right one)
- ✅ Choice confusion matrix + precision/recall/F1 computed **according to the policy**
- ✅ Fixed a bug in `match-calls-strict` from the last version (it returned nested `{:ok {:ok false ...}}`)
- strict call sequence:
- tool choice:
- should NOT call tools:
- final answer checks:
- per-case toolset override:
- :choose-policy (default :first)
- :penalize-extra-calls? (default false)
- confusion matrix and per-tool precision/recall/F1 computed using chosen tool per policy."

## Summary Snippets
- Alright — next upgrade is **trace-aware tool choice** with a real evaluation policy.
- You’ll get:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
