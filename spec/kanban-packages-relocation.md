# Kanban packages relocation to `cli/kanban/packages`

## Context

- Kanban-related plugins and SDK were under `packages/*` (e.g., `packages/kanban-sdk`, `packages/kanban-transition-rules`, `packages/kanban-plugin-content`, `packages/kanban-plugin-heal`, `packages/kanban-plugin-git-index`). Target is to colocate them under `cli/kanban/packages`, alongside the main CLI/package at `cli/kanban`.
- Request: colocate all Kanban packages under `cli/kanban/packages`.

## Files to touch (with refs)

- `package.json:183-189` — pnpm workspace globs.
- `nx.json:69-75` — project roots for Kanban packages and CLI.
- `cli/kanban/tsconfig.json:8-43` and `cli/kanban/tsconfig.build.json:1-10` — path aliases and TS project references pointing at `../../packages/*`.
- `packages/kanban-*/project.json` — `sourceRoot`/paths to adjust after move.
- `cli/kanban/package.json:25` — homepage URL references `packages/kanban`.
- `tsconfig.build.json:146-151` — references to `./packages/kanban*`.
- Any scripts/docs that hardcode `packages/kanban-*` paths (to be updated as found via `rg`).

## Definition of done

- Kanban packages physically live at `cli/kanban/packages/{kanban-sdk,kanban-transition-rules,kanban-plugin-content,kanban-plugin-heal,kanban-plugin-git-index}`.
- pnpm workspaces/Nx project roots and TS path references point to the new locations.
- CLI/package metadata (homepage/docs) no longer claim the packages live under `packages/`.
- Basic sanity (e.g., `pnpm list -r --depth 0` or `pnpm --filter @promethean-os/kanban-sdk build` path resolution) is unblocked; no dangling references to old paths in tracked files.

## Plan (phases)

1. Update workspace configuration: add `cli/kanban/packages/*` to pnpm workspaces, adjust Nx `projects` roots and TS build references.
2. Move Kanban package directories into `cli/kanban/packages/` and patch each `project.json`/`tsconfig` `sourceRoot` and relative references.
3. Fix downstream references: update `cli/kanban` TS path mappings, homepage/docs links, and any scripts/docs pointing at old `packages/kanban-*` paths.
4. Quick verification (e.g., `pnpm -r list --depth 0` or targeted build dry-run if fast) and summarize.

## Existing issues/PRs

- None located so far specific to this relocation.
