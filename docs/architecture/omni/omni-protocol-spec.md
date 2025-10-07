# Omni Protocol Specification (v0 Draft)
$$
**Status:** Draft for review
$$
$$
**Editors:** Planning team (2025-09-21)
$$
## 1. Purpose
Define a single, transport-agnostic contract for Promethean's Omni capabilities so REST, GraphQL, WebSocket, and MCP adapters (plus future extensions) share identical semantics, envelopes, and guardrails.

## 2. Goals
- Canonicalize domain capabilities currently duplicated between `@promethean/smartgpt-bridge` and `@promethean/mcp`.
- Support multi-interface adapters without re-implementing logic.
- Preserve backward compatibility with `/v1` REST responses while enabling richer adapters.
- Bake in security (auth, RBAC, sandbox boundaries) and streaming conventions.

## 3. Non-Goals
- Implementing transport servers or clients.
- Redesigning underlying stores (Mongo, Chroma, filesystem, GitHub caching).
- Defining UX flows for web/mobile clients.

## 4. Terminology
- **RequestContext** – normalized metadata derived from incoming transports $auth subject, RBAC roles, root path, headers, trace ids$.
- **Success Envelope** – JSON object containing `{ ok: true, ... }` plus payload-specific fields.
- **Error Envelope** – JSON object containing `{ ok: false, error: { code, message, details? } }`.
- **Stream Event** – discrete event delivered over SSE/WS/stdio channels with `{ event, data, ts }` shape.

## 5. Architecture Overview
```
┌───────────────┐      ┌────────────────────┐      ┌─────────────────┐
│  Interfaces   │─────▶│  Omni Service Host │─────▶│ Shared Services │
│ (REST/GQL/WS/ │      │ (Fastify instance) │      │  (@promethean/  │
│      MCP)     │      └────────────────────┘      │   omni-core)    │
└───────────────┘              ▲                   └─────────────────┘
       │                       │                           ▲
       │                       │                           │
       │                       │                           │
       ▼                       │                           │
┌───────────────┐              │                           │
│ Client SDKs   │◀─────────────┘                           │
└───────────────┘                                          │
                                                           ▼
                                                Stores, supervisors,
                                                external APIs (GitHub)
```

- `@promethean/omni-protocol` defines the contracts in TypeScript + JSON schema.
- `@promethean/omni-core` implements the protocol using existing services.
- Each adapter translates transport-specific requests into protocol calls using shared context builders.

## 6. RequestContext
```ts
interface RequestContext {
  requestId: string;
  subject: {
    id: string;
    displayName?: string;
    rbacRoles: string[];
  } | null;
  rootPath: string;
  headers: Record<string, string | string[]>;
  capabilities: {
    execEnabled: boolean;
    githubEnabled: boolean;
    sinksEnabled: boolean;
  };
  locale?: string;
  audit: {
    source: 'rest' | 'graphql' | 'websocket' | 'mcp' | 'extension';
    userAgent?: string;
    ip?: string;
  };
}
```
- Derived via adapter-specific builders (Fastify request, MCP session, WebSocket handshake).
- Must be immutable once created.
- Passed to every protocol method.

## 7. Method Families
Each family exposes methods returning success envelopes. Selected payloads shown below (full schema definitions accompany TypeScript interfaces).

### 7.1 Files
| Method | Input | Success Payload |
$$
| --- | --- | --- |
$$
| `files.listDirectory` | `{ path: string, depth?: number }` | `{ ok: true, base: string, entries: FileEntry[] }` |
| `files.treeDirectory` | `{ path: string, depth: number }` | `{ ok: true, base: string, tree: FileNode[] }` |
| `files.viewFile` | `{ path: string }` | `{ ok: true, path: string, content: string, sha256: string }` |
| `files.writeContent` | `{ path: string, content: string, mode: WriteMode }` | `{ ok: true, path: string, revision: string }` |
| `files.writeLines` | `{ path: string, operations: LineEdit[] }` | `{ ok: true, path: string, revision: string }` |
| `files.scheduleReindex` | `{ path?: string }` | `{ ok: true, scheduled: boolean }` |

