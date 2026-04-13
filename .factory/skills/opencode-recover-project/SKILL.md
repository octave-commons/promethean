---
name: opencode-recover-project
description: "Recover project state using OpenCode sessions, snapshots, and reconstituter outputs"
---

# Skill: OpenCode Recover Project

## Goal
Recover a project or feature by locating OpenCode session artifacts and reconstructing diffs into the working tree.

## Use This Skill When
- The user lost work and wants to restore it from OpenCode sessions or snapshots
- You need to rebuild a branch or feature from conversation history
- The request mentions "reconstitute", "recover", "snapshot", or "past sessions"

## Do Not Use This Skill When
- The change already exists in git history (use git tooling instead)
- You only need to inspect or edit a single file (use search + manual edit)
- The user explicitly does not want to use OpenCode session artifacts

## Inputs
- Project root path
- Target feature or time window
- OpenCode session IDs or search queries
- Destination for recovered diffs or patches

## Steps
1. Identify the target scope (feature name, timeframe, repo path).
2. Use session search to find relevant conversations:
   `pnpm -C packages/reconstituter opencode-sessions search "<query>"`.
3. Filter to specific sessions with `--session` and inspect message excerpts.
4. Locate snapshot or diff artifacts referenced by those sessions.
5. Export or copy diff files into a staging directory.
6. Normalize diffs to patch format and map paths to the repo root.
7. Dry-run apply patches and resolve path mismatches.
8. Apply diffs and run the relevant tests.

## Output
- A list of sessions consulted and artifacts used
- A set of recovered patches applied to the workspace
- Notes on conflicts, missing artifacts, or follow-up steps
