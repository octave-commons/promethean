# Typecheck remediation: kanban-plugin-git-index + docs-system

## Context

- pre-push typecheck failed for two targets
- `kanban-plugin-git-index` tests import non-existent `../lib/*` paths and have implicit any callbacks
- `@promethean-os/docs-system` missing swagger dependencies for server entry

Related: [[docs/AGENTS]] • [[packages/kanban/README]]

## Code references

- cli/kanban/packages/kanban-plugin-git-index/tests/git-integration.test.ts:12,102-104,129
- cli/kanban/packages/kanban-plugin-git-index/tests/git-sync.test.ts:25-28,81-82
- cli/kanban/packages/kanban-plugin-git-index/tests/git-workflow-integration.test.ts:11-13
- cli/kanban/packages/kanban-plugin-git-index/tests/indexer.test.ts:6-7
- cli/kanban/packages/kanban-plugin-git-index/tests/git-utils.test.ts:10
- experimental/docs-system/src/server/index.ts:11-12
- experimental/docs-system/package.json

## Known issues / PRs

- No open issues or PRs found for these specific failures.

## Requirements

- Point kanban-plugin-git-index tests at real cli/kanban source modules and remove implicit any warnings.
- Ensure docs-system typechecks by declaring swagger dependencies with types available.

## Definition of done

- `pnpm --filter @promethean-os/kanban-plugin-git-index typecheck` succeeds.
- `pnpm --filter @promethean-os/docs-system typecheck` succeeds.
- No new TypeScript implicit-any diagnostics introduced in touched files.
- Changes committed or ready for commit.
