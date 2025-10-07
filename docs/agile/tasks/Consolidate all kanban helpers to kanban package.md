---
uuid: 727fd6bd-7c63-4488-b29e-c09640d4cc8a
title: consolidate all kanban helpers to kanban package
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.503Z'
---
Scripts: Group remaining Kanban utilities and verify

Goal: Ensure all Kanban-related scripts are under `packages/kanban/` and update their docs.

Scope:
- Rewrite `kanban_to_issues.py` as a TypeScript module in `packages/kanban/`.
- Move all scripts in `scripts/kanban` to `packages/kanban/`.
	- Rewrite any Python scripts to TypeScript.
	- Avoid/remove direct string manipulation; prefer using a Markdown parser (e.g., `marked`).

Exit Criteria:
- All Kanban scripts consolidated; README accurate; sample commands tested.

#incoming #scripts #kanban #organization


