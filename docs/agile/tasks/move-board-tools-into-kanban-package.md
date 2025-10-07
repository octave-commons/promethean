---
uuid: 8a791d5f-757a-4154-bba2-e14886da4c30
title: move board tooling into kanban package
status: in_progress
priority: P3
labels: ["framework-core", "devtools"]
created_at: '2025-09-21T00:00:00.000Z'
---
Move the TypeScript utilities under `tools/board/` into the maintained `@promethean/kanban` package so they ship with the rest of the board automation CLI.

## Plan
- [x] Inspect the legacy `tools/board/*` entrypoints and data contracts.
- [x] Relocate the scripts into a `packages/kanban/src/board` directory, exporting them as part of the package build.
- [x] Update documentation and any hard-coded paths or references to the old location.
- [ ] Ensure `@promethean/kanban` builds cleanly and lint passes on touched files. *Blocked: `tsc -p tsconfig.json` currently fails in `src/lib/types.ts` and `src/lib/jsonl.ts`.*

## Definition of Done
- Board utilities live inside `packages/kanban/src/` with updated imports.
- Docs reference the new invocation path `pnpm tsx packages/kanban/...`.
- Tests and builds for the `@promethean/kanban` package succeed.
