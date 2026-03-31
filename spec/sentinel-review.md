# Sentinel Review

## Scope

- Review @services/sentinel codebase and tests for correctness and risks.
- Run package tests to confirm current behavior.

## Files and references

- services/sentinel/src/promethean/sentinel/core.cljs:37-43,84-99,101-160,174-208
- services/sentinel/src/promethean/sentinel/client/node.cljs:1-218
- services/sentinel/src/promethean/sentinel/config.cljs:1-202
- services/sentinel/src/promethean/sentinel/events.cljs:1-105
- services/sentinel/test/promethean/sentinel/\*.cljs:1-192

## Existing issues/risks observed

1. Anchor detection list only includes sentinel filenames, not build anchors described in README (shadow-cljs.edn, package.json, etc.), so dynamic pack loading for anchors never triggers (core.cljs:37-43,174-178).
2. Pack resolution uses a fixed `default-root` captured at startup instead of the active sentinel root/config path, breaking pack loading when running from a different working directory or with SENTINEL_CONFIG pointing elsewhere (core.cljs:40,101-110).
3. Watcher-level `:glob`/`:ignored` options are parsed but never applied when handling fs events; all files under the watcher path are processed, which can cause unnecessary synthetic rule checks and noisy emissions (core.cljs:84-99,225-238).

## Definition of done for this review

- Identify correctness or behavioral risks with file/line references.
- Run `pnpm --filter @promethean-os/sentinel test` and capture status.
- Summarize actionable follow-ups.

## Tests

- `pnpm --filter @promethean-os/sentinel test` (pass)
