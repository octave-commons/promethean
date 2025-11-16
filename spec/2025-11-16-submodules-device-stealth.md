# Submodules tracking device/stealth (2025-11-16)

## Context

We need every submodule to track the `device/stealth` branch. Current configuration is defined in `.gitmodules`.

## Current state (key references)

- `.gitmodules` line 1: `packages/apply-patch` uses `branch = main`.
- `.gitmodules` line 5: `packages/autocommit` uses `branch = main`.
- `.gitmodules` line 9: `packages/auth-service` uses `branch = main`.
- `.gitmodules` line 13: `packages/kanban` uses `branch = promethean/dev`.
- `.gitmodules` line 17: `packages/logger` uses `branch = main`.
- `.gitmodules` line 21: `packages/mcp` uses `branch = promethean/dev`.
- `.gitmodules` line 25: `packages/naming` uses `branch = promethean/dev`.
- `.gitmodules` line 29: `packages/persistence` uses `branch = promethean/dev`.
- `.gitmodules` line 33: `packages/utils` uses `branch = promethean/dev`.
- `.gitmodules` line 37 onward: remaining submodules currently lack explicit `branch` entries; git reports they are checked out at `heads/device/stealth`.
- `git submodule status --recursive` shows all submodules at `heads/device/stealth` commits, so only .gitmodules needs alignment.

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
