---
title: "What a decoy is (in this benchmark)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-decoys-concept.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# What a decoy is (in this benchmark)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-decoys-concept.md`
- Category: `promethean`

## Draft Requirements
- *does the model tool-call?*
- *does it format tool args correctly?*
- ✅ **tool selection accuracy**
- ✅ resistance to “call a generic helper tool”
- ✅ robustness under ambiguity
- ✅ ability to avoid wasting calls
- correct: `mul`
- decoys: `add`, `sub`, `pow`, `eval_expression`
- `search_web`
- `general_reasoner`
- `code_interpreter`
- `ask_user`

## Summary Snippets
- Yeah — **decoys** are the “wrong tools” you *intentionally* include in the tool list for a case, so the model has to **choose**, not just “use any tool”.
- They turn a benchmark from *“can it tool-call at all?”* into *“can it pick the right tool under pressure?”*.

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
