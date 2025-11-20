# fs CJS output for shadow-cljs

## Context

- Sentinel shadow-cljs tests fail to resolve `@promethean-os/ds/dist/index.cjs` when pulling `@promethean-os/fs` (current build relies on tsup dts and workspace deps).
- fs is packaged as ESM with CJS export (`packages/fs/package.json` lines 1-63) but tsup `--dts` errors on unlisted source files and blocks build.
- Messaging package solved a similar issue by emitting JS via tsup and DTS via plain `tsc` (`packages/messaging/package.json` lines 1-38).

## Code touchpoints

- `packages/fs/package.json` lines 1-64 — build scripts, exports, module type.
- `packages/fs/tsconfig.json` lines 1-16 — compiler options (composite, declaration, include src/\*_/_).
- `packages/fs/src/index.ts` lines 1-22 — public surface.
- `packages/messaging/package.json` lines 1-38 — reference build approach (tsup + tsc for dts).

## Existing issues / PRs

- None noted locally for fs CJS/shadow-cljs compatibility.

## Requirements

- Ensure fs publishes usable CJS artifact (`dist/index.cjs`) consumable by shadow-cljs consumers like sentinel.
- Generate declarations without tsup `--dts` failures; use tsc if needed.
- Keep ESM export intact (`dist/index.js`) and types path stable.
- Avoid breaking public surface; rely on existing src entrypoints.

## Definition of done

- `pnpm --filter @promethean-os/fs build` succeeds, producing dist JS+CJS+DTS.
- Sentinel shadow-cljs can resolve the CJS entry (no missing `@promethean-os/ds/dist/index.cjs`).
- Changes summarized with file references; tests/build run or rationale provided.

## Work log

- Updated fs build to tsup (JS) + tsc (DTS) mirroring messaging approach.
- Added tsup to ds and updated build to emit CJS/ESM plus declarations.
- Added tsup as a workspace dev dependency to share the bundler.
- Updated logger to use tsup + CJS/ESM exports (added `require` paths, dist wildcards) and built it.
- Built fs and ds; fs dist now contains CJS/ESM/DTS outputs.
- Sentinel shadow-cljs test now fails at runtime on `cljs.core/reset!` (state fixture), not missing module resolution; previous ds/logger module resolution errors resolved.
