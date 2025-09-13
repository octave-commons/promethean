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

