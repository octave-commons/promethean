# Spec: Bootstrap publish + workspace version bump

- **Date:** 2025-11-20
- **Owner:** Codex (via OpenCode)
- **Goal:** Align all workspace packages to a single release version via `pnpm version <x.y.z>` and prep for publishing, while keeping Pantheon usable as a workspace dependency until it is split out.

## Code Hotspots (with line refs)

1. `package.json:5` – root version to be bumped alongside all packages.
2. `packages/pantheon/package.json:2-4` – Pantheon umbrella package remains a workspace dependency; needs version bump with the rest until extraction.
3. `packages/pantheon/packages/*/package.json` – nested Pantheon packages (core, coordination, ecs, etc.) currently at 0.0.0/0.0.1/0.1.0; must stay in sync for workspace consumers.
4. `services/knowledge-graph/package.json:2-3` – only package already at 1.0.0; will drop to the chosen unified version unless excluded.
5. `pnpm-lock.yaml` – will reflect the bumped versions; ensure lockfile changes are captured.

## Current Version Distribution (workspace, excluding node_modules/stryker temp)

- 0.0.1 → 24 packages
- 0.0.0 → 4 packages
- 0.1.0 → 34 packages
- 0.2.0 → 1 package (`@promethean-os/kanban`)
- 1.0.0 → 2 packages (`@promethean-os/knowledge-graph`, `test-knowledge-graph`)

## Requirements

1. Run a single command to bump **all** workspace package versions using `pnpm version <x.y.z>` (likely `pnpm -r version <x.y.z>` to touch every package and the root) so publishes are aligned.
2. Keep Pantheon packages inside the workspace for this bump (future goal is moving them out), ensuring downstream workspace:\* deps remain satisfied.
3. Avoid per-package manual edits; rely on the pnpm workflow and commit resulting package.json + lockfile deltas.
4. Document the chosen version and any exceptions (if we skip the 1.0.0 services or the test fixture package).

## Open Decisions / Clarifications

- What is the target version `<x.y.z>` for this global bump?
- Should the 1.0.0 packages (`services/knowledge-graph`, `services/knowledge-graph/test-docs`) also be reset to this version, or excluded?
- Confirm that Pantheon packages should publish with the rest (currently workspace deps) or remain unpublished but version-aligned.

## Definition of Done

1. Target version agreed and applied via pnpm to root + all packages (including Pantheon unless explicitly excluded).
2. Lockfile updated and committed alongside package.json changes.
3. Note added if any packages were intentionally excluded (especially 1.0.0 or test fixture packages).
4. Workspace consumers still resolve Pantheon via workspace:\* until it is split out.
