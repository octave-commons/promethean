# Spec: Autocommit recovery for repos without checked-out commit

## Context

- PM2 logs (e.g., `logs/autocommit-error-1.log`) show repeated `error: 'workspaces/openhax-codex/' does not have a commit checked out` during autocommit cycles.
- Commit pipeline in `services/autocommit/src/index.ts:185-210` calls `addAll` before any guard and bubbles failures to the scheduler.
- Submodule discovery in `services/autocommit/src/git.ts:42-55` collects paths even when the submodule worktree is not checked out.
- No related open issues/PRs found.

## Problem

Autocommit attempts to stage changes inside submodules/worktrees that exist but lack a checked-out commit, causing repeated git failures and noisy logs. The service should detect this state and skip gracefully without derailing other repositories.

## Definition of Done / Requirements

- Detect the "no commit checked out" git error and skip the commit cycle for that repo with a clear warning.
- Ensure other repositories continue to commit normally; `runNow`/scheduler should not report failure for this condition.
- Avoid repeated noisy retries; once detected, subsequent cycles should remain stable until the repo is initialized.
- Add tests (or documented verification) covering the detection/skip path.

## Plan (phases)

1. Add a helper to classify git errors indicating a missing checkout and return commit status (`ran`/`skipped`) from the commit pipeline.
2. Update scheduler/runNow handling in `services/autocommit/src/index.ts` to treat this condition as recoverable (warn + skip) while proceeding with other repos.
3. Add unit coverage for the new helper/behavior (prefer `services/autocommit/src/tests/git.unit.test.ts` or a new test) and run targeted tests.
