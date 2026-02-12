---
title: "Replace `casegen.clj` (templates + spec validation)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-prompt-templates.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Replace `casegen.clj` (templates + spec validation)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-prompt-templates.md`
- Category: `promethean`

## Draft Requirements
- ✅ `:bench/prompt-templates` support on tools
- ✅ spec validation (`clojure.spec.alpha`)
- ✅ template-driven `:choose` cases (optionally with `:final`)
- ✅ mixes templates + inferred cases (configurable)
- ✅ still compatible with **auto-decoys**
- generated cases omit :tools by default
- runner injects decoys for choose-cases when --auto-decoys true"
- natural prompts
- known correct arguments
- optional final assertions
- and still gets decoy pressure automatically

## Summary Snippets
- Cool — let’s make **prompt templates first-class**, validated with **`clojure.spec.alpha`**, and have `casegen` *prefer* them so your “unknown tools” become **real tool-choice reasoning tests**, not just “call this tool with args”.
- Below is a **full file replacement** for `casegen.clj` that adds:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
