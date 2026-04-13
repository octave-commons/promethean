# Test Suite Remediation Plan

## Overview
Full `pnpm test` run on 2025-11-17 reveals numerous failing suites across security, OAuth, proxy, files tooling, and stdio simulation scenarios. This plan documents the affected areas and defines a phased remediation approach so we can methodically restore a green build.

## Affected tests and references
1. **Security regression tests**
   - `src/tests/security.test.ts:297` — `security: command injection prevention` still allows literal `> /tmp/malicious` payloads instead of sanitizing.
   - `src/tests/security.test.ts:173` — `security: no hardcoded secrets in config files` attempts to read `/home/err/devel/orgs/riatzukiza/promethean.mcp.json` and fails with `ENOENT`.
   - `src/tests/security.test.ts:202` — `security: environment variable placeholders used` hits the same missing file.

2. **OAuth security/integration**
   - `src/tests/oauth-security.test.ts:92` — Session expiry test sees null session immediately.
   - `src/tests/oauth-security.test.ts:113` — Redirect allowlist should reject `https://evil.com/…` but currently returns URL.
   - `src/tests/oauth-security.test.ts:188` — PKCE flow missing code challenge.
   - `src/tests/oauth-security.test.ts:225` — Provider configuration should throw when client ID is empty yet returns system.
   - `src/tests/oauth-security.test.ts (pending state test circa line 330)` — Timeout-based state expiry still pending.
   - `src/tests/oauth-integration.test.ts:133` — `User registry CRUD operations` fails to fetch user entry.

3. **Files tools edge cases & integration**
   - `src/tests/files-tools-edgecases.test.ts:224` — Special-character path write scenario.
   - `src/tests/files-tools-integration.test.ts:216, 374, 416, 467, 514` — Multiple assertions expecting specific MCP SSE/error responses currently receive raw success/failure payloads from manual test harness, plus `No valid response found in SSE stream` for error-handling case.

4. **Proxy comparison & Fastify registry proxy integration**
   - `src/tests/proxy-comparison.test.ts:62, 129 + pending cases` — Manual vs SDK proxies fail due to missing assertions, initialization not awaited, and mismatched error text.
   - `src/tests/fastify-proxy-registry-integration.test.ts:112, 229, 302, 415, 568` — Registry descriptors missing `mcpServer`, HTTP codes mismatched (400 vs 404/200), SSE vs non-SSE requirements unmet.
   - `src/tests/fastify-proxy-negative.test.ts` timed out previously due to transport lifecycle issues.

5. **Negative stdio simulations / chatgpt harness**
   - `src/tests/chatgpt-simulation-negative.test.ts:34, 124` — `fetch failed` because simulated MCP endpoints never start or are blocked.
   - `src/tests/stdio-proxy-timing-negative.test.ts:33, 127` — Similar `fetch failed` from incorrect endpoint state, plus pending steps.

6. **Miscellaneous**
   - `src/tests/files-tools-edgecases.test.ts` other cases rely on `filesWriteFileContent` behavior for unusual paths.
   - `dist/tests/*` Ava warnings (“No tests found…”) indicate build step is pulling outdated compiled files without `import 'ava'` — indicates missing TS build step or stale outputs.

## Existing issues / PRs
- No upstream GitHub issues/PRs were referenced in the repository. All failures observed locally.

## Phased plan
- **Phase 1** — Harden security validation and provide fixture configs so command injection and config placeholder tests stop failing.
- **Phase 2** — Repair OAuth state machine (allowlist enforcement, PKCE generation, provider config validation, session registry) and ensure tests create deterministic fixtures.
- **Phase 3** — Re-align proxy factory implementations, ensure manual and SDK proxies expose identical interfaces, and update Fastify registry/proxy descriptors and timing expectations.
- **Phase 4** — Update files-tools integration harness to properly consume SSE responses, respect sandbox sessions, and cover edge cases like special-path writes.
- **Phase 5** — Stabilize stdio/chatgpt negative simulations by ensuring mock transports spin up and tear down cleanly, eliminating `fetch failed` errors.
- **Phase 6** — Verify no “No tests found” warnings remain by ensuring dist build emits Ava imports; run entire suite until green.

Each phase only proceeds once the prior phase’s targeted tests pass locally.

## Definition of done
1. `pnpm test` completes successfully with zero failures, pending tests, or “No tests found” warnings.
2. Updated tests accurately reflect current desired behavior for MCP security, OAuth, proxy, files, and stdio subsystems.
3. Documentation/spec updates (this plan plus any future notes) capture file references and rationale.

## Requirements
- Maintain strict sanitization for dangerous characters (including `>`, `&`, etc.) without breaking legitimate file paths.
- Provide deterministic mock config files for tests requiring `/home/err/devel/orgs/riatzukiza/promethean.mcp.json` or similar secrets placeholders.
- Implement PKCE/code-verifier generation and redirect allowlist enforcement so OAuth tests assert server-side protections accurately.
- Keep manual and SDK proxies behaviorally aligned and ensure Fastify transports deliver expected HTTP responses and SSE semantics.
- Ensure MPC SSE clients either receive valid SSE payloads or raise meaningful MCP errors so integration tests no longer hang waiting for output.
