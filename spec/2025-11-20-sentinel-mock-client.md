# Sentinel mock client test cleanup (2025-11-20)

## Context

- Sentinel client tests are failing in `services/sentinel` when running `pnpm --filter @promethean-os/sentinel test`.
- Build currently succeeds but test runner errors on missing mock client exports and arity warnings.

## Relevant files

- `services/sentinel/src/promethean/sentinel/client/node.cljs`: client implementation; `schedule-reconnect` arity defined at lines ~69-80, invoked at ~100-108 without required second arg; no mock client exports.
- `services/sentinel/src/promethean/sentinel/client/mock.cljs`: mock client implementations (`create-mock-client`, `create-mock-client-with-events`).
- `services/sentinel/test/promethean/sentinel/client/node_test.cljs`: unit tests expecting mock client helpers and validating backoff/state handling.
- `services/sentinel/test/promethean/sentinel/integration_test.cljs`: integration test creating mock client via `client/create-mock-client` and failing due to missing var.

## Issues observed

1. `create-mock-client` and `create-mock-client-with-events` exist in `client/mock.cljs` but are not exposed from `client/node.cljs`, causing runtime `TypeError` in integration tests and undeclared-var warnings in unit tests.
2. `schedule-reconnect` requires two params but is called with one in `connect-messaging` (lines ~101, ~107), producing :fn-arity warnings and preventing reconnect callback wiring.

## Definition of done

- Mock client helpers are exposed through the public sentinel client namespace and tests no longer error on missing vars.
- `schedule-reconnect` arity mismatch resolved; reconnect path wired with a valid callback.
- Sentinel test suite (`pnpm --filter @promethean-os/sentinel test`) runs without the previous SHADOW import error and without Arity/undeclared warnings related to these functions.

## Plan / next steps

- Re-export mock client helpers from `client/node.cljs` (require `client.mock` and add thin wrappers).
- Normalize `schedule-reconnect` to support single-arg usage by providing a default reconnect function or update call sites to pass one.
- Rerun sentinel tests to confirm fixes and absence of warnings.

## Notes

- Config `:mock` flag currently unused by `createSentinelClient`; leaving behavior unchanged unless further requirements surface.
