---
title: "1) Schema-driven argument repair"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/schema-repair-benchmark-harness.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) Schema-driven argument repair

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/schema-repair-benchmark-harness.md`
- Category: `promethean`

## Draft Requirements
- ✅ **schema-driven argument repair** (turn “msg” into “text”, coerce types, fill defaults)
- ✅ a **benchmark harness DSL** that feels like writing specs, not tests
- ✅ decoys + abstention + multi-step chains
- ✅ streaming JSONL report output (crash-safe, append-only)
- ✅ “same framework = benchmark + real agents”
- deterministic
- schema-guided
- conservative (don’t invent meaning)
- did it choose the correct tool?
- did it supply required args?
- did repair have to do work?
- did it still fail?

## Summary Snippets
- Hell yes. Now we make this thing *scoreable*, *repeatable*, and *mean* in the way you want.
- We’re going to add:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
