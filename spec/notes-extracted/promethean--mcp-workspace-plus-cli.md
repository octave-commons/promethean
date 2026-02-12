---
title: "Repo layout for the new suite"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/mcp-workspace-plus-cli.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Repo layout for the new suite

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/mcp-workspace-plus-cli.md`
- Category: `promethean`

## Draft Requirements
- tool pack namespace: `bench-tools.stream-fun-tools`
- suite namespace: `benchmarks.vision-stream.cases`
- low risk
- small argument surfaces
- deterministic returns
- good evaluation signals"
- tiny arg surface area
- allow-lists instead of open-ended “do anything”
- outputs are deterministic, so your evaluation stays clean
- easy to detect spam (repeated overlay/sfx calls)
- self-control
- tool choice discipline

## Summary Snippets
- Hell yeah. Let’s make this **real**: a *first runnable* `vision/stream` suite with **30 scenario cases**, plus a **safe “fun tools” pack** that `gemma3-tools:4b` can occasionally call on stream without going off the rails.
- Everything below is written as **full-file replacements**, *not diffs*, and uses a macro-heavy style that matches the “Agent SDK feel” you’re chasing.

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
