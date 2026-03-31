# Node modules ignore follow-up

## Context

The user noted `node_modules` directories are showing as untracked in multiple submodules. Current dirty submodules from `git submodule foreach git status` include:

- cli/compiler
- cli/ecosystem-dsl
- packages/benchmark
- packages/embedding
- packages/github-sync
- packages/markdown
- packages/providers
- packages/trello
- pipelines/boardrev
- pipelines/codepack
- pipelines/cookbookflow
- pipelines/core
- pipelines/lint-taskgen
- pipelines/symdocs
- pipelines/testgap
- services/file-indexer-service
- services/frontend-service
- services/knowledge-graph
- services/mcp-express-server
- services/sentinel

## Plan (phases)

1. Inspect each affected submodule to confirm absence of `node_modules/` ignore rules and check for existing .gitignore patterns.
2. Add `.gitignore` entries (new files if missing) to ignore `node_modules/` in each affected submodule.
3. Re-run git status to confirm submodules are clean of `node_modules` noise.

## Files of interest (planned edits)

- cli/compiler/.gitignore:1 – add `node_modules/` ignore
- cli/ecosystem-dsl/.gitignore:1 – add `node_modules/` ignore
- packages/benchmark/.gitignore:1 – add `node_modules/` ignore
- packages/embedding/.gitignore:1 – add `node_modules/` ignore
- packages/github-sync/.gitignore:1 – add `node_modules/` ignore
- packages/markdown/.gitignore:1 – add `node_modules/` ignore
- packages/providers/.gitignore:1 – add `node_modules/` ignore
- packages/trello/.gitignore:1 – add `node_modules/` ignore
- pipelines/boardrev/.gitignore:1 – add `node_modules/` ignore
- pipelines/codepack/.gitignore:1 – add `node_modules/` ignore
- pipelines/cookbookflow/.gitignore:1 – add `node_modules/` ignore
- pipelines/core/.gitignore:1 – add `node_modules/` ignore
- pipelines/lint-taskgen/.gitignore:1 – add `node_modules/` ignore
- pipelines/symdocs/.gitignore:1 – add `node_modules/` ignore
- pipelines/testgap/.gitignore:1 – add `node_modules/` ignore
- services/file-indexer-service/.gitignore:1 – add `node_modules/` ignore
- services/frontend-service/.gitignore:1 – add `node_modules/` ignore
- services/knowledge-graph/.gitignore:1 – add `node_modules/` ignore
- services/mcp-express-server/.gitignore:1 – add `node_modules/` ignore
- services/sentinel/.gitignore:1 – add `node_modules/` ignore

## Existing issues/PRs

- None identified for this ignore update.

## Definition of done

- Each listed submodule ignores `node_modules/` via `.gitignore`.
- `git submodule foreach git status` shows no untracked `node_modules` entries for these paths.
- No unrelated files are touched.

## Requirements

- Default to ASCII and keep edits minimal.
- Do not affect other submodules or tracked files.
- Keep documentation traversable; new doc placed under `spec/`.
