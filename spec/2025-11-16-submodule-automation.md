# Submodule branch sync automation (2025-11-16)

## Context

- Need consistent submodule branch alignment for special branches (`device/*`, `dev/*`, `main`, `release`) with both local githooks and GitHub Actions enforcement.
- Local hooks must adjust `.gitmodules`, guard pushes/checkouts, and keep submodules clean/synced on special branches.
- CI must block merges when submodule branches cannot merge, optionally opening submodule PRs, and ensure `.gitmodules` reflects the merged branch.

## Files to change

- `.pre-commit-config.yaml` (add local hooks to run branch alignment/guard logic).
- `scripts/git-hooks/submodule-branch-sync.sh` (new hook/CI script implementing special-branch logic).
- `.github/workflows/submodule-branch-guard.yml` (CI for mergeability + post-merge sync).
- `spec/2025-11-16-submodules-device-stealth.md` (document guardrails and verification state).
- This spec (`spec/2025-11-16-submodule-automation.md`).

## Requirements

- Special branches always align submodule branches to the parent branch on commit/checkout.
- Push is blocked if any submodule is detached, mid-merge/rebase, dirty, or on a different branch; attempt auto-align once.
- Checkout on special branches blocks when submodules are dirty and syncs submodules after ensuring `.gitmodules` matches the branch.
- CI: on PRs to special branches, fail if submodule branches cannot merge; auto-open submodule PRs for conflicts; create missing base branches from `main`.
- CI: on pushes to special branches (post-merge), update `.gitmodules` to match branch and push commit.
- No changes applied for non-special branches (`feature/*`, `chore/*`, `codex/*`, `bug/*`, `docs/*`).

## Definition of done

- Scripted hooks in repo to enforce local behavior (commit/push/post-checkout via pre-commit stages).
- Workflow enforcing CI mergeability and post-merge `.gitmodules` alignment.
- Documentation updated (specs) describing behaviors and verification steps.
- Existing submodule branch alignment (device/stealth) preserved for current branch and auto-adjusted on other special branches.
