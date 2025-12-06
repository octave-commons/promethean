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