### 7.2 Search
| Method | Input | Success Payload |
$$
| --- | --- | --- |
$$
| `search.grep` | `{ pattern: string, path?: string }` | `{ ok: true, results: GrepHit[] }` |
| `search.semantic` | `{ query: string, limit?: number }` | `{ ok: true, results: SemanticHit[] }` |
| `search.web` | `{ query: string, limit?: number }` | `{ ok: true, results: WebHit[] }` |

### 7.3 Sinks
| Method | Input | Success Payload |
$$
| --- | --- | --- |
$$
| `sinks.list` | `{}` | `{ ok: true, sinks: SinkSummary[] }` |
| `sinks.search` | `{ sinkId: string, query: string }` | `{ ok: true, results: SinkHit[] }` |

### 7.4 Indexer
| Method | Input | Success Payload |
$$
| --- | --- | --- |
$$
| `indexer.status` | `{}` | `{ ok: true, status: IndexerStatus }` |
| `indexer.control` | `{ action: 'pause' | 'resume' | 'reindex', target?: string }` | `{ ok: true, status: IndexerStatus }` |

### 7.5 Agents
| Method | Input | Success Payload |
$$
| --- | --- | --- |
$$
| `agents.list` | `{}` | `{ ok: true, agents: AgentSummary[] }` |
| `agents.start` | `{ preset: string, input: AgentInput }` | `{ ok: true, agent: AgentHandle }` |
| `agents.status` | `{ agentId: string }` | `{ ok: true, status: AgentStatus }` |
| `agents.tail` | `{ agentId: string, limit?: number }` | `{ ok: true, lines: AgentLogLine[] }` |
| `agents.control` | `{ agentId: string, action: 'stop' | 'restart' }` | `{ ok: true, status: AgentStatus }` |
| `agents.streamLogs` | `{ agentId: string }` | Stream events $`{ event: 'agent.log', data: AgentLogEvent }`$. |

### 7.6 Exec
| Method | Input | Success Payload |
$$
| --- | --- | --- |
$$
| `exec.run` | `{ cwd?: string, command: string, timeoutMs?: number }` | `{ ok: true, exitCode: number, stdout: string, stderr: string }` |

### 7.7 GitHub
| Method | Input | Success Payload |
$$
| --- | --- | --- |
$$
| `github.rest` | `{ route: string, method: HttpMethod, params?: Json }` | `{ ok: true, data: unknown, rateLimit: RateInfo }` |
| `github.graphql` | `{ query: string, variables?: Json }` | `{ ok: true, data: unknown, rateLimit: RateInfo }` |
| `github.rateLimit` | `{}` | `{ ok: true, rateLimit: RateInfo }` |

### 7.8 Metadata
| Method | Input | Success Payload |
$$
| --- | --- | --- |
$$
| `metadata.openapi` | `{}` | `{ ok: true, document: OpenAPIV3_1.Document }` |
| `metadata.health` | `{}` | `{ ok: true, status: 'ok', details: HealthCheck[] }` |

## 8. Error Semantics
- All failures return `{ ok: false, error: { code, message, details?, retryable?, docUrl? } }`.
- Codes follow gRPC-inspired taxonomy: `PERMISSION_DENIED`, `NOT_FOUND`, `INVALID_ARGUMENT`, `FAILED_PRECONDITION`, `INTERNAL`, `UNAVAILABLE`.
- Transport adapters map HTTP/WebSocket/MCP error primitives into these envelopes.
- Streaming channels send terminal `{ event: 'stream.end', data: { ok: false, error } }` for fatal errors.

## 9. Streaming Vocabulary
```
type StreamEvent<T extends string, D> = {
  event: T;
  data: D;
  ts: string; // ISO8601 UTC timestamp
  seq: number; // monotonically increasing per stream
};
```

