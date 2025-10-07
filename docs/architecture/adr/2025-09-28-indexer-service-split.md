---
project: Promethean
status: proposed
$$
date: 2025-09-28
$$
tags:
  - adr
  - architecture
  - decision
  - search
  - indexing
---

# ADR-2025-09-28: Extract SmartGPT File Indexer Into Dedicated Service

## Context
The SmartGPT Bridge package currently embeds the semantic file indexer directly inside its Fastify app. The `indexerManager` controls bootstrap, incremental updates, queue draining, and Chroma persistence from within the bridge process. Bridge HTTP routes, CLI scripts, and bots all import `./indexer.ts` and `./indexerState.ts` directly. This tight coupling creates several problems:

- **Operational coupling** – the bridge cannot scale independently of the indexer workload or isolate crashes caused by large repositories.
- **Test fragility** – integration tests hang when LevelDB writes or bootstrap drains exceed the hard-coded timeout, because the indexer runs inside the same process (see `docs/reports/2025-09-28-test-hang-smartgpt-bridge.md`).
- **Deployment inflexibility** – consumers that only need semantic search must deploy the entire bridge stack (agents, sinks, exec features) even when those features are disabled.
- **Responsibility drift** – the bridge now owns queue management, persistence, and embeddings that would be better isolated behind a smaller surface.

## Decision
We will split the file indexer into its own service and supporting package:

1. **Create `@promethean/indexer-core`** (new package) that owns the pure TypeScript logic currently in `packages/smartgpt-bridge/src/indexer.ts`, `indexerState.ts`, and related helpers (`remoteEmbedding.ts`, chunking utilities). The module will expose:
   - `createIndexerManager(options)` returning an isolated manager instance.
   - File system helpers (`gatherRepoFiles`, `indexFile`, `reindexAll`, `search`).
   - Persistence abstraction with a pluggable state store interface $default Level Cache, in-memory stub for tests$.
2. **Add `@promethean/indexer-service`** $Fastify app under `packages/indexer-service`$ that:
   - Uses `indexer-core` to bootstrap a singleton manager.
   - Exposes REST endpoints mirroring today’s bridge surface $`/indexer/status`, `/indexer/reset`, `/indexer/index`, `/indexer/remove`, `/indexer/reindex`, `/indexer/files/reindex`, `/search`$.
   - Provides health/liveness probes and OpenAPI docs.
   - Accepts configuration via environment variables: `INDEX_ROOT`, `EMBED_*`, `COLLECTION_*`, `LOG_*`, etc.
   - Ships its own CLI $`pnpm --filter @promethean/indexer-service run reindex`$ for one-off rebuilds.
3. **Update `@promethean/smartgpt-bridge`** to become an API client of the indexer service:
   - Replace direct imports of `./indexer` with a thin `IndexerClient` that performs HTTP requests to the new service (configurable base URL).
   - Keep existing `/v0/*` and `/v1/*` endpoints stable by delegating to the client.
   - Adjust server bootstrap: instead of calling `indexerManager.ensureBootstrap`, issue a POST `/indexer/reset?bootstrap=true` $non-blocking$ when the bridge starts.
   - Remove `indexer`, `indexerState`, and related build artefacts from the bridge package.
4. **Shared typing & auth** – define DTO types in `indexer-core` $or a sibling `indexer-contracts` module$ so the service and bridge agree on payload shapes without duplicating schemas.

## Consequences
- **Benefits**
  - Clear service boundary: indexer scaling, deployments, and monitoring become independent of SmartGPT Bridge.
  - Easier to harden: LevelDB cache, embedding retries, and queue drain issues can be addressed without affecting bridge uptime.
  - Simplified bridge package: focus on agent orchestration, RBAC, and HTTP orchestration.
  - Enables alternative consumers (e.g., Promethean CLI or automation runners) to use semantic search without running the full bridge.
- **Costs / Risks**
  - Additional deployment artifact and runtime dependency; bridge instances must know the indexer base URL and handle network failures.
  - Requires RPC refactors and new clients; existing bridge tests must be rewritten to mock HTTP instead of local modules.
  - Potential latency increase for index/search calls due to HTTP hop.
  - Need to secure the new service (auth, rate limit) or ensure it is only reachable on trusted networks.

## Alternatives Considered
- **Keep indexer embedded** – rejected because it preserves today’s coupling and does not address operational pain.
- **Extract into a shared library only** – rejected: while a library split would improve modularity, it would not isolate runtime concerns or allow independent scaling.

## Status
- Proposed by: Codex $GPT-5 agent$
- Reviewed by: _TBD_
- Supersedes: none
- Superseded by: _TBD_
