# Sentinel runtime with sentinel.edn

## Context

- Ensure Sentinel runs using repo root `sentinel.edn` (packs + watchers) without missing pack resolution.

## Files/refs inspected

- services/sentinel/src/promethean/sentinel/core.cljs:37-43,84-110,144-173,175-208
- sentinel.edn (repo root):1-5
- services/autocommit/sentinel.edn:1-5

## Observations / suspected issues

1. Pack resolution uses `default-root` (process cwd at startup) in `load-pack-watchers`, so when sentinel starts from `services/sentinel` it resolves packs relative to that dir instead of the config file location; repo root packs (e.g., `services/autocommit`) fail to load. (core.cljs:40,101-110)
2. Anchor detection only watches sentinel filenames, not build anchors; may be irrelevant for immediate run but limits auto-loading configs (core.cljs:37-43,174-178).
3. Watcher `:glob`/`:ignored` options parsed but unused in event handling, causing noisy synthetic checks (core.cljs:84-99,225-238).

## Definition of done

- Sentinel can load `sentinel.edn` at repo root and resolve packs relative to that config path.
- Maintain existing tests passing.
- Provide summary of changes and follow-up recommendations.

## Plan

- Fix pack resolution to base on config path/root rather than startup cwd.
- Consider applying watcher filters during fs event handling if low-risk.
- Run `pnpm --filter @promethean-os/sentinel test`.
- Summarize outcomes.

## Tests to run

- `pnpm --filter @promethean-os/sentinel test`

## Change log

- Updated pack resolution to use config base/root so repo root `sentinel.edn` loads `services/autocommit` pack even when run from package dir.
- Added build anchors (shadow-cljs.edn, package.json, bb/nbb/deps.edn) to anchor watcher to auto-detect configs next to build roots.
- Applied watcher-level `:glob` and `:ignored` filters when handling fs events; added tests covering the behavior.
- Tests: `pnpm --filter @promethean-os/sentinel test` (pass; Node engine warning about 22.20.0 vs v22.18.0).
