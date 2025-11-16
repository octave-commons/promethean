# Submodules tracking device/stealth (2025-11-16)

## Context

We need every submodule to track the `device/stealth` branch. Current configuration is defined in `.gitmodules`.

## Current state (key references)

- `.gitmodules` currently sets `branch = device/stealth` for every submodule entry (lines 1-140); automation rewrites these entries to the active special branch (device/_, dev/_, main, release).
- `git submodule status --recursive` shows all submodules at `heads/device/stealth` commits for this branch.
- Submodule branch alignment is enforced via local hooks (pre-commit stages) and CI (see Workflow / guardrails).

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

- Local hooks (via `.pre-commit-config.yaml`) call `scripts/git-hooks/submodule-branch-sync.sh` on commit, push, and post-checkout to align `.gitmodules` to the current special branch, block pushes for dirty/detached/rebasing submodules, and sync submodules after checkout.
- CI workflow `.github/workflows/submodule-branch-guard.yml`:
  - On PRs to special branches (`device/*`, `dev/*`, `main`, `release`), checks mergeability of matching submodule branches; creates missing base branches from `main` and opens submodule PRs on conflicts.
  - On pushes to those branches, updates `.gitmodules` to the branch and auto-pushes the alignment commit if needed.
