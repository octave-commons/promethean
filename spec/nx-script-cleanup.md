# Nx Script Cleanup

## Context & References

- `package.json:7-104` – script definitions heavy on custom Nx wrappers.
- `scripts/run-nx-task.mjs:1-305` – custom helper wrapping `nx` CLI for modes (`all`, `affected`, `selection`, `tagged`).

## Existing Work

- No open issues or PRs referenced for this change.

## Requirements

1. Replace redundant `run-nx-task.mjs` script entries in `package.json` with direct Nx CLI commands (e.g., `pnpm nx run-many`, `pnpm nx affected`).
2. Retain non-Nx scripts (docker, coverage aggregation, syncing, domain-specific tasks).
3. Ensure any remaining references to `run-nx-task.mjs` are intentional or removed.
4. Keep script names intuitive (e.g., `build`, `test`, `affected:*`, `graph`, `nx`).

## Definition of Done

- `package.json` scripts rely on Nx CLI directly for workspace orchestration.
- `run-nx-task.mjs` no longer needed by package scripts (either archived for manual use or flagged for removal in follow-up).
- Documentation / summary provided to the user explaining the updated script usage.
