# Sentinel Node Client & Autocommit Integration (Phase 1)

## Goal

Provide a Node.js Sentinel client to subscribe to Sentinel events (raw + synthetic) and invoke handlers. First consumer: autocommit replaces its chokidar loop with Sentinel-driven events while retaining debounce/commit logic and submodule support.

## Event payload schema

Events delivered by the client have:

- `:type` keyword (`:fs` or `:synthetic`)
- `:path` absolute string
- `:relative` string relative to watcher root (may be nil for raw)
- `:watcher` map `{ :key <id> :path <declared-path> :abs-path <string> }`
- `:rule` map (for synthetic) including `:id`, `:on`, `:glob`
- `:ts` millis timestamp

## Transport

- Primary: messaging (`@promethean-os/messaging` Rabbit ctx), topics `sentinel.synthetic.*` + raw if enabled.
- Dev/local fallback: in-proc/stdin-stdout mock that feeds test events (no messaging needed).

## Proposed API (client)

- `createSentinelClient({ url, topics, logger, reconnect, mock })` → `{ subscribe(fn), close() }`.
- Messages carry the schema above. Client handles reconnect/backoff.

## Autocommit changes

- Replace chokidar watcher in `services/autocommit/src/index.ts` with Sentinel client subscription.
- Interpret events: map `:on` to autocommit debounce trigger. Support submodules by running one autocommit controller per repo root (reuse existing logic) but drive scheduling from events instead of chokidar.
- Config: add `--sentinel` flag (opt-in) and optional `--sentinel-url` / env var. Fallback to chokidar if not set or connection fails.
- Logging: prefix events with watcher id; expose state via PM2 actions reflecting sentinel connectivity.

## Defaults

- Client reconnect with exponential backoff; default timeout 30s per receive.
- Payload adheres to schema above; log any malformed drops.

## Acceptance criteria

- Client connects to messaging, subscribes to `sentinel.synthetic.*`, handles reconnect; mock transport works for dev/tests.
- Autocommit with `--sentinel` commits on event streams; chokidar path kept as fallback.
- Submodules still commit locally before parent pointer commit (existing guarantee maintained).
- Tests: unit for client (reconnect, payload shape), integration for autocommit using simulated event feed (no Rabbit needed).

## Touchpoints

- `services/autocommit/src/index.ts` (watcher replacement, CLI flag)
- `services/autocommit/src/config.ts` (add sentinel opts)
- New module: `sentinel-client` or local implementation under autocommit
- Tests: `services/autocommit/src/tests/*.ts` (client tests + integration harness)

## Implementation files (planned)

- `services/sentinel/src/promethean/sentinel/client/node.cljs` (client)
- `services/sentinel/src/promethean/sentinel/events.cljs` (schema)
- `services/sentinel/src/promethean/sentinel/config.cljs` (config load)

## Investigation notes (2025-11-18)

- `services/sentinel/src/promethean/sentinel/client/node.cljs:55` messaging connection ignores `:url`, does not pass topics, and reconnect timer uses `js/setTimeout` while `close` clears with `js/clearInterval`.
- `services/sentinel/src/promethean/sentinel/client/node.cljs:121` subscription is created during client creation; `:subscribe` only re-subscribes callbacks and mock mode is stubbed without event feed unless `create-mock-client*` helpers are used.
- `services/sentinel/src/promethean/sentinel/events.cljs:32` schema covers watcher/rule/event but validation remains shallow (no structured errors) and allows nil `:relative`.
- `services/autocommit/src/index.ts:335` chokidar drives scheduling for repo + submodules; no Sentinel entry point yet.

## Existing issues / PRs

- Not checked yet; assume none identified for sentinel node client or autocommit integration.

## Definition of done

- Node client connects to messaging with configured URL/topics, handles reconnect/backoff, and validates payload shape.
- Mock/dev transport available without Rabbit for local runs and tests.
- Autocommit can opt into Sentinel event stream while preserving chokidar fallback and submodule ordering guarantees.
- Tests cover client reconnection/payload validation plus autocommit integration against simulated events.

## Requirements (traceability)

- Event payload: `:type`, `:path`, `:relative`, `:watcher`, `:rule` (synthetic), `:ts`.
- Primary transport topics `sentinel.synthetic.*` with optional raw feed.
- CLI/flags: `--sentinel`, `--sentinel-url` or env var; fallback to chokidar when disabled or on failure.
- Logging exposes watcher ids; PM2 state should reflect sentinel connectivity.
