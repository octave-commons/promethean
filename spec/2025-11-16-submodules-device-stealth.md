# Submodules tracking device/stealth (2025-11-16)

## Context

We need every submodule to track the `device/stealth` branch. Current configuration is defined in `.gitmodules`.

## Current state (key references)

- `.gitmodules` now sets `branch = device/stealth` for every submodule entry (lines 1-140).
- `git submodule status --recursive` shows all submodules at `heads/device/stealth` commits.
- Submodule branch alignment is enforced in CI (see Workflow / guardrails).

## Existing issues/PRs

- Not searched/none referenced; proceeding assuming no blocking issues.

## Definition of done / requirements

- `.gitmodules` lists every submodule with `branch = device/stealth`.
- Submodule status reflects tracking of `device/stealth` (configuration updated and status verified).
- Documentation (this spec) updated if scope changes.

## Verification (2025-11-16)

Checked that `device/stealth` fully contains commits from the previously tracked branches:

- `packages/apply-patch` vs `origin/main`: `10 0` (device/stealth ahead, no missing commits)
- `packages/autocommit` vs `origin/main`: `8 0`
- `packages/auth-service` vs `origin/main`: `7 0`
- `packages/kanban` vs `origin/promethean/dev`: `27 0`
- `packages/logger` vs `origin/main`: `7 0`
- `packages/mcp` vs `origin/promethean/dev`: `14 0`
- `packages/naming` vs `origin/promethean/dev`: `9 0`
- `packages/persistence` vs `origin/promethean/dev`: `10 0`
- `packages/utils` vs `origin/promethean/dev`: `7 0`

## Workflow / guardrails

- Added `.github/workflows/submodule-branch-guard.yml` to enforce that every submodule tracks the same branch name as the parent branch (e.g., `device/*`, `main`, `promethean/*`).
- The workflow fails fast when `.gitmodules` entries do not match the current branch and runs `git submodule sync --recursive` for configuration consistency.
- When merging into a target branch, `.gitmodules` must be updated to that branch name; the workflow enforces this so merges cannot proceed with stale device branch references.
