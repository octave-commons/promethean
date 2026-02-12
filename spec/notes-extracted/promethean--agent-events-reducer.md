---
title: "The spine: append-only event log ➜ deterministic reducer ➜ live UI"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/agent-events-reducer.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# The spine: append-only event log ➜ deterministic reducer ➜ live UI

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/agent-events-reducer.md`
- Category: `promethean`

## Draft Requirements
- `:t` unix ms
- `:type` keyword string-ish (write as string in JSON)
- `:run/id` stable run folder id
- `:seq` monotonic event number per run (for resume + dedupe)
- `:agent/id`, `:agent/parent`, `:agent/depth`
- `:task/id`
- `:lock/path`, `:lock/owner`
- `:tool/name`, `:tool/call-id`
- `:bench/suite`, `:bench/case-id`, `:model`
- **append-only** durability
- **fsync** safety (optional)
- a stable `:seq` per run

## Summary Snippets
- Yes. The next “make it real” step is **event streaming + reducers**.
- Once you have that, everything else (async agents, locks, benchmarks, UI, resume-after-crash) becomes *plumbing around the same spine*.

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
