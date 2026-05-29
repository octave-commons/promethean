---
uuid: "orgs-octave-commons-promethean-kanban-orgs-octave-commons-promethean-spec-2025-12-11-sentinel-regression-tests-md"
title: "Sentinel regressions: tests first"
status: incoming
priority: P3
labels: ["specs", "migrated-spec"]
created_at: "2026-05-29T04:01:14.582Z"
source: "orgs/octave-commons/promethean/spec/2025-12-11-sentinel-regression-tests.md"
category: "specs"
---

> Source: `orgs/octave-commons/promethean/spec/2025-12-11-sentinel-regression-tests.md`
> Migrated-to-kanban: `orgs/octave-commons/promethean/kanban/2025-12-11-sentinel-regression-tests.md`

# Sentinel regressions: tests first

## Scope

Add regression tests that capture three discovered issues in `services/sentinel`:

1. Raw FS payloads are rejected because `validate-event-payload` assumes an `:event` map (src/promethean/sentinel/client/node.cljs:38-55).
2. Successful reconnect never resubscribes, leaving the client connected but idle (src/promethean/sentinel/client/node.cljs:75-88,100-127).
3. RPC `sentinel.pack.add` ignores `:pack` additions because loaded watchers are not registered (src/promethean/sentinel/core.cljs:295-323).

## Related work

- Existing tests live under `services/sentinel/test/promethean/sentinel/`. No open issues/PRs referenced.

## Definition of done

- New tests in `services/sentinel/test` that fail on current behavior and cover the above three regressions.
- Implementation updated so the new tests pass without breaking existing suites.
- `pnpm --filter @promethean-os/sentinel test` succeeds.

## Requirements/notes

- Prefer unit-level tests using fakes/mocks; avoid hitting real messaging or filesystem.
- Keep changes localized to `services/sentinel` package.
- Maintain deterministic, parallel-friendly tests; mock external dependencies via module boundaries.
