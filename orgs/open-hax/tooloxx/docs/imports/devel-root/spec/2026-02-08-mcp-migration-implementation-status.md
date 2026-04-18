# MCP Migration Implementation Status (2026-02-08)

## Implemented in this pass

- Gateway MCP mux route added: `/api/mcp/:service/*` with service map lookup.
- Unknown service handling added: `404 { ok: false, error: "unknown_mcp_service", service }`.
- Config support added for `MCP_SERVICE_URLS` JSON mapping and `MCP_INTERNAL_SHARED_SECRET`.
- Gateway proxy now emits signed internal assertion headers for downstream MCP services:
  - `x-mcp-gateway-ts`
  - `x-mcp-gateway-sig`
- Gateway now forwards `x-request-id` to upstream MCP services.
- `mcp-files` hardened with auth/trust middleware:
  - loopback-only local bypass behavior
  - optional `ALLOW_UNAUTH_LOCAL=true`
  - gateway signature verification for non-local traffic
- `mcp-files` now supports MCP session DELETE route at `/mcp`.
- `mcp-files` legacy compatibility aliases implemented:
  - `files_list_directory`
  - `files_view_file`
  - `files_write_content`
  - `files_write_lines`
  - `files_tree_directory`
  - `files_search`
- Added shared package `packages/mcp-family-proxy` that provides:
  - local-bypass + signed gateway-assertion auth middleware
  - MCP pass-through proxying to legacy monolith
  - per-service tool-family filtering for `tools/list` and `tools/call`
- Scaffolded extracted `services/mcp-*` family services, each with `/health` and `/mcp` proxy contract:
  - `mcp-github`
  - `mcp-process`
  - `mcp-devtools`
  - `mcp-tdd`
  - `mcp-sandboxes`
  - `mcp-ollama`
  - `mcp-exec`
- Added workspace package wiring for the new shared package in `pnpm-workspace.yaml`.
- Added open-question decision record at `spec/95-open-questions-resolution.md`.

## Tests added/updated

- `services/api-gateway/src/tests/api-gateway.test.ts`
  - Added mux routing test for configured service route.
  - Added unknown-service contract test for mux.
- `services/mcp-files/src/tests/mcp-files.test.ts`
  - Added health smoke test.
  - Added MCP discovery smoke test asserting legacy `files_*` aliases are exposed.
- `packages/mcp-family-proxy/src/tests/family-proxy.test.ts`
  - Added health smoke test.
  - Added tool-filter contract test (`tools/list` filtered, disallowed `tools/call` blocked).
- `services/mcp-github/src/tests/mcp-github.test.ts`
  - Added service smoke test validating health + github-only tool filtering.

## Build/Test status

- `services/api-gateway`: build + test passing.
- `services/mcp-files`: build + typecheck + test passing.
- `packages/mcp-family-proxy`: build + test passing.
- `services/mcp-github`: build + test passing.
- `services/mcp-process`: build + typecheck passing.
- `services/mcp-devtools`: build + typecheck passing.
- `services/mcp-tdd`: build + typecheck passing.
- `services/mcp-sandboxes`: build + typecheck passing.
- `services/mcp-ollama`: build + typecheck passing.
- `services/mcp-exec`: build + typecheck passing.

## Remaining migration gaps against full 10-spec target

- Tool implementation extraction is currently proxy-based (delegating to monolith) rather than source-moved tool code.
- Full tool-schema parity snapshot tests against monolith are not yet added for all families.
- Rollout/deprecation execution (legacy route removal timing, warning logs) remains to be completed.
