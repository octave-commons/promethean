---
id: 20250921-file-board-source
title: File-first board as source of truth
status: open
priority: medium
owner: "@err"
labels: [boards, docops, automation]
created: "2025-09-21"
updated: "2025-09-21"
rel:
  blocks: []
  blockedBy: []
  links: ["issue:#1153"]
milestone: "v0.2.0"
---

The board must live in Git as Markdown files. Issues/Projects are mirrors only.

## Notes
- Natural language first; refine over time.
- When a doc stabilizes and the action repeats, extract the code block into a script.

## Action blocks
```json mcp
{"&command":"boards:add-to-board","taskId":"20250921-file-board-source","board":"default"}
```

```bash &docops
# Build docs and changelog from fragments + changesets
pnpm -r build && towncrier build --yes && pnpm dlx changesets version
```

## Acceptance criteria
- [ ] `/boards` spec committed
- [ ] indexer validates + emits index.jsonl
- [ ] projector can mirror to GH Issue/Project behind a flag
- [ ] CI validates every task file (schema + invariants)
