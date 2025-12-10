# Pantheon build target cycle (Nx run-many)

## Context

- `pnpm build` (`pnpm nx run-many -t build --all`) fails because Nx detects a circular build dependency: `@promethean-os/pantheon-orchestrator:build -> @promethean-os/pantheon-state:build -> @promethean-os/level-cache:build -> @promethean-os/test-utils:build -> @promethean-os/persistence:build -> @promethean-os/level-cache:build`.
- `nx.json:29-31` sets `build.dependsOn: ["^build"]`, so every build target pulls in the build of its workspace dependencies.

## Dependency edges forming the cycle

- Orchestrator depends on pantheon-state (`experimental/pantheon/packages/orchestrator/package.json:15-19`).
- Pantheon-state depends on level-cache (`experimental/pantheon/packages/state/package.json:15-18`).
- Level-cache re-exports persistence caches, creating a dependency on persistence (`packages/level-cache/src/index.ts:2-10`).
- Level-cache declares devDependency on test-utils (`packages/level-cache/package.json:26-28`).
- Test-utils depends on persistence (`packages/test-utils/package.json:30-55`).
- Persistence tests import `@promethean-os/level-cache` wrappers for parity checks (`packages/persistence/src/tests/cache-exports.test.ts:18-27`).

Together these edges create `level-cache -> test-utils -> persistence -> level-cache`, which, combined with the upstream pantheon orchestrator/state edges, makes the build graph cyclic under `^build`.

## Existing issues / PRs

- `gh issue list --search "pantheon build" --limit 5` returned no matches.
- `gh pr list --search "pantheon build" --limit 5` returned no matches.

## Definition of Done

- `pnpm build` completes without Nx reporting a circular dependency for build targets.
- Build graph for pantheon-\* and cache/persistence/test-utils packages is acyclic.
- Wrapper parity tests (if kept) run without pulling wrappers into build-time dependency cycles.

## Requirements / options to break the cycle

- Remove the back-edge from persistence to level-cache (e.g., move or skip the wrapper parity test from `packages/persistence/src/tests/cache-exports.test.ts` or exclude tests from the build target).
- Or, drop/relax the level-cache -> test-utils devDependency in the build graph (custom project.json with `dependsOn: []` or Nx tags/enforcement) so build does not depend on test-utils.
- Keep wrapper behavior intact: level-cache remains a thin re-export of persistence caches (`packages/level-cache/src/index.ts`).

## Actions taken

- Removed the persistence wrapper parity test that imported `@promethean-os/level-cache` (`packages/persistence/src/tests/cache-exports.test.ts`).
- Added wrapper parity tests to the wrapper packages themselves:
  - `packages/level-cache/src/tests/wrapper-parity.test.ts` checks level-cache exports match persistence.
  - `packages/lmdb-cache/src/tests/wrapper-parity.test.ts` checks lmdb-cache exports match persistence.
- This removes the persistence -> level-cache edge from the Nx graph while keeping wrapper parity coverage inside the wrapper packages.

## Verification

- After `pnpm nx reset`, `pnpm nx run-many -t build --projects @promethean-os/pantheon-orchestrator,@promethean-os/pantheon-state,@promethean-os/level-cache,@promethean-os/test-utils,@promethean-os/persistence` no longer reports a circular build dependency and now completes successfully after aligning pantheon types/ports.
- Pantheon build fixes applied: local actor/ports types now match in-repo usage (state is non-null, messages have roles), and mocks/tests updated to match the adapter surfaces.

## Next steps

- Run full `pnpm build` to confirm the broader workspace remains clean with these updates.
- Optionally drop the unused `@promethean-os/test-utils` devDependencies from level-cache and lmdb-cache to shrink the build graph further.
