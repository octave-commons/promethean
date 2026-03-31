# Spec: Nx publish task and affected script

- **Date:** 2025-11-20
- **Owner:** Codex (via OpenCode)
- **Goal:** Provide a consistent Nx publish target (build-first, non-cached) and a root script to publish only the packages changed since the last base.

## Code Hotspots (with line refs)

1. `package.json:6-17` – Scripts block where `publish:affected` will live alongside other affected commands.
2. `nx.json:28-60` – `targetDefaults` extended to configure `nx-release-publish` for all inferred projects.

## Existing Issues / PRs

- Internal planning docs reference Nx release work (e.g., `docs/agile/boards/generated.md` mentions an epic to implement Nx Release), but no active PRs tied to this specific publish task were identified during this pass.

## Requirements

1. Add a root npm script to publish only affected packages via Nx so the workflow is a single command.
2. Ensure every project's Nx publish target runs after a fresh build and skips caching to avoid stale artifacts.
3. Preserve current Nx project inference; avoid per-package edits while enabling workspace-wide publish orchestration.

## Definition of Done

1. `pnpm run publish:affected` executes `nx-release-publish` for affected projects and respects dependency ordering.
2. `nx-release-publish` defaults include a build dependency and disable caching across all projects.
3. No changes to unrelated scripts or Nx defaults beyond the publish target setup.
