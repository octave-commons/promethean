# Pantheon Core – `makeContextStore` Regression

## Files in Scope

- `packages/pantheon/core/src/core/context.ts:20-28` – dynamic import fetches `@promethean-os/persistence` and expects a `makeContextStore` export for context compilation.
- `packages/persistence/src/contextStore.ts:226-229` – factory exports stop at `createContextStoreFactory`, so no public `makeContextStore` helper exists.
- `packages/persistence/src/index.ts:1-9` – barrel re-export list needs to surface the restored helper.

## Existing Tracking

- Internal task `docs/agile/tasks/2025.11.07.fix-promethean-os-pantheon-core-build.md` documents TS2339 raised during `@promethean-os/pantheon-core` builds.
- No open GitHub issues or PRs mention the regression (`gh issue list --search "makeContextStore"`, `gh pr list --search "makeContextStore"`).

## Requirements

1. Re-introduce a functional factory named `makeContextStore` inside `@promethean-os/persistence`, delegating to the existing `createContextStoreFactory` implementation to avoid duplicate logic.
2. Ensure the helper accepts the documented dependency object (collections getter plus resolver hooks) and returns the compile primitives expected by Pantheon (`compileContext`, `getCollections`, etc.).
3. Export the helper through the package index so `import { makeContextStore } from '@promethean-os/persistence'` type-checks.
4. Provide TypeScript definitions that mirror the runtime API, keeping dependencies strongly typed.
5. Verify `pnpm --filter @promethean-os/pantheon-core build` completes without TS2339 errors.

## Definition of Done

- Persistence package exposes `makeContextStore` with the documented signature and delegations.
- Pantheon core builds cleanly when dynamically importing the helper.
- No new lint/type errors appear in the touched packages.
- The spec links and instructions remain traversable for future maintenance.
