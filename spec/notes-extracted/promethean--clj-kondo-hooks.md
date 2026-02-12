---
title: "1) `.clj-kondo/config.edn`"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/clj-kondo-hooks.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) `.clj-kondo/config.edn`

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/clj-kondo-hooks.md`
- Category: `promethean`

## Draft Requirements
- ✅ no “unresolved symbol” warnings for `def-tool`, `def-agent`, `defcase`, `defsuite`
- ✅ real linting inside your `impl` body (bindings work, no false positives)
- ✅ works for both **bench code** and **production agents**
- We intentionally do NOT include the DSL directives (params/bench/etc)
- `def-tool` no longer triggers “unresolved symbol mul”
- `(+ a b)` inside `(impl ...)` is linted correctly because we emit a real `defn` with bindings

## Summary Snippets
- Below is a **clj-kondo hook + config setup** that makes kondo “understand” your DSL macros as if they were real `def/defn` forms — so you get:
- * ✅ no “unresolved symbol” warnings for `def-tool`, `def-agent`, `defcase`, `defsuite` * ✅ real linting inside your `impl` body (bindings work, no false positives) * ✅ works for both **bench code** and **production agents**

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
