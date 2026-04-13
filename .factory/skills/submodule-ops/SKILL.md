---
name: submodule-ops
description: "Make safe, consistent changes in a workspace with many git submodules under orgs/**"
---

# Skill: Submodule Operations

## Goal
Make safe, consistent changes in a workspace with many git submodules.

## Use This Skill When
- You touch files under `orgs/**` or `.gitmodules`.
- You need to run `submodule` commands or update submodule pointers.
- You are asked to change code in multiple submodules.

## Do Not Use This Skill When
- The change is confined to the root workspace only.
- You are only editing documentation in `docs/`.

## Inputs
- The target submodule path(s).
- Any required submodule commands from `AGENTS.md`.

## Steps
1. Identify the exact submodule(s) impacted.
2. Work inside the submodule path; avoid cross-submodule edits.
3. Note any required sync/update steps before finishing.
4. Mention follow-up commands for the user if needed.

## Submodule Commands

```bash
# Sync .gitmodules mappings and initialize submodules
submodule sync [--recursive] [--jobs <n>]

# Update to latest tracked commits
submodule update [--recursive] [--jobs <n>]

# Show pinned commits and dirty worktrees
submodule status [--recursive]

# Smart commit with Pantheon integration
submodule smart commit "message" [--dry-run] [--recursive]
```

## Submodule Workflows
- `cd orgs/riatzukiza/promethean && pnpm --filter @promethean-os/<pkg> <command>`
- `cd orgs/anomalyco/opencode && bun dev`

## Core Principles
- **Atomic operations**: Commit submodule changes before updating parent pointers.
- **Recursive awareness**: Use `--recursive` only when nested submodules are required.
- **Parallel execution**: Control job count with `SUBMODULE_JOBS=<n>` (default: 8).
- **Status awareness**: Check `bin/submodules-status` before committing workspace changes.

## Strong Hints
- Avoid touching submodules you do not need.
- Keep edits localized to the intended repo.
- If a change spans multiple submodules, sequence the work and call it out.
- Use `submodule status` before and after large changes to confirm cleanliness.

## Output
- Clear list of modified submodule paths and any follow-up commands.

## Troubleshooting References
- Nested submodule failures: `spec/submodules-update.md`
- Worktree conflicts: `docs/worktrees-and-submodules.md`
