# Add `cli/apply-patch` as a tracked submodule

**Date:** 2025-11-17

## Context & Findings

- `.gitmodules:1-4` already defines `cli/apply-patch`, but the working tree reports `?? cli/apply-patch/`, meaning the gitlink entry has not been staged in the parent repo.
- `cli/apply-patch` itself is a clean repository on the `device/stealth` branch, so we only need to register it as a submodule.
- Other submodules show local modifications that must be committed before the root repo can record consistent references: `cli/kanban`, `cli/obsidian-export`, `packages/persistence`, `packages/platform`, `services/autocommit`, and `services/mcp` (`git status -sb`).

No related upstream issues or PRs were discovered via local inspection.

## Requirements

1. Ensure `cli/apply-patch` is tracked as a git submodule pointing to `git@github.com:riatzukiza/apply-patch.git` (branch `device/stealth`).
2. Commit current changes inside each dirty submodule so their HEADs include the intended updates (files noted above).
3. Update the root repository to reference the new `cli/apply-patch` gitlink and fresh submodule SHAs.

## Definition of Done

- `cli/apply-patch` appears in `git status` as a clean submodule reference (no longer untracked).
- Every listed submodule is clean after committing changes in its respective repo (`git status -sb` shows no modifications).
- The root repo only has tracked submodule pointer updates staged, ready for review.

## Plan

### Phase 1 – Register `cli/apply-patch`

1. Run `git submodule add` (or equivalent) using the existing path/URL to create the gitlink entry.
2. Verify `.gitmodules` remains correct and that the root repo now tracks the gitlink.

### Phase 2 – Commit dirty submodules

1. For each modified submodule:
   - Review changes (`git status`, `git diff`).
   - Craft a focused commit with message summarizing the change set.
   - Ensure working tree is clean afterward.
2. Order: `cli/kanban`, `cli/obsidian-export`, `packages/persistence`, `packages/platform`, `services/autocommit`, `services/mcp`.

### Phase 3 – Update root repo references

1. Run `git submodule status` to confirm all submodules are clean.
2. Stage `.gitmodules` (if changed) and submodule gitlinks, then prepare for final review/commit per user direction.
