---
title: "1) `.clj-kondo/config.edn` (upgraded)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/clj-kondo-hooks-v2.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) `.clj-kondo/config.edn` (upgraded)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/clj-kondo-hooks-v2.md`
- Category: `promethean`

## Draft Requirements
- **Rewrite macros into meaningful shapes** (`def` + `merge` + vectors) so kondo sees *real structure*
- **Disable noisy linters only inside these DSL calls** (`unused-value` mainly)
- (Optional) ship as **clj-kondo.exports** so consumers get this automatically
- the tool var exist (no unresolved symbol)
- the impl body lint like normal code (bindings, etc)"
- “this is a map”
- “this is a vector”
- symbols inside suites resolve normally

## Summary Snippets
- Yep — we can make **clj-kondo treat your DSL as “real code”** instead of a pile of “unused values” + macro mystery.
- You already have the core **analyze-call hooks**. The next step is:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
