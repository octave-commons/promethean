# Process configs (YAML)

This folder contains **process-as-code** definitions used by the local kanban tooling and CI bots. Each file describes a workflow variant e.g. `duck-revival.yaml`.

## Schema

```yaml
name: <string>                 # Human-readable workflow name
statuses:                      # Left→right order defines the board columns
  - todo
  - in-progress
  - review
  - done
labels:                        # Canonical label mapping (GitHub, Obsidian, etc.)
  pr_ready: "ready-for-review"
  blocked:  "blocked"
  urgent:   "P1"
pr_checklists:                 # Checklists that get mirrored to PR comments
  default:                     # name → list of checklist items
    - "CI green"
    - "Tests added for new logic"
    - "Docs updated"
linking:                       # Cross-artifact relationships
  task_to_pr:                  # How to find PRs from a task (and vice versa)
    commit_regex: "TASK-[\d-]+"
    pr_body_match: "Closes: TASK-"
board:                         # Board generation hints
  wip: { in-progress: 3, review: 8 }
  swimlanes: [owner, priority]
```

> The schema is intentionally simple: if the kanban CLI sees unknown keys, it passes them through into its JSON output so you can extend the automation without changing the parser.

## Conventions
- Keep one file per big initiative e.g. `duck-revival.yaml`.
- Treat `statuses` as the source of truth; avoid ad-hoc columns in rendered boards.
- Checklists should be short and **enforceable**. If it can’t fail CI or a bot, it probably shouldn’t be in the list.

## Used by
- `packages/kanban` (CLI)
- CI jobs that sync labels / post PR checklists
- Local scripts under `packages/kanban/src/scripts/*.ts`
