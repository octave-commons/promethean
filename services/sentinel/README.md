# Sentinel

Unified file-event spine for Promethean. Sentinel watches large trees (home- or repo-scoped), emits raw file events, and produces synthetic events (e.g., detected submodule moves) that downstream services consume over the messaging bus.

## Goals

- Single watcher to minimize file handles and duplicated work across services.
- Publish raw and synthetic events via `@promethean-os/messaging` topics.
- Prefer Watchman (`fb-watchman`) with `chokidar` fallback.
- Submodule-aware workflows use `nodegit` (no shelling out to git).

## Status

Scaffold only. The entrypoint is compiled with `shadow-cljs` (`:sentinel` build). Wire up real watchers, messaging, and submodule move routines next.

## Config (EDN DSL)

- Default config path: `.sentinel.edn` at the chosen root (override with `SENTINEL_CONFIG`).
- Shape: `{:watchers {<path-keyword> {:synthetic [...] :actions [...] :children {...}}}
        :packs ["@promethean-os/autocommit" "@promethean-os/autosubmodule"]
        :use   ["@promethean-os/another-pack"]}`.
- Path keywords can be nested like `:foo/bar/baz`. See `config.example.edn` for a starter.
- Packs: Sentinel will try to resolve `<pack>/sentinel.edn` via Node resolution and merge its watchers.
- Anchors: Sentinel watches for build anchors (`shadow-cljs.edn`, `bb.edn`, `nbb.edn`, `deps.edn`, `package.json`). When found, it will look for `sentinel.edn` and `sentinel.<anchor>.edn` next to them and load/unload packs accordingly, emitting `sentinel.detected` logs.
