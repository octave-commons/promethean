# Boards as Source of Truth

This directory contains the file-first project board.

- Tasks -> `/boards/tasks/*.md` (one per task)
- Index -> `/boards/index.jsonl` (generated; do not edit by hand)
- Schemas -> `/boards/schemas/*.json`

## Task file front-matter (YAML or JSON)
Required fields: `id`, `title`, `status`, `priority`, `owner`, `labels`, `created`.

## Commands
- Validate: `pnpm tsx packages/kanban/src/board/lints.ts`
- Index (dry-run): `pnpm tsx packages/kanban/src/board/indexer.ts`
- Index (write): `pnpm tsx packages/kanban/src/board/indexer.ts --write`
