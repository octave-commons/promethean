# Spec: Fix autocommit PM2 args for recursive submodule support

## Context

- Autocommit CLI currently errors in PM2 logs due to unknown option `-r`.
- `services/autocommit/src/cli.ts` defines supported flags: `--path`, `--debounce-ms`, `--base-url`, `--api-key`, `--model`, `--temperature`, `--max-diff-bytes`, `--exclude`, `--signoff`, `--dry-run` (lines 10-26).
- Submodule traversal is automatic via `collectSubmodules` in `services/autocommit/src/git.ts` (lines 18-55) and used when starting watchers in `services/autocommit/src/index.ts` (lines 51-369). No CLI flag is required.
- PM2 config currently passes `-r` to autocommit, causing repeated failures and no commits.

## Existing issues/PRs

- None found locally; task is config correction.

## Requirements / Definition of Done

- Remove unsupported `-r` flag from `ecosystem.config.mjs` autocommit entry and ensure args align with CLI schema.
- Keep recursive submodule handling intact (already automatic in service code).
- PM2 autocommit process should start without "unknown option" errors; engine warning acknowledged but not in scope.
- Document change here once done.

## Files to touch

- `ecosystem.config.mjs`: update autocommit args.
- (Read-only references) `services/autocommit/src/cli.ts`, `services/autocommit/src/git.ts`, `services/autocommit/src/index.ts`.
