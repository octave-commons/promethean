# MCP Express Migration & OAuth Middleware Alignment

**Author:** Codex Agent  
**Date:** 2025-11-12  
**Related Request:** Replace Fastify usage in `@promethean-os/mcp` with Express, add linting guidance, and reuse the existing OAuth MCP middleware.

## Code References

- `packages/mcp/package.json:41-58` – declares `fastify` and `@fastify/*` runtime dependencies that must be removed when switching to Express.
- `packages/mcp/src/core/transports/fastify.ts:1-2100` – central HTTP transport implementation (imports Fastify at lines 1-4 and instantiates the server in `fastifyTransport` at lines 595-1010).
- `packages/mcp/src/index.ts:27-456` – imports `fastifyTransport` (line 27) and binds to it inside the CLI/tool bootstrapper (lines 456-470).
- `packages/mcp/src/auth/oauth-main.ts:8-211` – exposes Fastify-specific OAuth bootstrap helpers (`initializeOAuthSystem`, etc.) and re-exports `fastify-integration` at line 335.
- `packages/mcp/src/auth/middleware.ts:8-374` – the reusable MCP auth middleware currently typed against Fastify requests/replies; needs to operate on Express types when wiring OAuth flows.
- `packages/mcp/src/security/middleware.ts:6-393` – comprehensive security middleware wired through Fastify hooks (`addHook` at line 275) that must be re-platformed for Express.
- `packages/mcp/src/tests/**/*fastify*.test.ts` and other HTTP integration tests – consume `fastifyTransport`, so they must point to the new Express transport (e.g., `fastify-transport.integration.test.ts:10-110`).
- `eslint.config.mjs:112-139` – existing `no-restricted-imports` rule where we will introduce a warning about `fastify` usage.

## Existing Issues / PRs

- No open issues or PRs in this repo describe the Fastify deprecation or the Express migration. (Checked via `rg fastify spec/ docs/ .github/ ISSUE_TEMPLATE`).

## Requirements

1. Add an ESLint rule that **warns** when `fastify` or `@fastify/*` modules are imported anywhere in the workspace, with guidance to use Express-based transports instead.
2. Remove Fastify-specific dependencies from `@promethean-os/mcp` and add the Express equivalents (`express`, `cors`, `express-session`/`cookie-parser` as needed).
3. Replace `fastifyTransport` with an Express-based transport that exposes the same `Transport` API, supports MCP registries, HTTP proxy endpoints, UI assets, OpenAPI/action routes, and health/security endpoints.
4. Update `packages/mcp/src/index.ts`, config loaders, and any other call sites to instantiate the new Express transport.
5. Port `OAuthFastifyIntegration`, the shared security middleware, and other Fastify-bound modules (`auth/middleware.ts`, `auth/oauth/routes.ts`, etc.) so they register routes/middleware on Express while leveraging the existing MCP auth middleware for OAuth-protected endpoints.
6. Ensure all HTTP/integration tests reference the Express transport and continue to validate proxies, registries, and OAuth behavior.
7. Maintain strict TypeScript settings (no loosening of eslint/tsconfig), and keep the public surface area (exported helpers/types) stable or provide compatibility re-exports.

## Definition of Done

- `pnpm --filter @promethean-os/mcp build` and `pnpm --filter @promethean-os/mcp test` succeed locally.
- `packages/mcp/package.json` no longer lists `fastify` or `@fastify/*` dependencies; Express equivalents are present.
- All TypeScript sources under `packages/mcp/src` compile without importing `fastify` types; linting the repo only emits the intentional warning when legacy imports remain.
- OAuth initialization uses the MCP auth middleware within an Express pipeline, and `/auth/*` routes keep parity with previous functionality.
- HTTP integration tests exercise the Express transport (`expressTransport`) and pass.
- Documentation (package README or docs under `packages/mcp/docs/`) updated to mention Express transport usage if necessary.

## Plan (Phases)

**Phase 1 – Tooling & Dependencies**

- Extend `eslint.config.mjs` with a `no-restricted-imports` warning to discourage new `fastify` imports.
- Update `packages/mcp/package.json` dependencies/devDependencies to drop Fastify packages and add Express stack modules.

**Phase 2 – Core Transport Migration**

- Introduce `expressTransport` (new module) by adapting the logic inside `core/transports/fastify.ts` to Express middleware/routers.
- Ensure CORS, static assets, streamed MCP server connections, and proxy hand-offs work through Express equivalents.
- Switch `packages/mcp/src/index.ts` to import/instantiate the Express transport.

**Phase 3 – Security & OAuth Middleware Alignment**

- Port `McpSecurityMiddleware` and the OAuth integration/middleware files to Express request/response types.
- Reuse the existing `McpAuthMiddleware` to protect OAuth endpoints and tie into the Express server pipeline.
- Validate cookie/session handling and discovery endpoints still behave as before.

**Phase 4 – Tests & Cleanup**

- Rename/update HTTP transport tests and fixtures to reference Express (e.g., `express-transport.integration.test.ts`).
- Update any documentation snippets, examples, or pseudo scripts that previously instantiated Fastify.
- Run targeted builds/tests to confirm everything is green.

**Phase 5 – Verification & Lint**

- Execute `pnpm --filter @promethean-os/mcp lint`, `build`, and `test` to ensure the migration is stable.
- Capture any follow-up work (e.g., removing stray Fastify references) if warnings remain.

## Notes

- Preserve the external API exported from `packages/mcp/src/index.ts` (tool factories, transport helpers) so downstream callers are unaffected besides enabling Express.
- Consider providing a compatibility alias (`fastifyTransport` re-exporting the Express transport) to minimize downstream churn, but internally everything should be Express-based.
- The OAuth middleware already encapsulates authentication logic; focus on swapping out the HTTP bindings without rewriting business rules.
