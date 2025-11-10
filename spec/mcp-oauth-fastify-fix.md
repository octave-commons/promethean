# MCP OAuth Fastify Build Fix

**Author:** Codex Agent  
**Date:** 2025-11-09  
**Related request:** User reported `@promethean-os/mcp` build failure because the repo depends on `mcp-auth`, an Express-first package that does not fit our Fastify stack.

## Code References

- `packages/mcp/src/auth/mcp-auth-adapter.ts`: Entire file introduces the `mcp-auth` dependency and Fastify adapter.
- `packages/mcp/src/auth/oauth/routes.ts`: Compilation errors due to missing Fastify cookie typings, unused params, and incorrect reply API usage.
- `packages/mcp/src/auth/oauth-main.ts`: `hasActiveSessions` declared but unused (line ~246).
- `packages/mcp/src/auth/ui/oauth-login.ts`: Class defines private members `onAuthSuccess`/`onAuthError` and methods with the same identifiers causing duplicate symbol errors (lines ~48-360). Success callbacks never fire, making it impossible to observe end-to-end auth completion in automated flows.
- `packages/mcp/src/config/auth-config.ts`: Env override for `adminIpWhitelist` can produce `undefined` though the field is typed as `string[]` (line 254).

## Existing Issues / PRs

- No open issues or PRs in the repo describing this specific Fastify vs `mcp-auth` mismatch (checked via quick `rg`/history scan).

## Requirements

1. Build must succeed via `pnpm --filter @promethean-os/mcp build`.
2. Remove the Express-only `mcp-auth` dependency and any unused adapter code.
3. Align OAuth HTTP routes and UI utilities with Fastify typings (cookie helpers, redirect signature, optional query params, unused parameters, etc.).
4. Keep OAuth UI component usable by avoiding duplicate identifiers and ensuring optional callback parameters remain type-safe.
5. Preserve existing public exports unless they are unused/invalid; no new runtime dependencies.
6. Maintain strict TypeScript settings (no implicit `any`, no unused vars/params).

## Definition of Done

- `pnpm --filter @promethean-os/mcp build` passes locally.
- `pnpm --filter @promethean-os/mcp test` spot-check not strictly required but route-related changes should be covered by build.
- Source no longer imports `mcp-auth`; package.json dependency removed if unused.
- Fastify route handlers compile cleanly and leverage cookie plugin typings by importing `@fastify/cookie` type augmentation.
- OAuth login UI compiles without duplicate identifier errors and still exposes callback hooks.
- Auth config env overrides respect `string[]` requirement for `adminIpWhitelist`.

## Plan (Phases)

**Phase 1 – Dependency cleanup**

- Delete `packages/mcp/src/auth/mcp-auth-adapter.ts` and ensure nothing exports it.
- Remove `mcp-auth` from `packages/mcp/package.json` dependencies.

**Phase 2 – OAuth HTTP routes**

- Add Fastify cookie type augmentation import.
- Remove unused destructured fields (`jwtManager`, `authManager`).
- Replace `as const` expressions with plain string unions.
- Ensure helper functions accept optional session IDs and guard before setting cookies.
- Fix redirect signature and extend `OAuthCallbackRequest` with `redirect_uri`.
- Prefix unused handler parameters with `_` or remove them.

**Phase 3 – OAuth UI component**

- Rename private handler properties (e.g., `authSuccessHandler`) to avoid clashing with public methods.
- Bridge browser-global handler storage so the UI can propagate success/error events after `handleOAuthCallback` completes, enabling Playwright/Chrome automation to observe the full OAuth round-trip.
- Ensure callback helper `handleOAuthCallback` posts required data and invokes the registered handlers.

**Phase 4 – Auth config typing**

- Default `adminIpWhitelist` to existing array when env var absent, ensuring a `string[]` is always assigned.

**Phase 5 – Verification**

- Re-run `pnpm --filter @promethean-os/mcp build` to confirm TypeScript success.

## Notes

- Keep documentation changes minimal; focus on build unblock.
- No evidence of external references to the removed adapter, but watch for generated exports.
- UI spec must support instrumentation (Playwright/Chrome DevTools) so exposing auth success/error hooks is critical for diagnosing the "last step" OAuth failures reported by ChatGPT automation.
