# @promethean/kanban-cli

This package bundles every automation entry point for the workspace kanban
board under `docs/agile/`. The `kanban` CLI replaces the legacy Python helpers
and should be used for all board↔task synchronisation flows.

## Default paths

- **Board:** `docs/agile/boards/kanban.md`
- **Tasks:** `docs/agile/tasks/`

Override either location with `--kanban`, `--tasks`, or the environment
variables `KANBAN_PATH` / `TASKS_PATH` when invoking the CLI.

## Core CLI usage

```
pnpm kanban --help
```

Common workflows:

- `pnpm kanban pull` – fold task frontmatter back into the board (like the old
  `hashtags_to_kanban.py`).
- `pnpm kanban push` – project the kanban columns to task files (successor to
  `kanban_to_hashtags.py`).
- `pnpm kanban sync` – run both directions and surface conflicting cards.
- `pnpm kanban regenerate` – rebuild the board from the current task folder.
- `pnpm kanban count --kanban path --tasks path` – quick stats for automation.
- `pnpm kanban ui --port 4173` – launch an interactive kanban dashboard in the
  browser (defaults to `http://127.0.0.1:4173`).

Each command emits newline-delimited JSON so downstream tooling can be scripted
without parsing human output.

## Additional utilities

The package also houses the TypeScript utilities that used to live in
`scripts/kanban/`:

- `pnpm tsx packages/kanban/src/scripts/wip-sheriff.ts --write` – audit and
  rebalance WIP limits.
- `pnpm tsx packages/kanban/src/scripts/pending_count.ts` – report the number of
  pending embeddings tracked in MongoDB.

## Web UI

Run `pnpm kanban ui` to start a lightweight HTTP server that renders the
workspace board as a responsive dashboard. The command respects the same
configuration flags as other subcommands, so `--kanban`, `--tasks`, `--host`,
and `--port` work as expected. The page refreshes automatically every minute,
and you can trigger a manual refresh from the "Refresh" button in the header.

## Notes

- Always back up `kanban.md` before running write-heavy operations.
- Keep `docs/agile/process.md` handy; its workflow is the canonical reference
  for how cards should flow through the system.
