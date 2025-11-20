# Ecosystem DSL ↔ Sentinel integration (review)

## Scope

- Understand how `@promethean-os/ecosystem-dsl` (PM2 config generation) and `@promethean-os/sentinel` (file-event spine) behave today.
- Identify gaps preventing them from working together as “core OS” services.
- List candidate integration approaches and definition of done for wiring.

## Current state

- **Ecosystem DSL**
  - Generates per-daemon `dist/ecosystem.config.mjs` files and optional aggregate `ecosystem.config.enhanced.mjs`, then optionally `pm2 reload`/`start` per daemon (`cli/ecosystem-dsl/src/ecosystem_dsl/core.clj:335`).
  - Builds an Nx watcher process automatically into aggregate configs (`cli/ecosystem-dsl/src/ecosystem_dsl/core.clj:165-181`).
  - Local Java `WatchService` only watches for `ecosystem.edn` changes and re-runs generation in-process; no external event bus (`cli/ecosystem-dsl/src/ecosystem_dsl/core.clj:304-323`).
  - Validation and enhancement plumbing exists but is internal; no hooks for external triggers beyond the CLI (`cli/ecosystem-dsl/src/ecosystem_dsl/script.clj:96-150`).
- **Sentinel**
  - Chokidar-based daemon that loads `.sentinel.edn` + pack configs, normalizes nested watchers, and keeps a registry for synthetic rules (`services/sentinel/src/promethean/sentinel/core.cljs:37-161`).
  - Emits synthetic events per rule and publishes via messaging topic `sentinel.synthetic.<id>` when present (`services/sentinel/src/promethean/sentinel/core.cljs:201-235`).
  - Anchor detection watches for build roots and auto-loads adjacent sentinel configs/packs (`services/sentinel/src/promethean/sentinel/core.cljs:171-205,237-255`).
  - RPC queues exist for pack add/remove/reload using `@promethean-os/messaging` (`services/sentinel/src/promethean/sentinel/core.cljs:266-306`).
  - Actions are placeholders; no defined bridge to regenerate PM2 configs or control PM2.

## Gaps / risks

- Two separate watcher stacks: ecosystem-dsl’s JVM watcher vs Sentinel’s chokidar registry; they don’t share events or debounce logic.
- PM2 reload is done per-daemon directly from the generator; no centralized throttling or observation of success/failure.
- Sentinel synthetic rules publish to messaging, but no consumer exists to regenerate ecosystem configs or reconcile PM2 state.
- No common DSL between ecosystem.edn and sentinel.edn (conceptual overlap: watch rules & actions vs pm2 app configs).

## Integration options (candidate)

1. **Sentinel pack for ecosystem configs**

   - Pack watches `system/**/ecosystem.edn` + supporting files, emits `sentinel.synthetic.ecosystem.changed` with source path and hash.
   - Action worker (could live in CLI or a small Node adapter) consumes this topic and runs `ecosystem-dsl.script` with `--skip-aggregate`/`--output` as needed, then triggers `pm2 reload` once per batch.

2. **RPC-driven regeneration**

   - Add a lightweight RPC handler (or CLI command) that Sentinel can call via `sentinel.pack.add`/custom queue to request regeneration of a specific daemon or aggregate.
   - Lets autopacks (anchor discovery) create/remove watch scopes without restarting the generator.

3. **Shared debounce + health**
   - Move debounce/cache from `should-emit?` into a reusable module exposed to both systems, or have the bridge coalesce events before invoking the generator/pm2.
   - Publish success/failure events `ecosystem.generate.{ok|failed}` for observability and retries.

## Definition of done (for first integration pass)

- Sentinel pack exists that detects ecosystem config changes and publishes a single synthetic event with source path + mtime.
- A bridge process consumes that event and calls `ecosystem-dsl.script` (no JVM watcher needed) to regenerate per-daemon + aggregate configs.
- PM2 reloads are batched (at least debounce changes per 1–2s) rather than per file event.
- Metrics/logs emitted over messaging: at minimum `sentinel.synthetic.ecosystem.changed` and `ecosystem.generate.{started,ok,failed}`; errors surface path + stderr.
- Works on both repo root and home-root installs (config paths respect SENTINEL_ROOT/SENTINEL_CONFIG and DSL `--dir`).

## Next steps (suggested)

- Implement a `sentinel.ecosystem.edn` pack with `:glob "**/ecosystem.edn"` and id `:ecosystem/changed`.
- Build a small consumer (could be a pm2 process defined by ecosystem-dsl) that subscribes to `sentinel.synthetic.ecosystem.changed` and runs the generator with configurable debounce + skip-aggregate flag.
- Add pm2 health/metrics publishing from the bridge so Sentinel can observe reload outcomes and retry.
