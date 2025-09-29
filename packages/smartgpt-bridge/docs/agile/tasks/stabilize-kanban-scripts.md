---
project: Promethean
tags: [#task, #automation, #kanban, #scripts]
---

## Objective
Stabilize the Kanban automation pipeline so that running `pnpm kanban pull`
and related tools does not duplicate tasks or corrupt board state.

## Motivation
- Current `pnpm kanban pull` can duplicate tasks if they have multiple tags or if the script is run repeatedly.
- Round-tripping between `pnpm kanban pull` and `pnpm kanban push` risks drift.
- Normalization of statuses is inconsistent (e.g. `#Incoming` vs `#incoming`).

## Deliverables
- Refactor the `pull` command to:
  - Deduplicate tasks across all columns.
  - Normalize status names via `normalize_statuses.py`.
  - Provide a dry-run mode that previews diffs without writing.
  - Decide on **single source of truth** (tags → board).
- Update the `push` command to:
  - Act as a validator instead of rewriting.
  - Report mismatches without mutating board state.

## Steps
1. Add a deduplication pass in the pull pipeline.
2. Integrate normalization automatically before writing kanban file.
3. Add `--dry-run` flag for safe testing.
4. Update docs in `packages/kanban/README.md` to reflect stable workflow.

## Acceptance Criteria
- Running `pnpm kanban pull` multiple times produces a stable `kanban.md` with no duplicates.
- Task status tags and kanban columns stay consistent.
- `pnpm kanban push` reports inconsistencies but never introduces duplicates.

## Board Link
Linked to **📥 Incoming → Stabilize board automation scripts and process** in `docs/agile/boards/kanban.md`.

