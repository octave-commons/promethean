Scripts: Group remaining Kanban utilities and verify

Goal: Ensure all Kanban-related scripts are under `packages/kanban/` and update their docs.

Scope:
- Rewrite `kanban_to_issues.py` as a typescript module in `packages/kanban/`.
- move all scripts in `scripts/kanban` to `packages/kanban`
	- rewrite any python scripts to ts
	- Avoid/remove any direct string manipulation involved, prefer working with a parser (`marked` I think is the name.
- Verify imports (e.g., agile_statuses) and adjust.
- Move `scripts/kanban/README.md` to `packages/kanban/README.md` with each tool's purpose, env vars, and examples.

Exit Criteria:
- All Kanban scripts consolidated; README accurate; sample commands tested.

#incoming #scripts #kanban #organization

