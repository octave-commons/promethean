# Spec: Restore docs-system API router typecheck

- **Date:** 2025-11-13
- **Owner:** Codex (via OpenCode)
- **Goal:** Remove the placeholder tokens that currently break `tsc` in `packages/docs-system/src/server/routes/index.ts`, add the missing router wiring, and tighten the route/middleware typings (unused params, router annotations, MongoDB filter types) so that `pnpm --filter @promethean-os/docs-system typecheck` succeeds again.

## Related Tests / Failures

- `pnpm --filter @promethean-os/docs-system typecheck`

## Code Hotspots (with line refs)

1. `packages/docs-system/src/server/routes/index.ts:5-33` – Route aggregator file still contains literal `...` placeholders after `authRoutes` import and router creation, so TypeScript parses invalid tokens before any `router.use` wiring.
2. `packages/docs-system/src/server/routes/auth.ts:5-208` – The route-level `Router` instance lacks a type annotation, the `logger` constant is unused, and the majority of handlers declare `req` parameters that are never read, triggering `noUnusedParameters` errors.
3. `packages/docs-system/src/server/routes/{documents,queries,ollama,users}.ts:5-80` – Each module exports a `Router` without an explicit type annotation and leaves placeholder `req` parameters unused.
4. `packages/docs-system/src/server/middleware/auth.ts:80-210` – `optionalAuth` never touches its `res` parameter, and `validateUser` queries Mongo by `_id` using a plain string instead of an `ObjectId`, so the MongoDB driver typings reject the filter.
5. `packages/docs-system/src/server/index.ts:16,142` – `setupRoutes` from the broken module is mounted under `/api/v1`, so the entire API layer is currently unusable until its export compiles.

## Existing Issues / PRs

- No open repository issues or PRs referencing this typecheck failure were identified via `rg "docs-system" spec` search and reviewing local history.

## Requirements

1. Replace the placeholder `...` tokens with concrete `router.use` registrations for `authRoutes`, `documentRoutes`, `queryRoutes`, `ollamaRoutes`, and `userRoutes`.
2. Keep the root `GET /` handler that returns the API metadata payload for smoke checks.
3. Ensure every router file exports a `Router` instance with an explicit `Router` type annotation (to avoid non-portable inferred types) and rename unused request/response parameters with `_` prefixes so `tsconfig`'s `noUnusedParameters` no longer fails.
4. Update `optionalAuth` and `validateUser` middleware signatures to avoid unused parameters and use `new ObjectId(req.user.id)` when querying MongoDB.
5. Ensure the module still exports `setupRoutes` as a `Router` instance and remains compatible with `app.use('/api/v1', authMiddleware, setupRoutes)`.
6. TypeScript typecheck must finish without errors within the docs-system package.

## Definition of Done

1. `pnpm --filter @promethean-os/docs-system typecheck` exits 0.
2. `src/server/routes/index.ts` composes every feature router and exposes the metadata route without lint/type errors.
3. No other packages report new type issues stemming from this change.

## Implementation Phases

1. **Router Composition Fixes**
   - Import the remaining feature routers (`documentRoutes`, `queryRoutes`, `ollamaRoutes`, `userRoutes`).
   - Instantiate the Express `Router`, register each sub-router under the appropriate `/auth`, `/documents`, `/queries`, `/ollama`, `/users` prefixes, and keep the root info route.
   - Export the configured router as `setupRoutes`.
2. **Route Module Hygiene**
   - Add explicit `Router` type annotations to every feature route file.
   - Rename unused handler parameters to `_req` / `_res` (and `_next` if necessary) to satisfy `noUnusedParameters`.
   - Either wire the logger usage or drop it so `tsc` stops flagging the unused symbol.
3. **Auth Middleware Typing**
   - Rename the unused `res` parameter in `optionalAuth` and import `ObjectId` from `mongodb` to build a correctly typed `_id` filter in `validateUser`.
4. **Verification**
   - Run `pnpm --filter @promethean-os/docs-system typecheck` to confirm the compilation failure is resolved.
