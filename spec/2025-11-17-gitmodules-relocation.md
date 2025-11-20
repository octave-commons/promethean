# Gitmodules Relocation Alignment (2025-11-17)

## Context

Several submodules were physically moved from `packages/` into scoped directories under `cli/` and `services/`. The `.gitmodules` metadata (see `.gitmodules:1-140`) still references the former locations, causing checkout/update failures.

## Relevant Entries

- `.gitmodules:1-4` – `packages/apply-patch` should point to `cli/apply-patch`.
- `.gitmodules:5-12` – `packages/autocommit` + `packages/auth-service` now live under `services/`.
- `.gitmodules:13-20` – `packages/kanban` is the CLI workspace (`cli/kanban`).
- `.gitmodules:21-24` – `packages/mcp` belongs under `services/mcp`.
- `.gitmodules:49-60` – `packages/eidolon-field` also moved into `services/`.
- `.gitmodules:73-84` – `packages/shadow-conf` is now under `cli/shadow-conf`.
- `.gitmodules:93-104` – `packages/compliance-monitor` and `packages/dlq`; only the former exists under `services/compliance-monitor`.
- `.gitmodules:105-120` – `packages/mcp-dev-ui-frontend` and `packages/obsidian-export` reside in `services/` and `cli/`, respectively.

## Requirements

1. Update each affected `[submodule "packages/…"]` header and its `path = …` line so that they reference the actual directory (e.g., `cli/apply-patch`, `services/mcp`).
2. Preserve existing `url` and `branch` metadata (branch `device/stealth`).
3. Ensure `.gitmodules` contains only one entry per submodule; no duplicate labels once renamed.
4. Validate that every moved directory listed above has a matching `.gitmodules` entry so submodule sync works from a clean clone.

## Definition of Done

- `.gitmodules` reflects the real filesystem layout for all moved submodules (cli/service scoped paths) and `git submodule status` completes without missing-path errors.
- Documentation of the change is recorded in this spec and referenced in task notes.
- No unrelated submodule entries are modified.
