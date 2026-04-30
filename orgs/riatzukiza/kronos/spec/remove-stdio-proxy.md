# Spec: Remove stdio proxy functionality & move to HTTP-only MCP via SDK

## Background & current state
- Runtime bootstrap (`src/index.ts:384-512`) conditionally spins up Fastify with optional stdio proxies and still supports the legacy `transport = "stdio"` path via `stdioTransport()` (`src/core/transports/stdio.ts:1-11`).
- The Fastify/Express transports (`src/core/transports/fastify.ts:413-488`, `src/core/transports/express.ts:432-1883`) mount proxy descriptors with `type: 'stdio-proxy'` to forward JSON-RPC payloads to spawned stdio processes.
- Two distinct proxy implementations exist: `StdioHttpProxy` with manual initialization and stdout filtering (`src/proxy/stdio-proxy.ts:6-341`) plus `SdkStdioProxy` which wraps the MCP SDK client (`src/proxy/sdk-stdio-proxy.ts:1-206`). `createProxy()` selects between them (`src/proxy/proxy-factory.ts:1-63`).
- EDN-based proxy specs (`src/proxy/config.ts:1-203`) and CLI tooling (`src/bin/proxy.ts:6-220`) exclusively target stdio servers. Inline JSON config supports the same concept through `stdioProxies`/`stdioProxyConfig` (`src/config/load-config.ts:46-54`, `minimal-mcp.json:6-7`).
- Documentation, specs, and examples (README.md:3-118, `examples/mcp_servers.edn:2-73`, `spec/debug-filtering-validation.md:5-19`, `spec/test-suite-remediation.md:4-52`) describe stdio proxy lifecycle expectations, debug filtering, and failing suites tied to stdio behaviour.
- Dedicated tests (e.g., `test/stdio-proxy-negative.test.ts:6`, `test/stdio-proxy-validation.test.ts:5`, `test/stdio-proxy-debug-filtering.integration.test.ts:8-290`, `test/stdio-proxy-hook-debug.test.ts:6`, `test/stdio-proxy-working.test.ts:6`, `test/stdio-proxy-timing-negative.test.ts:7`, `test/http-config.test.ts:12-68`, `test/config.test.ts:10-126`, `test/config-write.test.ts:25-48`, `test/tests/fastify-transport.integration.test.ts:43-211`, `test/tests/fastify-proxy-registry-integration.test.ts:96-525`) hard-code stdio transport semantics. Pseudo scripts (`pseudo/verify-stdio-fix.js:4-130`) also target stdio.

## Existing issues / PR references
- Unable to query `gh issue list` because GitHub CLI is not authenticated in this environment, so no upstream issue/PR references are currently documented. We must capture any known tickets manually once credentials are available.

## Requirements
1. **Transport scope**: `@promethean-os/mcp` must operate solely as an HTTP server backed by the MCP SDK; the `transport = "stdio"` mode and `stdioTransport` shim are removed, and process orchestration happens only for HTTP endpoints.
2. **Remote tool connectivity**: Replace stdio proxy definitions with HTTP MCP tool descriptors (e.g., remote URL, auth headers, optional health path) and connect via the MCP SDK HTTP client (e.g., `@modelcontextprotocol/sdk/client/index.js` + HTTP transport) rather than spawning child processes.
3. **Configuration schema**: Introduce a new config shape (e.g., `httpTools`/`httpProxies`) that captures HTTP target metadata, reject legacy `stdioProxies`/`stdioProxyConfig` fields with actionable error messaging, and migrate EDN helpers to output the new structure.
4. **Operational UX**: Update CLI tooling, docs, and Dev UI so that only HTTP endpoints (registry or remote HTTP MCP tools) appear; CLI helpers like `src/bin/proxy.ts` should either be deleted or rewritten for HTTP remote discovery/health.
5. **Testing**: All unit/unit+integration suites must pass after the refactor; add positive HTTP client coverage to replace removed stdio suites, and ensure `pnpm test` (or the targeted subset) succeeds.
6. **DX/Docs**: README, spec docs, and examples must explain the HTTP-only flow, including migration guidance for users previously relying on stdio proxies.

## Proposed phases & approach

### Phase 1 — Remove stdio-specific runtime branches
- RIP out `stdioTransport()` usage and the `cfg.transport === 'stdio'` branch in `src/index.ts:401-512`; runtime should always bootstrap Fastify (or Express) with HTTP endpoints built from `resolveHttpEndpoints`.
- Delete `src/core/transports/stdio.ts` and any references; ensure build artifacts/exports no longer mention stdio.
- Update `src/config/load-config.ts` to drop `'stdio'` from the `transport` enum, remove `stdioMeta`, `stdioProxyConfig`, and `stdioProxies` fields, and provide validation errors when legacy keys are detected (with instructions to migrate).
- Adjust minimal config fixtures (`minimal-mcp.json`, `test-data/config/promethean.mcp.json`, etc.) to the new schema.

