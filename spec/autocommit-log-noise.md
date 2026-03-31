# Spec: Autocommit log noise

## Context

- PM2 tail shows hundreds of startup lines like `[autocommit] [submodule:/home/... ] Watching ... (debounce 10000ms)` from `services/autocommit/src/index.ts:244-245` and `:354-366`.
- `collectSubmodules` in `services/autocommit/src/git.ts` recurses all submodules, so every repo adds two log lines.
- No related open issues/PRs found.

## Problem

Autocommit floods PM2 logs at startup by logging a line per submodule (root + all nested). This obscures real warnings/errors.

## Requirements / Definition of Done

- Reduce startup log spam while keeping visibility that watchers are configured.
- Provide a concise summary instead of one line per submodule.
- Preserve existing functionality (watchers still created; no behavior change to commits).
- Add tests or targeted check if practical; otherwise explain verification.

## Plan (phases)

1. Replace per-submodule watcher info logs with aggregated summary (count + sample paths).
2. Keep warnings/errors intact; ensure watchers still start.
3. Validate by running targeted unit test or lint if lightweight; otherwise explain manual verification.

## Affected files

- `services/autocommit/src/index.ts`

## Notes

- Keep default debounce/logging behavior; only reduce startup chatter.
