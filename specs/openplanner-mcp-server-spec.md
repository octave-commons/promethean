# openplanner-mcp — MCP Server Spec

**Status:** draft  
**Branch:** feat/openplanner-mcp-server  
**Repo:** riatzukiza/devel → services/openplanner + orgs/open-hax/openplanner/packages/openplanner-mcp

---

## 1. Purpose

`openplanner-mcp` exposes openplanner's epistemic kernel as a
[Model Context Protocol (MCP)](https://modelcontextprotocol.io) server.
Any MCP-capable client — Knoxx agents, Claude Desktop, opencode, or a
raw HTTP consumer — can call it to search the knowledge lake, ingest new
observations, read the graph, and write attestations without touching the
openplanner REST API directly.

The MCP layer is intentionally thin: it translates MCP tool-call JSON
into openplanner HTTP calls and streams results back.  No business logic
lives here; all truth lives in openplanner.

---

## 2. Position in the Stack

```
MCP client (Knoxx agent / Claude / opencode)
        │  MCP tool call (JSON-RPC 2.0 over HTTP/SSE or stdio)
        ▼
  openplanner-mcp  :7778
        │  REST
        ▼
  openplanner      :7777   ← epistemic kernel / source of truth
        │
        ├── MongoDB (events, vectors, compacted)
        └── graph-weaver :8796  (optional, for graph tools)
```

`openplanner-mcp` is a **stateless sidecar**.  It holds no DB connections
of its own; every request fans out to openplanner (and optionally
graph-weaver) and returns.

---

## 3. Transport

| Mode | When | How |
|------|------|-----|
| `http` (default) | Network clients (Knoxx, remote agents) | HTTP POST `/mcp` + SSE stream on `GET /mcp/sse` |
| `stdio` | Local sidecar (Claude Desktop, opencode dev) | stdin/stdout JSON-RPC |

`MCP_TRANSPORT` env var selects the mode.  In the docker-compose service
`http` is the default so Knoxx can reach it over the `ai-infra` network.

All HTTP requests require `Authorization: Bearer <MCP_AUTH_TOKEN>`.

---

## 4. Tool Surface

All tools accept an optional `project` argument that overrides
`MCP_DEFAULT_PROJECT`.  All tools return plain-text or JSON content
blocks that fit within `MCP_MAX_RESULT_TOKENS`.

### 4.1 Search / Recall

| Tool | Description | Key args |
|------|-------------|----------|
| `memory_search` | Semantic + keyword search over the event lake | `query`, `project`, `limit`, `min_score` |
| `memory_recall` | Retrieve a specific event or compacted memory by id | `id`, `project` |
| `memory_recent` | Most recent N events for a project | `project`, `limit`, `source_filter` |

### 4.2 Ingest (write path, requires `MCP_INGEST_ENABLED=true`)

| Tool | Description | Key args |
|------|-------------|----------|
| `memory_ingest` | Write an `obs` or `fact` record into the lake | `kind` (`obs`\|`fact`), `content`, `project`, `source`, `p` |
| `memory_ingest_batch` | Write multiple records in one call | `records[]` |

The ingest tools are the MCP face of the epistemic write path.  A Knoxx
agent writing an `obs` here is equivalent to the ingestor processing a
file — both land in the same openplanner event collection.

### 4.3 Graph (requires `MCP_GRAPH_ENABLED=true`)

| Tool | Description | Key args |
|------|-------------|----------|
| `graph_neighbors` | Fetch N-hop neighbors of a node | `node_id`, `hops`, `edge_types` |
| `graph_search` | Semantic search over graph nodes | `query`, `project`, `limit` |
| `graph_path` | Shortest path between two nodes | `from_id`, `to_id` |

### 4.4 Epistemic Primitives

| Tool | Description | Key args |
|------|-------------|----------|
| `fact_assert` | Write a `fact` with provenance and confidence | `claim`, `src`, `p`, `ctx` |
| `inference_record` | Record a derived `inference` | `from[]`, `rule`, `actor`, `claim`, `p` |
| `attestation_write` | Write a receipt/attestation for an agent run | `actor`, `did`, `run_id`, `causedby`, `p` |
| `judgment_write` | Record a fulfillment verdict | `of`, `verdict`, `auditor`, `p` |

These four tools are the bridge between the contract/actor model and the
epistemic kernel.  A Knoxx contract execution calls `inference_record`;
a fulfillment contract calls `judgment_write`.

---

## 5. Package Layout

```
orgs/open-hax/openplanner/packages/openplanner-mcp/
├── Dockerfile
├── package.json          # name: @openplanner/mcp
├── src/
│   ├── index.ts          # entrypoint — reads MCP_TRANSPORT, starts server
│   ├── server-http.ts    # Fastify + @modelcontextprotocol/sdk HTTP transport
│   ├── server-stdio.ts   # stdio transport
│   ├── tools/
│   │   ├── search.ts
│   │   ├── ingest.ts
│   │   ├── graph.ts
│   │   └── epistemic.ts  # fact_assert, inference_record, attestation_write, judgment_write
│   ├── client/
│   │   └── openplanner.ts  # typed HTTP client for openplanner REST API
│   └── schemas/
│       └── epistemic.ts    # Zod schemas matching promptdb-core Malli shapes
└── dist/                 # compiled output, bind-mounted in docker-compose
```

---

## 6. Dockerfile

```dockerfile
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY src ./src
COPY tsconfig.json ./
RUN pnpm build

FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 7778
CMD ["node", "dist/index.js"]
```

---

## 7. Environment Reference

| Variable | Default | Notes |
|----------|---------|-------|
| `MCP_HOST` | `0.0.0.0` | Bind address |
| `MCP_PORT` | `7778` | HTTP port |
| `MCP_TRANSPORT` | `http` | `http` or `stdio` |
| `MCP_AUTH_TOKEN` | *(required)* | Bearer token for HTTP clients |
| `OPENPLANNER_BASE_URL` | `http://openplanner:7777` | Upstream REST API |
| `OPENPLANNER_API_KEY` | *(required)* | API key for openplanner |
| `MCP_DEFAULT_PROJECT` | `devel` | Default lake project |
| `MCP_MAX_RESULT_TOKENS` | `8192` | Truncation ceiling |
| `MCP_INGEST_ENABLED` | `true` | Allow write tools |
| `MCP_GRAPH_ENABLED` | `true` | Enable graph tools |
| `GRAPH_WEAVER_BASE_URL` | `http://graph-weaver:8796` | Graph sidecar |
| `OTEL_SERVICE_NAME` | `openplanner-mcp` | OTEL |

---

## 8. Health

`GET /health` returns `200 {ok:true}` when the server is up and
openplanner is reachable.  Used by the docker-compose healthcheck.

---

## 9. Auth Model

- HTTP transport: `Authorization: Bearer <MCP_AUTH_TOKEN>` on every
  request.  Returns `401` otherwise.
- Stdio transport: no transport-level auth (caller controls the process).
- The MCP server inherits openplanner's project-level access model:
  tool calls are scoped to the requesting client's `project` argument
  and openplanner enforces lake boundaries.

---

## 10. Relation to Epistemic Kernel

The four epistemic tools (`fact_assert`, `inference_record`,
`attestation_write`, `judgment_write`) map directly to the
`promptdb-core` primitive shapes defined in our sessions:

```clojure
;; promptdb-core shapes → MCP tool mapping
(fact ...)        → fact_assert
(inference ...)   → inference_record
(attestation ...) → attestation_write
(judgment ...)    → judgment_write
(obs ...)         → memory_ingest  {:kind "obs" ...}
```

This means any Knoxx contract execution that calls these MCP tools is
automatically auditable: every write lands in the openplanner event lake
with provenance, confidence, and causal linkage intact.

---

## 11. Open Questions

- [ ] Streaming tool results: should `memory_search` stream chunks as
  SSE events for large result sets, or buffer and return?
- [ ] Per-actor auth: should `MCP_AUTH_TOKEN` be one shared token or
  per-actor tokens that the server maps to openplanner project scopes?
- [ ] Promptdb filesystem ingest: does the MCP `memory_ingest` path also
  trigger the special `:source-kind :promptdb` EDN parse path, or is
  that ingestor-only?
- [ ] CLJS port: once openplanner-core migrates to `.cljc`, the schema
  validation in `schemas/epistemic.ts` should be replaced by the
  canonical Malli shapes compiled to JS.
