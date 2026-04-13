---
name: opencode-apply-reconstituted-diffs
description: "Apply reconstructed diff patches safely and validate results"
---

# Skill: OpenCode Apply Reconstituted Diffs

## Goal
Apply reconstructed diff patches safely and validate that the workspace is consistent afterward.

## Use This Skill When
- You have recovered patches from OpenCode sessions
- The user wants diffs applied to reconstitute lost work
- You need a controlled, auditable application of changes

## Do Not Use This Skill When
- The changes already exist in a branch or git history
- The diffs are incomplete or untrusted

## Inputs
- Patch files or diff directories
- Target repo root
- Required test or build commands

## Steps
1. Create a clean working state (stash or branch as needed).
2. Dry-run each patch with `git apply --check`.
3. Apply patches in a deterministic order (oldest to newest).
4. Resolve conflicts manually and re-run checks.
5. Run tests or typechecks that cover changed areas.

## Output
- A summary of applied patches and any conflicts
- Test results or failure notes
