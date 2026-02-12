---
title: "1) More hard fixes hiding in the specs (beyond what we already covered)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/spec-review-pt4.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) More hard fixes hiding in the specs (beyond what we already covered)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/spec-review-pt4.md`
- Category: `promethean`

## Draft Requirements
- a registry entry in `core.md`
- a richer doc schema in `tools.md`
- and implicitly as “callable thing with schema + implementation” in benchmark land
- *“does the model pick high-authority tools under uncertainty?”*
- *“does it get baited by name similarity?”*
- *“does it learn domain boundaries?”*
- A tool pack is a **namespace** that, on `require`, registers tools into the tool registry.
- Tool pack must contain:
- `def-tool` forms (definitions + impl)
- any supporting specs (args/ret)
- Benchmark runner loads tool packs via symbol:
- `:bench/tools-pack 'my.tools.core`

## Summary Snippets
- Alright — continuing the spec review, but now we’re going to **turn this into something you can actually *live in***: fewer “conceptual blobs”, more **authoring contracts**, **valid Clojure-ish examples**, and a couple **foundational fixes** that will save you pain.
- ---

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
