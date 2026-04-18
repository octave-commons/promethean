# Comprehensive Security Suite Alignment

## Context
- `pnpm test` currently fails across multiple assertions in `src/tests/comprehensive-security.test.ts` (see log from 2025-11-17). The suite predates the structured `{ ok, error }` responses returned by the files tools (`filesViewFile`, `filesWriteFileContent`, `filesSearch`) and therefore still expects promise rejections for sandbox violations and attack attempts.
- `validatePathSecurity` (src/validation/comprehensive.ts:143-319) now reports issues using capitalized messages such as "Glob pattern attack detected"; the tests search for lowercase substrings and miss these hits (e.g., `{../,../}/**/passwd`).
- `authenticationManager.extractApiKey` (src/core/authentication.ts:327-341) dereferences `request.query` without guarding against `undefined`, causing `security: authentication prevents token manipulation` to throw when tests omit a query object.
- `McpSecurityMiddleware.enforceRateLimit` (src/security/middleware.ts:424-508) requires a populated `request.securityContext`, but the tests never invoke `createSecurityContext`, so rate limiting logic short-circuits before any headers or block counts are recorded.
- The DoS test (`security: input size limits prevent DoS attacks`) compares payload sizes against a 1MB threshold (`1024 * 1024`) but only allocates 1,000,000-byte strings, which are below the limit and therefore fails the `t.true` assertion.
- The "comprehensive attack simulation" still counts a blocked attack only when an exception is thrown; with the new structured error payloads it now reports zero blocked attacks even though tools return `{ ok: false, error: "path outside root" }`.

## Code References
1. `src/tests/comprehensive-security.test.ts` – tests at lines 143-567 for glob, symlink, sandboxing, rate limiting, authentication, DoS, and attack simulations.
2. `src/core/authentication.ts:327-344` – `extractApiKey` assumes `request.query` exists.
3. `src/security/middleware.ts:398-508` – `createSecurityContext` and `enforceRateLimit` methods used by the rate limiting/IP blocking tests.
4. `src/validation/comprehensive.ts:143-319` – message casing for glob/traversal detection.

## Requirements
- Update the comprehensive security tests to interpret structured `{ ok, error }` tool results (e.g., view/write/search) while still verifying that malicious operations are blocked.
- Normalize security issue assertions (e.g., glob attack detection) to treat messages case-insensitively so they continue to pass even if the implementation adjusts capitalization.
- Fix `AuthenticationManager.extractApiKey` so it safely handles requests without a `query` object, preventing TypeErrors in token manipulation tests.
- Ensure the rate-limiting and IP-blocking tests set up the necessary `securityContext` (via `createSecurityContext`) before calling `enforceRateLimit`, so the middleware under test actually exercises its logic.
- Make the DoS input test exceed the configured limit (>= 1,048,576 bytes) rather than relying on approximate lengths.
- Count failed attack attempts in the "comprehensive attack simulation" when the tool returns `{ ok: false }` in addition to when it throws, and assert that at least 70% of the crafted attacks are blocked.

## Plan
### Phase 1 – Align tests with current tool/middleware contracts
1. Update `security: glob pattern attacks are prevented` to compare lower-cased issue messages or otherwise perform a case-insensitive check.
2. Refactor the symlink, sandboxed write, and attack simulation tests to inspect `{ ok, error }` responses instead of expecting thrown exceptions; treat `ok === false` as a blocked attempt and document the expectation in the assertions.
3. Invoke `securityMiddleware['createSecurityContext']` before each `enforceRateLimit` call in the rate limiting and IP blocking tests so the middleware uses real client/IP data and produces 403 responses instead of TypeErrors.
4. Increase the payloads inside `security: input size limits prevent DoS attacks` so each sample actually exceeds the 1MB boundary (e.g., `1024 * 1024 + 1` characters).

### Phase 2 – Address supporting implementation gaps
1. Patch `AuthenticationManager.extractApiKey` (src/core/authentication.ts:327-341) to default `request.query` to `{}` when undefined, preventing the token manipulation test from throwing a TypeError.
2. Rebuild the project and rerun `pnpm exec ava --config ../../config/ava.config.mjs dist/tests/comprehensive-security.test.js` to verify the suite passes in isolation before moving on to the next failing file.

## Definition of Done
- `pnpm exec ava --config ../../config/ava.config.mjs dist/tests/comprehensive-security.test.js` completes with zero failures.
- No regressions in the authentication or middleware implementations (project builds cleanly via `pnpm run build`).
- All updated tests clearly document the structured-response expectations for files/search tools and the need to seed the security context when exercising middleware methods.
