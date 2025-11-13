# Spec: Restore docs-system API router typecheck

- **Date:** 2025-11-13
- **Owner:** Codex (via OpenCode)
- **Goal:** Remove the placeholder tokens that currently break `tsc` in `packages/docs-system/src/server/routes/index.ts` and properly compose the feature routers so that `pnpm --filter @promethean-os/docs-system typecheck` succeeds again.

## Related Tests / Failures

- `pnpm --filter @promethean-os/docs-system typecheck`

## Code Hotspots (with line refs)

1. `packages/docs-system/src/server/routes/index.ts:5-33` – Route aggregator file still contains literal `...` placeholders after `authRoutes` import and router creation, so TypeScript parses invalid tokens before any `router.use` wiring.
2. `packages/docs-system/src/server/index.ts:16,142` – `setupRoutes` from the broken module is mounted under `/api/v1`, so the entire API layer is currently unusable until its export compiles.

## Existing Issues / PRs

- No open repository issues or PRs referencing this typecheck failure were identified via `rg "docs-system" spec` search and reviewing local history.

## Requirements

1. Replace the placeholder `...` tokens with concrete `router.use` registrations for `authRoutes`, `documentRoutes`, `queryRoutes`, `ollamaRoutes`, and `userRoutes`.
2. Keep the root `GET /` handler that returns the API metadata payload for smoke checks.
3. Ensure the module still exports `setupRoutes` as a `Router` instance and remains compatible with `app.use('/api/v1', authMiddleware, setupRoutes)`.
4. TypeScript typecheck must finish without errors within the docs-system package.

## Definition of Done

1. `pnpm --filter @promethean-os/docs-system typecheck` exits 0.
2. `src/server/routes/index.ts` composes every feature router and exposes the metadata route without lint/type errors.
3. No other packages report new type issues stemming from this change.

## Implementation Phases

1. **Router Composition Fixes**
   - Import the remaining feature routers (`documentRoutes`, `queryRoutes`, `ollamaRoutes`, `userRoutes`).
   - Instantiate the Express `Router`, register each sub-router under the appropriate `/auth`, `/documents`, `/queries`, `/ollama`, `/users` prefixes, and keep the root info route.
   - Export the configured router as `setupRoutes`.
2. **Verification**
   - Run `pnpm --filter @promethean-os/docs-system typecheck` to confirm the compilation failure is resolved.
