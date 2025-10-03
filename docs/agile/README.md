# Process-as-Code (Agile)

Treat planning as code. Everything lives under `docs/agile/` to keep humans and models on the **same source of truth**.

## Layout
- `docs/agile/tasks/*.md` — one task per file (front‑matter drives status/priority/labels).
- `docs/agile/boards/*.md` — generated views (board/table).
- `docs/agile/process/*.yaml` — workflow configs (statuses, label mapping, checklists, PR links).

## Task front‑matter
```yaml
uuid: <stable-id>
title: <human title>
status: todo | in-progress | review | done
priority: P1 | P2 | P3
labels: [duck-web, audio, …]
created_at: <ISO>
owner: <github|handle>
links: { prs: [1451,1450], docs: ["docs/reviews/duck-revival-playbook.md"] }
```

## Quickstart
1) Edit tasks as files.
2) Run the kanban CLI to regenerate the board and sync labels/checklists.

```bash
pnpm kanban regenerate
pnpm kanban sync --process docs/agile/process/duck-revival.yaml
```

## GitHub integration (labels + checklists)
- The CLI maps `status`→labels using `process/*.yaml`.
- PR checklists are posted as comments and updated idempotently.
- Default token scopes: `repo`, `project`, `issues`. Set `GITHUB_TOKEN`.

## Kanban CLI (from `packages/kanban`)
- `pnpm kanban pull`  — fold task front‑matter back into the board.
- `pnpm kanban push`  — project board columns back into task files.
- `pnpm kanban sync`  — do both, update GitHub labels + PR checklists.
- `pnpm kanban regenerate` — rebuild boards purely from tasks.

See also: `docs/agile/process/README.md` for the YAML schema.
