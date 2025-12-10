# Add cache wrappers to @promethean-os/persistence

## Context

- LevelDB cache API lives in `packages/level-cache/src/index.ts:8-263` (functions `openLevelCache`, `defaultNamespace`, TTL + namespace helpers).
- LMDB cache API lives in `packages/lmdb-cache/src/cache.ts:12-303` and is re-exported via `packages/lmdb-cache/src/index.ts:1-2`.
- Persistence currently exposes context/dual store APIs only (`packages/persistence/src/index.ts:1-11`). It has no cache exports.
- Downstream packages import caches directly (e.g., `cli/docs/src/cli.ts`, `services/knowledge-graph/src/ann/related-embeddings.ts`).

## Existing issues / PRs

- None discovered related to this consolidation.

## Requirements

- Expose cache interfaces from `@promethean-os/persistence` so consumers can import caches there instead of directly from `@promethean-os/level-cache` or `@promethean-os/lmdb-cache`.
- Keep runtime behavior and APIs compatible with current cache implementations.
- Mark standalone cache packages as thin wrappers that delegate to `@promethean-os/persistence` exports.
- Update docs to point at the persistence surface and note deprecation of direct cache package consumption.
- Keep all existing tests passing for persistence, level-cache, and lmdb-cache.

## Definition of done

- `@promethean-os/persistence` exports cache factories/types for both LevelDB and LMDB implementations.
- `@promethean-os/level-cache` and `@promethean-os/lmdb-cache` delegate to persistence (no duplicate logic) and clearly state deprecation/redirect.
- Documentation in cache packages and persistence mentions the unified entrypoint.
- Relevant unit tests continue to pass.

## Plan (phases)

1. Add cache exports to persistence: import and re-export cache factories/types, and optionally wrap to keep names consistent.
2. Refactor cache packages into thin wrappers that re-export the persistence symbols and add deprecation notes.
3. Update docs/READMEs to direct users to `@promethean-os/persistence`; run targeted tests for cache packages (and persistence if feasible).
