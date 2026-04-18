---
name: opencode-extract-diffs
description: "Extract and normalize diff snapshots from OpenCode session artifacts"
---

# Skill: OpenCode Extract Diffs

## Goal
Extract diff snapshots from OpenCode artifacts and normalize them into clean patch files.

## Use This Skill When
- You have session artifacts that contain raw diff dumps
- The user requests reconstructing changes from snapshots
- You need to turn OpenCode output into patch files

## Do Not Use This Skill When
- You already have clean patches or a branch to cherry-pick
- The change can be reimplemented faster than extracting diffs

## Inputs
- Snapshot/diff artifact location(s)
- Target repo root
- Staging directory for patches

## Steps
1. Collect snapshot files referenced by the session search results.
2. Split large diff dumps into per-file patches when needed.
3. Normalize paths to be repo-relative (no absolute prefixes).
4. Validate each patch with `git apply --check`.
5. Group patches by feature or session for review.

## Output
- A set of cleaned patch files ready for application
- A log of patches that failed validation or need manual edits
