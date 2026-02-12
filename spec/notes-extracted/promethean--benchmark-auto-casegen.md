---
title: "1) New namespace: `promethean.benchmark.casegen`"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-auto-casegen.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) New namespace: `promethean.benchmark.casegen`

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-auto-casegen.md`
- Category: `promethean`

## Draft Requirements
- ✅ `promethean.benchmark.casegen`
- Generates `:expect {:choose ...}` cases programmatically
- Uses tool `:domain`, `:tags`, and schema to make “natural-ish” prompts when possible
- Falls back to “call tool X with args Y” when it can’t infer semantics
- ✅ `--generate true`
- ✅ `--gen-config '{...}'`
- ✅ works with `--auto-decoys true`
- omit :tools from generated cases
- runner will inject a decoy toolset per case"
- only computes for arithmetic kinds by default
- safe for add/mul/sub/div when values are integers
- returns {:final {:contains \"...\"}} or nil"

## Summary Snippets
- Yep. Next tier: **auto-generate tool-choice cases** from the tool registry (plus optional “no tool” control cases), and let **auto-decoys** do the pressure test.
- You’ll get a new shared namespace:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
