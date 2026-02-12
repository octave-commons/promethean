---
title: "0) Biggest risk: you have *the right components* but not the **authoring contract**"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/spec-review-pt2.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 0) Biggest risk: you have *the right components* but not the **authoring contract**

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/spec-review-pt2.md`
- Category: `promethean`

## Draft Requirements
- calls out the **highest-risk gaps**
- fixes the **syntax/structure breakages** that will slow implementation
- proposes the **missing spec sections** that make this feel like an *Agent SDK* (macros + packs + kondo)
- aligns everything with the “async-first hierarchical machine” we described
- **core services**: ollama client, event log, message bus, locks
- **tool system**: registry + spec validation + schema + executor
- **agents**: supervisor tree + tiering + comms + state
- **benchmarks**: tool-calling + decoys + coding + interactive + reporting
- `dsl.md` → **def-tool / def-agent / def-case** and how they expand + register
- `packs.md` → how `tools.clj` is loaded (defs + implementations in one namespace)
- each agent has:
- `:inbox` channel

## Summary Snippets
- Yep — let’s keep going, but tighter + more actionable.
- Below is a **second-pass spec review** that:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
