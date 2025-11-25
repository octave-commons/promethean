# Heal plugin test migration and failures

## Context

- `cli/kanban/src/tests/heal-command.test.ts` (notable sections: GitTagManager tag creation lines ~18-44, scar history lines ~69-116, tag deletion lines ~276-306) currently fails when `git add test.txt` runs because `ensureGitEnv()` sets `GIT_DIR`/`GIT_WORK_TREE` to another temp repo, so per-test git init in new temp dirs cannot see files.
- `cli/kanban/src/tests/helpers/git-env.ts` globally sets git env vars for tests; conflicts with per-test git repos.
- `cli/kanban/src/lib/heal/git-tag-manager.ts` holds heal git tag logic used by CLI heal command.
- `packages/kanban-plugin-heal/src/index.ts` is an empty scaffold; no plugin meta or exports exist.

## Existing issues/PRs

- None observed locally.

## Definition of done

- GitTagManager-related tests no longer fail due to git pathspec errors.
- Heal git tag tests live in the appropriate heal plugin package (not the CLI test suite) and run in isolation without relying on global git env.
- CLI heal command continues to work with the relocated code/tests (imports updated if needed).
- Scoped tests for heal functionality pass (targeted AVA or package tests), or failures documented if unrelated.

## Requirements / approach notes

- Remove dependency on global `ensureGitEnv()` for tests that create their own repos; restore or avoid `GIT_DIR`/`GIT_WORK_TREE` pollution.
- Add minimal plugin exports (`PluginMeta` + factory) for heal plugin so tests can target plugin package.
- Keep SDK/CLI imports aligned; if code moves, ensure re-exports or updated paths.
- Prefer minimal surface change: relocate tests and any shared helpers to plugin while keeping behavior identical.