### Phase 2 — Replace proxy system with HTTP MCP client connectors
- Remove `src/proxy/stdio-proxy.ts`, `src/proxy/sdk-stdio-proxy.ts`, `src/proxy/proxy-factory.ts`, EDN loader (`src/proxy/config.ts`), and CLI `src/bin/proxy.ts` once HTTP-only connectors exist.
- Introduce a new module (e.g., `src/http/remote-client.ts`) that instantiates MCP SDK HTTP clients per config entry, caching session IDs and forwarding Fastify requests similar to the existing `ProxyLifecycle` but without process spawning.
- Extend `src/core/transports/fastify.ts` and `src/core/transports/express.ts` to mount these HTTP client descriptors (rename `kind: 'proxy'` → `'remote-http'`) and drop SSE/debug logic tied to stdio buffering.
- Migrate EDN tooling (if still needed) to produce HTTP descriptors (URL, auth) or deprecate EDN entirely if JSON-only config suffices.

### Phase 3 — Config/data/documentation migration
- Update README sections (lines 20-117) to describe HTTP-only deployments, remote HTTP tool definitions, and removal of stdio-specific CLI workflows.
- Rewrite `examples/mcp_servers.edn` (or replace with JSON examples) detailing HTTP endpoints, tokens, etc.; include warnings about removed `:args ["--stdio"]` semantics.
- Remove or rewrite spec docs referencing stdio debugging (`spec/debug-filtering-validation.md`, `spec/test-suite-remediation.md`), ensuring remaining documentation reflects HTTP connectors and MCP SDK best practices.
- Drop pseudo scripts under `pseudo/` targeting stdio, replacing them with HTTP smoke scripts if necessary.

### Phase 4 — Test suite overhaul
- Delete stdio-only tests (`test/stdio-proxy-*.ts`, `test/tests/fastify-*-proxy*.test.ts`, config tests referencing `'stdio'`, etc.) and replace them with HTTP remote-client coverage:
  - New tests verifying HTTP connector config parsing, connection errors, and Fastify routing for remote HTTP MCP tools.
  - Update `test/http-config.test.ts` to assert rejection of `stdio` fields and acceptance of HTTP remote descriptors.
  - Adapt `test/config.test.ts`/`test/config-write.test.ts` to the new schema.
  - Ensure integration suites (`test/tests/fastify-transport.integration.test.ts`, `test/tests/mcp-server-integration.test.ts`, etc.) continue to cover local registry endpoints alongside remote HTTP connectors.
- Refresh snapshot/fixture data under `test-data/` to remove stdio-specific keys.

### Phase 5 — Validation & DX polish
- Run `pnpm test` (or at least the fastify/http subsets) after each phase to ensure regressions are caught early.
- Provide migration notes highlighting breaking changes (config schema, removed CLI) and the HTTP MCP SDK flow. Consider adding a `docs/migration-guides/remove-stdio.md` if needed.
- Confirm Dev UI and any health endpoints no longer reference `stdio` proxies, and that telemetry/logging (e.g., `[mcp] transport = http ...`) reflects the new HTTP remote-client counts.

## Definition of done
- No codepaths reference `stdio` transport, proxies, or config keys; repository builds without dead imports and passes lint/tests.
- Configuration schema + validation reject old stdio fields, and new HTTP remote-tool descriptors are documented and tested end-to-end.
- HTTP transport fully leverages MCP SDK abstractions for both local registry endpoints and remote HTTP MCP tools, with tests covering success/failure.
- Docs/examples/specs align with the new architecture, providing migration guidance for previous stdio users.
- CLI/utilities/pseudo scripts referencing stdio are either removed or replaced, and Dev UI enumerates only HTTP endpoints.
- Automated test suites (unit + relevant integrations) and any manual verification steps for HTTP connectors succeed (`pnpm test` green or planned subset documented).

## Open questions / follow-ups
1. Should EDN generation remain supported for HTTP descriptors or should we collapse to JSON-only configuration? (Impacts tooling and migration docs.)
2. What auth mechanisms must the HTTP MCP client support out of the gate (bearer token, API key header, mTLS)?
3. Do we still need a standalone proxy CLI once remote HTTP connectors exist, or should Fastify remain the single entrypoint?
4. How do we expose remote HTTP health in the Dev UI without stdio GET handlers (`createProxyHandler` currently responds with status metadata)?
