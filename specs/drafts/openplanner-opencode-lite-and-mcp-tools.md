# OpenPlanner + opencode-lite + MCP tool gateway (proxy UI tooling)

## Context
We want a lightweight, Postgres-backed replacement for the pieces of OpenCode that OpenPlanner/workbench actually depend on, and we want the proxy UI to surface OpenPlanner + MCP as the *real* base toolset (instead of the current OpenCode-style `bash/read/edit/...` seed list that the UI cannot execute).

Constraints:
- (世, p=0.8) OpenPlanner historically depended on a running OpenCode server to run agents.
- (世, p=0.8) We cannot run stock OpenCode in ephemeral containers because it stores state in SQLite.
- (己, p=0.95) This repo already has Fastify + Postgres client (`postgres`) and a web UI, but the Chat UI does not implement tool execution.

## Goals
P0
1. Define the **minimum OpenCode/OpenAPI subset** required by OpenPlanner/workbench ("opencode-lite").
2. Define the **OpenPlanner API surface** that should be treated as first-class tools.
3. Define an **MCP discovery + execution** path so we can finally test existing MCP servers.

P1
4. Provide a server-side **agent/tool-call loop** so the web Chat UI can actually use tools.

## Non-goals
- Re-implement full OpenCode (editor integration, full permissions model, full LSP proxying).
- Provide arbitrary local shell/file tools in production (unsafe by default).

## Evidence (local code)
- OpenPlanner CLJS client expects these endpoints (from `packages/openplanner-cljs-client/dist/index.js`):
  - `GET /v1/health`
  - `GET /v1/sessions`
  - `GET /v1/sessions/:id`
  - `POST /v1/events` (index events)
  - `POST /v1/search/fts`
  - `POST /v1/search/vector`
  - `GET /v1/jobs`, `GET /v1/jobs/:id`
  - `POST /v1/jobs/import/chatgpt`
  - `POST /v1/jobs/import/opencode`
  - `POST /v1/jobs/compile/pack`
  - `POST /v1/blobs`, `GET /v1/blobs/:id`
- OpenCode CLJS client currently used in workbench (`@promethean-os/opencode-cljs-client`) hits these endpoints (from `packages/opencode-cljs-client/dist/index.js`):
  - `GET /session`
  - `GET /session/:sessionID`
  - `GET /session/status`
  - `GET /session/:sessionID/message`
  - `POST /session/:sessionID/message`
  - `GET /session/:sessionID/message/:messageID`
  - `POST /session/:sessionID/prompt_async`
  - plus `/lsp` endpoints (likely optional for OpenPlanner)
- Full upstream OpenCode OpenAPI exists in workspace at `orgs/anomalyco/opencode/packages/sdk/openapi.json`.
- Ecosystem MCP servers are declared in `../../ecosystems/*.cljs` (loaded by this proxy’s `/api/ui/mcp-servers` seed route) and include explicit `:PORT`, `:MCP_TRANSPORT "http"`, and `:LEGACY_MCP_URL` patterns (see `ecosystems/services_mcp.cljs`).

## Proposed architecture
### 1) opencode-lite service (Postgres-backed)
Implement only the subset needed by workbench/OpenPlanner.

Storage:
- `sessions` table: id, title, created_at, updated_at, prompt_cache_key
- `messages` table: id, session_id, role, content, reasoning_content, model, created_at

Endpoints (prefix decision TBD: either `/api/opencode/*` or root `/session/*` behind gateway):
- `GET /session`
- `GET /session/:sessionID`
- `GET /session/status` (can be minimal)
- `GET /session/:sessionID/message`
- `POST /session/:sessionID/message`
- `GET /session/:sessionID/message/:messageID`
- `POST /session/:sessionID/prompt_async` (can be implemented as a queued job or synchronous wrapper initially)

### 2) OpenPlanner as tools
Two options:
- (A) Treat OpenPlanner as an external service and expose thin tool wrappers that call its HTTP API.
- (B) Embed an OpenPlanner-compatible implementation inside this service (bigger scope: search + vector + jobs + blobs).

Start with (A) unless we confirm OpenPlanner itself is missing/broken.

### 3) MCP tool discovery + execution
Goal: make MCP servers testable.

Discovery sources:
- existing seed listing from ecosystems (`/api/ui/mcp-servers`).

Execution approach:
- Prefer HTTP MCP transport when `:PORT` is present (or when `:MCP_TRANSPORT` indicates HTTP).
- Support legacy routing via `LEGACY_MCP_URL` if that is a hub/router.

We need:
- `GET /api/mcp/tools` (aggregate and cache tool schemas)
- `POST /api/mcp/tools/call` (execute tool call)
- auth: require proxy auth token or dedicated MCP shared secret.

### 4) Agent/tool-call loop (so UI tools actually work)
Add an optional server-side loop:
- accept a chat request
- call model
- if tool_calls returned:
  - execute via OpenPlanner tools and/or MCP
  - feed tool outputs back to model
  - repeat until stop/limit

This can live behind a new endpoint (example):
- `POST /api/agent/chat` or `POST /v1/chat/completions` gated by `open_hax.agent=true`.

## Open questions
1. Which OpenCode endpoints are truly required in practice by OpenPlanner/workbench beyond `GET /session`?
2. Do we have a production OpenPlanner service already running (and just need tool wrappers), or do we need to implement OpenPlanner server-side too?
3. Which MCP transport(s) must be supported first (HTTP only vs stdio)?
4. Security model: should MCP tool execution be disabled by default unless an allow-list is configured?

## Risks
- (世, p=0.7) Tool execution from a web UI can become RCE if MCP servers expose dangerous capabilities; require allow-listing + auth.
- (世, p=0.6) Implementing vector search (OpenPlanner) without existing infra may pull in pgvector/Chroma decisions.
- (世, p=0.5) Implementing an agent loop inside a proxy can create long-lived requests and complexity (timeouts, streaming, retries).

## Phases
### Phase 0: Spec finalization
- Confirm exact endpoint subset.
- Decide whether opencode-lite lives in this repo or as a sibling service.

### Phase 1: opencode-lite (sessions/messages) with Postgres
- Implement storage + endpoints.
- Add minimal tests proving `@promethean-os/opencode-cljs-client` can list sessions.

### Phase 2: MCP tool smoke tests
- Implement MCP tool discovery + `tools/call` for HTTP transport.
- Add a diagnostics route to test-connect all seeded MCP servers.

### Phase 3: Agent loop + UI integration
- Add server-side loop endpoint.
- Update web Chat UI to hit agent endpoint and display tool_calls + tool outputs.

## Definition of done
- Workbench can call opencode-lite `/session` and get stable titles.
- Proxy UI can list MCP servers and run a health check against each.
- At least one MCP tool can be invoked end-to-end from the proxy UI.
- All new state is persisted in Postgres (no sqlite, no local JSON as source of truth).
