# @promethean/kanban-cli

Automation for the local markdown kanban that powers `docs/agile/`. Functional TS, native ESM, no side effects.

## Install
This package is workspace-local. Use via `pnpm` scripts from repo root.

```bash
pnpm kanban --help
```

## Commands
### `regenerate`
Rebuild board(s) from `docs/agile/tasks/*.md`.

```bash
pnpm kanban regenerate --kanban docs/agile/boards/kanban.md --tasks docs/agile/tasks
```

### `sync`
Two-way sync: board ⇄ tasks, then apply labels & checklists on GitHub according to a process config.

```bash
GITHUB_TOKEN=… pnpm kanban sync \n  --process docs/agile/process/duck-revival.yaml \n  --kanban docs/agile/boards/kanban.md \n  --tasks docs/agile/tasks
```

### `pull` / `push`
Low-level one-way transforms used by `sync`.

### `count`
Emit JSON stats for dashboards.

## Environment
- `GITHUB_TOKEN` — classic token with `repo` / `project` / `issues`.
- `KANBAN_PATH` / `TASKS_PATH` — defaults for paths.

## JSON output
Every command prints **newline-delimited JSON** for model consumption. Example `sync` line:

```json
{
  "op": "label.apply",
  "pr": 1451,
  "add": ["status:review"],
  "remove": ["status:in-progress"]
}
```

## Process config
See `docs/agile/process/README.md` for the YAML schema. A ready-made config lives at `docs/agile/process/duck-revival.yaml`.

## Philosophy
- Pure functions + data-in/data-out.
- Markdown as the source of truth.
- Small, composable scripts > monoliths.
