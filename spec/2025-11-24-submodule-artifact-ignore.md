# Submodule generated artifact cleanup (dist/.cache/node_modules/test-data)

## Context

Cleanup to remove generated artifacts and add ignore rules in submodules that surfaced dist, .cache, node_modules, or test-data content in git status.

## Files touched (line hints)

- packages/effects/.gitignore:1-4 — add dist/node_modules/.cache/test-data ignores.
- packages/lmdb-cache/.gitignore:1-4 — add dist/node_modules/.cache/test-data ignores.
- pipelines/docops/.gitignore:1-4 — add dist/node_modules/.cache/test-data ignores.
- pipelines/piper/.gitignore:1-4 — add dist/node_modules/.cache/test-data ignores.
- pipelines/readmeflow/.gitignore:1-4 — expand ignores to dist/.cache/test-data (was only node_modules).
- pipelines/simtask/.gitignore:1-4 — add dist/node_modules/.cache/test-data ignores.
- services/openai-server/.gitignore:1-4 — add dist/node_modules/.cache/test-data ignores.
- services/mcp/.gitignore:36-40 — add test-data/ to existing ignore set.

## Existing issues/PRs

- Not surveyed for this cleanup; scope limited to local artifact removal.

## Definition of done

- Generated artifacts (dist, node_modules, .cache, test-data) removed from working trees of dirty submodules.
- Ignore rules present in each affected submodule to prevent re-introduction.
- Submodules ready for follow-up commits to persist removals.

## Requirements

- Do not revert other user changes in submodules.
- Keep removals scoped to generated content only.
- No commits created; leave staged deletions for follow-up confirmation/commit.
