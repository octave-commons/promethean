# @promethean/kanban

Automation for the local markdown kanban and process-as-code. Functional TS, native ESM, no side effects.

## Commands

```bash
pnpm kanban --help
```

Available subcommands: `count`, `getColumn`, `getByColumn`, `find`, `find-by-title`, `update_status`, `move_up`, `move_down`, `pull`, `push`, `sync`, `regenerate`, `indexForSearch`, `search`, `ui`, `process`, `process_sync`, `doccheck`

Key commands:
- `regenerate` — rebuild board(s) from `docs/agile/tasks/*.md`.
- `sync` — two-way sync (board ⇄ tasks), then apply labels & PR checklists using a process config.
- `search` — search tasks by title/content.
- `find-by-title` — find task by exact title match.
- `update_status` — move task between columns.
- `count` — show task counts by status.
- `doccheck` — **docs guard**; fails if package source changes without corresponding docs changes.
- `pull` / `push` — low-level transforms used by `sync`.
- `indexForSearch` — JSON index for tasks.
- `process_sync` — run process pipeline (labels + checklists) defined in YAML.

- `pnpm kanban pull` – fold task frontmatter back into the board (like the old
  `hashtags_to_kanban.py`).
- `pnpm kanban push` – project the kanban columns to task files (successor to
  `kanban_to_hashtags.py`).
- `pnpm kanban sync` – run both directions and surface conflicting cards.
- `pnpm kanban regenerate` – rebuild the board from the current task folder.
- `pnpm kanban count --kanban path --tasks path` – quick stats for automation.
- `pnpm kanban ui --port 4173` – launch an interactive kanban dashboard in the
  browser (defaults to `http://127.0.0.1:4173`).
All commands emit newline-delimited JSON for downstream tooling.

## Paths
- Board: `docs/agile/boards/kanban.md` (override via `--kanban` or `KANBAN_PATH`)
- Tasks: `docs/agile/tasks/` (override via `--tasks` or `TASKS_PATH`)

## Docs guard (all packages)
Enforced in CI by `.github/workflows/docs-guard.yml`. If a PR touches `packages/<slug>/src/**`, one of these must also change:

- `docs/packages/<slug>/**`
- `docs/services/<slug>/**`
- `docs/libraries/<slug>/**`
- `docs/apps/<slug>/**`

Bypass with label `skip-docs` (maintainers only). See `docs/contributing/docs-policy.md`.

## Web UI

Run `pnpm kanban ui` to start a lightweight HTTP server that renders the
workspace board as a responsive dashboard. The command respects the same
configuration flags as other subcommands, so `--kanban`, `--tasks`, `--host`,
and `--port` work as expected. The page refreshes automatically every minute,
and you can trigger a manual refresh from the "Refresh" button in the header.

## Notes
## Env
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` for GitHub-side operations.
- `KANBAN_BOARD_FILE`, `KANBAN_TASKS_DIR` for explicit paths.

## Process config
See `docs/agile/process/README.md` for the YAML schema. An example lives at `docs/agile/process/duck-revival.yaml`.
