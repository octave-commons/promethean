---
project: Promethean
tags: [#task, #automation, #kanban, #scripts]
---

## Objective
Stabilize the Kanban automation scripts so that running `hashtags_to_kanban.py` and related tools does not duplicate tasks or corrupt board state.

## Motivation
- Current `hashtags_to_kanban.py` can duplicate tasks if they have multiple tags or if the script is run repeatedly.
- Round-tripping between `hashtags_to_kanban` and `kanban_to_hashtags` risks drift.
- Normalization of statuses is inconsistent (e.g. `#Incoming` vs `#incoming`).

## Deliverables
- Refactor `hashtags_to_kanban.py` to:
  - Deduplicate tasks across all columns.
  - Normalize status names via `normalize_statuses.py`.
  - Provide a dry-run mode that previews diffs without writing.
  - Decide on **single source of truth** (tags → board).
- Update `kanban_to_hashtags.py` to:
  - Act as a validator instead of rewriting.
  - Report mismatches without mutating board state.

## Steps
1. Add a deduplication pass in `hashtags_to_kanban`.
2. Integrate normalization automatically before writing kanban file.
3. Add `--dry-run` flag for safe testing.
4. Update docs in `scripts/kanban/README.md` to reflect stable workflow.

## Acceptance Criteria
- Running `hashtags_to_kanban.py` multiple times produces a stable `kanban.md` with no duplicates.
- Task status tags and kanban columns stay consistent.
- `kanban_to_hashtags.py` reports inconsistencies but never introduces duplicates.

## Board Link
Linked to **📥 Incoming → Stabilize board automation scripts and process** in `docs/agile/boards/kanban.md`.

