# @promethean/kanban-cli

Automation for the local markdown kanban and process-as-code. Functional TS, native ESM, no side effects.

## Commands

```bash
pnpm kanban --help
```

- `regenerate` — rebuild board(s) from `docs/agile/tasks/*.md`.
- `sync` — two-way sync (board ⇄ tasks), then apply labels & PR checklists using a process config.
- `doccheck` — **docs guard**; fails if package source changes without corresponding docs changes.
- `pull` / `push` — low-level transforms used by `sync`.
- `indexForSearch`, `search` — JSON index and query over tasks.
- `process_sync` — run process pipeline (labels + checklists) defined in YAML.

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

## Env
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` for GitHub-side operations.
- `KANBAN_BOARD_FILE`, `KANBAN_TASKS_DIR` for explicit paths.

## Process config
See `docs/agile/process/README.md` for the YAML schema. An example lives at `docs/agile/process/duck-revival.yaml`.
