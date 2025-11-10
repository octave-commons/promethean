# LMDB Cache ↔ Level Cache Parity Spec

## Scope

Bring `@promethean-os/lmdb-cache` in line with the behavior of `@promethean-os/level-cache`, ensuring both packages expose indistinguishable cache semantics for callers.

## References

- `packages/level-cache/src/index.ts` (core reference implementation), esp. lines 16-235 for helpers, namespacing, entries iteration, and namespace composition.
- `packages/lmdb-cache/src/cache.ts` (target), esp. lines 24-323 for LMDB helpers, namespace handling, and iterator logic.
- `packages/lmdb-cache/src/tests/cache.test.ts` (parity assertions), esp. lines 19-210.

## Existing Issues / PRs

- None identified for this specific parity task.

## Requirements

1. **Default TTL Consistency**

   - Match `openLevelCache` default TTL behavior (currently 24h) when `defaultTtlMs` is omitted.
   - Ensure the value propagates through `set`, `batch`, and nested namespaces just like `packages/level-cache/src/index.ts:116-149`.

2. **Namespace Composition**

   - Mirror Level cache's `composeNamespace` behavior (`namespace/child`).
   - `withNamespace` must return a pure view backed by the same DB handle (no recursive `openLmdbCache` calls) as defined around `packages/level-cache/src/index.ts:191-218`.
   - Entries emitted from namespace-scoped caches must match Level's prefix filtering semantics (`ns\u241Fkey`).

3. **Helper Structure**

   - Adopt the same `buildCacheScope` pattern so that `get/has/set/del/batch/entries/sweepExpired/withNamespace` share the same `state` object.
   - Ensure stat tracking (`hitRate`) continues to work after refactor (LMDB-only feature).

4. **Entries Iteration**

   - Use LMDB `getRange` but keep API-compatible outputs—no consumer-visible namespace option unless absolutely required.
   - Confirm `limit` behavior matches Level's `IteratorOptions.limit` semantics.

5. **Testing**
   - Extend/adjust `packages/lmdb-cache/src/tests/cache.test.ts` to cover:
     - Default TTL fallback to 24h when none supplied.
     - Nested `withNamespace` parity (logical keys, parent isolation).
     - Any new helper behaviors introduced by the refactor.

## Definition of Done

- LMDB cache shares the same observable behavior as Level cache for all API methods in `Cache<T>`.
- All LMDB cache unit tests pass locally (`pnpm --filter @promethean-os/lmdb-cache test`).
- No regressions in stats tracking or existing LMDB-specific options.
- Documentation/TODO list updated to reflect completed parity tasks.
