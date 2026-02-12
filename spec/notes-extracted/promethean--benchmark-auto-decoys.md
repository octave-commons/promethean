---
title: "1) New namespace: `promethean.benchmark.decoys`"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-auto-decoys.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) New namespace: `promethean.benchmark.decoys`

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/benchmark-auto-decoys.md`
- Category: `promethean`

## Draft Requirements
- `promethean.benchmark.decoys` ✅ (new shared helper)
- `--auto-decoys true` ✅ (tool-choice cases get decoys when `:tools` is missing)
- `--decoy-config '{...}'` ✅ (tune difficulty / mix / seed)
- in cases.edn, omit :tools for choose cases
- run benchmark with --auto-decoys true
- tune with --decoy-config '{...}'
- case-id (string)
- correct-tool (string)
- config map (merged with default-config)
- Always includes correct tool first
- Never duplicates
- If we can’t fill category quotas, we backfill from remaining pool."

## Summary Snippets
- Yep. Let’s make **automatic decoy toolsets** driven by **tool tags/domains**, and wire it into the benchmark runner behind a flag.
- You’ll get:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