Current events:
- `agent.log` – `{ agentId, level, message, chunk, source }`
- `agent.status` – `{ agentId, status, uptimeMs }`
- `indexer.progress` *(reserved)* – `{ shard, completed, total }`
- `stream.heartbeat` – `{ intervalMs }`
- `stream.end` – `{ ok: boolean, error?: ErrorEnvelope }`

## 10. Security & RBAC
- Protocol implementers must enforce capability guards before executing actions.
- `RequestContext.subject.rbacRoles` evaluated against policy metadata attached to each method (see Section 11).
- File operations respect sandbox root (`rootPath`) and must prevent escaping via path traversal.
- Exec commands obey `capabilities.execEnabled` plus explicit allowlists.
- GitHub access toggled by `capabilities.githubEnabled` and requires stored credentials or PAT injection.

## 11. Metadata & Introspection
Each method includes metadata consumed by adapters:
```ts
interface MethodMetadata {
  method: string;
  summary: string;
  rbac?: string[]; // required roles
  tags?: string[];
  deprecated?: boolean;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
}
```
- `@promethean/omni-protocol` exports metadata objects alongside implementation interfaces.
- REST adapter uses metadata for OpenAPI generation.
- GraphQL adapter uses metadata to generate schema types/fields.
- MCP adapter maps metadata into tool descriptions and safety prompts.

## 12. Transport Mapping Requirements
### 12.1 REST $`@promethean/omni-rest`$
- Mount under `/rest/v1` with compatibility alias for legacy `/v1` routes.
- Use Fastify JSON schemas derived from metadata.
- Expose SSE endpoint `/rest/v1/agents/:id/logs/stream` using stream events.
- Provide OpenAPI document via `metadata.openapi` method.

### 12.2 GraphQL $`@promethean/omni-graphql`$
- Queries for read operations, mutations for writes, subscriptions for streams.
- Authorization resolved per field using RequestContext metadata.
- Schema built dynamically from protocol metadata; versioned via `@promethean/omni-protocol` package.

### 12.3 WebSocket $`@promethean/omni-ws`$
- RPC channel sends `{ id, method, params }` → `{ id, ok, result | error }` using protocol envelopes.
- Streaming channel uses `stream.subscribe` / `stream.unsubscribe` commands returning stream events.
- Connection upgrades reuse Fastify session/auth cookies.

### 12.4 MCP $`@promethean/omni-mcp`$
- Tool catalog built from protocol metadata, exposing file/search/github/etc tools.
- HTTP transport mounts at `/mcp`; stdio transport uses same handlers.
- Uses Omni core for sandbox + GitHub caching; no duplicate logic.

## 13. Compatibility
- Maintain parity with SmartGPT bridge `/v1` responses for existing clients.
- Provide shim for `/v0` routes by forwarding to new handlers with shape translation.
- Document migration guide for GitHub tool usage differences.

## 14. Observability
- Standard logging fields: `{ requestId, method, durationMs, status, errorCode? }`.
- Metrics: counters per method, histograms for latency, gauges for active agents/streams.
- Audit logs for write operations containing subject + action + resource.

## 15. Testing Strategy
- Contract tests verifying protocol implementations across adapters produce identical normalized results.
- Fixture-based tests for file safety (path traversal, diff merging).
- GitHub tool integration tests hitting mock servers/cassettes.
- Streaming tests ensuring ordering + termination semantics.

## 16. Versioning
- Semantic versioning for `@promethean/omni-protocol`.
- Breaking changes require migration notes and adapter/client updates.
- Provide changelog section dedicated to Omni protocol.

## 17. Open Issues
- Decide on SSE vs WebSocket standardization for streaming (default to WS, keep REST SSE fallback).
- Evaluate GraphQL subscription transport $WebSocket vs Server-Sent Events$.
- Finalize caching abstraction for GitHub clients (memory vs Redis).

## 18. Next Steps
1. Review + ratify this draft with SmartGPT and MCP maintainers.
2. Scaffold protocol package with metadata + schema builders.
3. Begin Omni core extraction per roadmap.

---
*Document maintained in `docs/architecture/omni/`. Update via pull request alongside spec changes.*
