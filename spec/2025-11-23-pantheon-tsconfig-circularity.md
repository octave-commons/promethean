# Pantheon Experimental TSConfig Circularity

## Context

- `pnpm build` reported TS18000 circularity while resolving `experimental/pantheon/packages/{state,workflow,ecs}/tsconfig.json -> experimental/config/tsconfig.base.json -> experimental/config/tsconfig.base.json` (diagnostic from 2025-11-23 build).
- Current chain: `experimental/pantheon/packages/*/tsconfig.json` extends `../../../config/tsconfig.base.json` (resolves to `experimental/config/tsconfig.base.json`), and that file extends `../config/tsconfig.base.json`, which normalizes back to itself, producing a loop.
- Root config lives at `config/tsconfig.base.json` (strict nodenext settings, lib ES2022/DOM, etc.). No existing GitHub issues/PRs found yet (not searched in depth for this specific circularity).

## Files / Lines

- `experimental/config/tsconfig.base.json:2` → `"extends": "../config/tsconfig.base.json"` (self-referential after path normalization).
- `experimental/pantheon/packages/state/tsconfig.json:2` (same pattern in workflow/ecs): `"extends": "../../../config/tsconfig.base.json"` → points to the experimental base file.

## Definition of Done

- `experimental/config/tsconfig.base.json` extends the root config (`config/tsconfig.base.json`) without resolving back to itself.
- `pnpm --filter @promethean-os/pantheon-state build`, `.../workflow`, `.../ecs` run without TS18000 circularity errors (other diagnostics may remain but circularity cleared).
- Future-ready: pathing leaves room to centralize shared settings (e.g., via an `@promethean-os/config` package if adopted later).

## Plan (Phased)

### Phase 1 – Break the loop

1. Update `experimental/config/tsconfig.base.json` to extend `../../config/tsconfig.base.json` (root-level config).
2. Re-run a targeted build for one failing package (e.g., `@promethean-os/pantheon-state`) to confirm TS18000 is resolved.

### Phase 2 – Align usage / consider shared module

1. Keep package tsconfigs pointing at `../../../config/tsconfig.base.json` (which now resolves to the root config) unless a new shared config package is introduced.
2. Optionally prototype an `@promethean-os/config` package that surfaces tsconfig bases via `node_modules/@promethean-os/config/tsconfig.base.json` for consistency across workspaces.

### Phase 3 – Follow-up verification

1. Re-run pantheon experimental builds (`state`, `workflow`, `ecs`) to ensure no new circularities.
2. Document any additional TypeScript errors separately (missing modules, target/lib tweaks) if they persist after circularity fix.
