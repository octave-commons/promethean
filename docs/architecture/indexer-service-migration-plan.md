# Indexer Service Migration Plan
```
_Last updated: 2025-09-28_
```
## Goal
Extract the SmartGPT Bridge file indexer into a standalone service while keeping existing `/v0` and `/v1` APIs stable for clients.

## Work Streams

### 1. Core Extraction
- [ ] Create `packages/indexer-core` with `tsconfig.json`, `package.json`, build/test scripts.
- [ ] Move the following modules from `packages/smartgpt-bridge/src/`:
  - `indexer.ts` → `packages/indexer-core/src/indexer.ts`
  - `indexerState.ts` → `packages/indexer-core/src/state/level-cache.ts`
  - `remoteEmbedding.ts` → `packages/indexer-core/src/embeddings.ts`
  - Shared helpers (chunking, gather functions, types).
- [ ] Replace hard-coded LevelDB access with a pluggable `StateStore` interface; provide Level cache implementation plus in-memory test double.
- [ ] Export a `createIndexerManager` factory and re-export helper functions (`gatherRepoFiles`, `reindexAll`, `search`, etc.).
- [ ] Port unit tests to the new package use in-memory state store by default; add coverage for queue drains under artificial delays.

### 2. Indexer Service
- [ ] Bootstrap `packages/indexer-service` Fastify + TS that depends on `indexer-core`.
- [ ] Implement REST endpoints:
  - `GET /health` (liveness)
  - `GET /indexer/status`
  - `POST /indexer/reset`
  - `POST /indexer/index`
  - `POST /indexer/remove`
  - `POST /indexer/reindex`
  - `POST /indexer/files/reindex`
  - `POST /search`
- [ ] Provide OpenAPI schema and swagger UI (follow bridge conventions).
- [ ] Support auth hooks (optional) and rate limiting toggles.
- [ ] Add CLI entry point (`reindex` script) wired to the REST client or direct core calls.
- [ ] Ship service-level integration tests using the in-memory state store.

### 3. Bridge Integration
- [ ] Introduce `IndexerClient` in `packages/smartgpt-bridge` that targets the new service via HTTP (configurable base URL, default `http://localhost:4209`).
- [ ] Replace imports of `./indexer` and `./indexerState` with client calls across:
  - `fastifyApp.ts` bootstrap replace `ensureBootstrap` with async fire-and-forget request.
  - `/v0/indexer` routes (forward requests and responses).
  - `/v0/search` and `/v1/search` routes (delegate to client).
  - `actions/files.ts` (`scheduleReindexAction`).
  - CLI scripts `cli-reindex.ts` becomes API client or moves to indexer service.
  - Tests that mock indexer behavior.
- [ ] Remove old modules and update `package.json` dependencies drop `chromadb`, `@promethean/file-indexer`, etc. if now provided by client package.
- [ ] Update bridge unit/integration tests to mock the HTTP client or spin up a fixture indexer service during tests.

### 4. Deployment & Ops
- [ ] Define environment variables for the new service:
  - `INDEX_SERVICE_URL` (used by bridge)
  - `INDEX_ROOT`, `EMBED_*`, `COLLECTION_*`, `LOG_*` (consumed by service)
- [ ] Update docker-compose / deployment scripts to launch both services (shared volume for repository root).
- [ ] Document rollout steps, including order of deployment and rollback strategy.

### 5. Follow-up Hardening
- [ ] Revisit test timeouts after in-memory state store reduces bootstrap time.
- [ ] Add observability hooks (metrics, structured logs) for the new service.
- [ ] Evaluate gRPC or message queue options if HTTP latency becomes an issue.

## Open Questions
- How should authentication between bridge and indexer service be handled (mutual TLS, shared token, shared network)?
- Should semantic search remain synchronous or become async jobs once decoupled?
- Does any other package import `./indexer` today outside of bridge (needs migration)?

## Definition of Done
- `@promethean/smartgpt-bridge` builds/tests without direct indexer code.
- `@promethean/indexer-service` passes its own test suite and exposes the required endpoints.
- End-to-end tests cover bridge + indexer service interaction.
- Documentation updated (ADR, deployment instructions, API references).
