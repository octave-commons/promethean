Kanban Scripts

Automations for maintaining the Obsidian Kanban board and task files under `docs/agile/`.

Paths
- Board: `docs/agile/boards/kanban.md`
- Tasks: `docs/agile/tasks/*.md`

Scripts
- hashtags_to_kanban.py: Builds/updates the board from task hashtags and preserves settings/unlinked items.
- kanban_to_hashtags.py: Synchronizes board columns back to task file hashtags.
- kanban_to_issues.py: Creates GitHub issues from Kanban items.
- wip-sheriff.ts: Enforces WIP constraints and rebalance columns.
- agile_statuses.py: Reports status counts across tasks.
- normalize_statuses.py: Normalizes hashtag spellings/cases across tasks.
- pending_count.ts: Counts pending tasks by status.
- github_board_sync.py: Syncs board to GitHub (labels/milestones), when configured.
- tasks_from_unique.py: Generates task stubs from docs/unique seeds.

Usage
- Python: `pipenv run python scripts/kanban/hashtags_to_kanban.py --write`
- Node/TS: `pnpm ts-node scripts/kanban/wip-sheriff.ts`

Notes
- Most scripts assume the repo root as CWD and a writable `docs/agile/` tree.
- Back up the board before running destructive operations.

