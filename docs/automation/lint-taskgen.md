# Lint → Kanban Workflow

This workflow turns ESLint errors into **Kanban tasks** that live in-repo `docs/agile/tasks` and syncs them to the board `docs/agile/boards/kanban.md`.  
It replaces the old GitHub Issues approach.

---

## Overview

- **Analyzer**: `@promethean/lint-taskgen`
  - Runs ESLint full or Nx-affected mode.
  - Buckets violations by `(ruleId, scope)` pair.
  - Emits `eslint-taskgen-summary.json`.

- **Emitter**: `--emit-kanban`
  - Converts summary buckets into markdown tasks with YAML frontmatter.
  - Tasks are idempotent (keyed by slug).
  - `--update` appends snapshots instead of duplicating.

- **Board Sync**: `@promethean/kanban`
  - `kanban pull` ensures board and tasks are aligned.
  - `kanban regenerate` refreshes derived views.

- **Commit & Push**: Workflow auto-commits board + tasks updates to the branch.

---

## Workflow Inputs

| Input       | Default | Description                                                                 |
```
|-------------|---------|-----------------------------------------------------------------------------|
```
| `write`     | false   | If true, emit Kanban tasks + sync board. Otherwise only produce summary.    |
| `limit`     | 25      | Maximum tasks to create in one run.                                         |
| `scope`     | (empty) | Optional filter, e.g. `packages:core`.                                      |
| `top`       | (none)  | Restrict to top N buckets by hit count.                                     |
| `min_hits`  | (none)  | Only include buckets with ≥ this number of violations.                      |
| `update`    | true    | If true, append “Latest snapshot” to existing tasks instead of skipping.    |

---

## Task File Format

Example `docs/agile/tasks/[lint]-no-explicit-any-in-packages-core.md`:

```yaml
---
uuid: e8f90a1f7d661700216580204
title: "[Lint] @typescript-eslint/no-explicit-any in packages:core"
status: Todo
priority: P3
labels: [lint, @typescript-eslint/no-explicit-any, packages:core]
created_at: 2025-10-02T04:13:00Z
estimates:
  complexity: null
  scale: null
  time_to_completion: null
---

This task tracks remediation for **@typescript-eslint/no-explicit-any** across **packages:core**.

**Examples (seed)**
```
```
src/foo.ts:12
```
```
src/bar.ts:45
```
```

**Plan**
- Identify safe autofixes / codemods
- Apply fixes incrementally (small PRs)
- Add tests where behavior changes
- Flip rule to error when < 10 hits

**Latest snapshot (2025-10-02T04:13:00Z)**

Hits: **143**

**Examples (merged)**
```
```
src/foo.ts:12
```
```
src/bar.ts:45
```
...
```
```

---

## Usage

### Dry-run
Run from Actions:
- `write=false`
- Produces artifact `eslint-taskgen-summary.json`
- No repo changes.

### Emit Tasks + Update Board
Run from Actions:
- `write=true`
- Configure `limit`, `scope`, `top`, `min_hits`.
- Appends or creates task files.
- Commits changes and pushes to branch.

### Local Run
```bash
pnpm -w -F @promethean/lint-taskgen build
node packages/lint-taskgen/dist/cli.mjs --emit-kanban \
  --tasks-dir docs/agile/tasks \
  --limit=10 --scope=packages:core --update=true --min-hits=50
pnpm -w -F @promethean/kanban build
pnpm exec kanban pull --kanban docs/agile/boards/kanban.md --tasks docs/agile/tasks
pnpm exec kanban regenerate --kanban docs/agile/boards/kanban.md --tasks docs/agile/tasks
```

---

## Strategy

- Start with **top offenders** `--top`, `--min-hits` to avoid flooding.
- Use `--scope` to focus on one package at a time.
- Re-run with `--update=true` to keep refreshing snapshots without creating duplicates.
- When tasks are nearly resolved, drop the rule’s severity back to error in ESLint config.
