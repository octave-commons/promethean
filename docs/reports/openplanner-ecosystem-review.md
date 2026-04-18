# OpenPlanner Ecosystem Review

Date: 2026-04-10
Status: Comprehensive architectural and roadmap synthesis
Scope: `openplanner/**/specs`, `packages/` source code, and cross-package integrations

---

## Executive Summary

The OpenPlanner ecosystem is a sophisticated graph-centric knowledge management platform with a well-documented roadmap spanning 8 phases (P0–P7). The system is designed around three core principles:

1. **Canonical graph truth** — OpenPlanner is the authoritative storage layer for embeddings, semantic edges, and graph structure
2. **Layered architecture** — Local (repo scan), Web (crawler), and User (overlay) layers merge at runtime
3. **Production vector search** — Moving toward MongoDB Atlas native `$vectorSearch` to eliminate GPU/NPU dependencies

**Current Status:** The backend migration (P0) is complete. The ecosystem is now focused on:
- **P1A:** Tenant foundation and runtime enforcement (21 pts)
- **P1B:** Graph-memory runtime coherence (35 pts)
- **P1C:** Translation review for client demo (15 pts, 9-day deadline)

---

## Architecture Overview

### Package Structure

```
orgs/open-hax/openplanner/
├── src/                          # Core API server (Fastify, TypeScript)
│   ├── routes/v1/
│   │   ├── graph.ts              # 1923 lines — traversal, edges, layout, search
│   │   ├── events.ts             # Event ingestion
│   │   ├── documents.ts          # Document CRUD
│   │   ├── sessions.ts           # Session management
│   │   └── translations.ts       # Translation review routes
│   └── lib/
│       ├── mongo-vectors.ts      # 1032 lines — vector search + vexx integration
│       ├── mongodb.ts            # MongoDB collections
│       ├── embeddings.ts         # Embedding generation
│       ├── semantic-compaction.ts # Dual-tier memory compaction
│       └── indexing.ts           # Document indexing pipeline
│
├── packages/
│   ├── knoxx/                    # Knowledge mining + RAG platform
│   │   ├── backend/              # CLJS backend + policy-db (50k+ lines)
│   │   ├── frontend/             # Review UI, workbench
│   │   └── specs/                # 68 specs — most comprehensive roadmap
│   │
│   ├── graph-weaver/             # GraphQL server for graph queries
│   │   └── src/
│   │       ├── openplanner-graph.ts  # Sync from OpenPlanner
│   │       ├── mongo-graph-store.ts  # MongoDB graph persistence
│   │       └── layout.ts             # Force-directed layout
│   │
│   ├── graph-weaver-aco/         # Ant Colony Optimization clustering
│   │
│   ├── semantic-graph-builder/   # Offline semantic graph construction
│   │   └── src/
│   │       ├── cli.ts            # Full pipeline: export → build-index → cluster
│   │       ├── export.ts         # Embedding slabs from MongoDB
│   │       ├── build-index.ts    # HNSW index construction
│   │       ├── query-neighbors.ts # ANN + exact rerank
│   │       ├── persist-edges.ts  # Symmetrized sparse graph
│   │       └── cluster.ts        # Leiden community detection
│   │
│   ├── vexx/                     # NPU-accelerated cosine similarity (Clojure)
│   │   ├── src/vexx/
│   │   │   ├── api/routes.clj    # HTTP API: /v1/cosine/matrix, /v1/cosine/topk
│   │   │   └── native.clj        # ONNX Runtime integration
│   │   └── native/src/           # C++ NPU runtime
│   │
│   ├── myrmex/                   # Web crawler + graph event producer
│   │
│   ├── eros-eris-field/          # Force-directed layout engine
│   ├── eros-eris-field-app/      # Layout worker (connects to graph-weaver)
│   │
│   ├── graph-runtime/            # Runtime specs and documentation
│   │
│   ├── cephalon/                 # Research/precursor agent runtime (TS/CLJS/CLJ)
│   │
│   └── [20+ other packages]      # MCP, persistence, clients, etc.
│
└── specs/                        # Cross-cutting specifications
    ├── README.md                 # Spec registry and inventory
    ├── inventory.md              # Consolidated spec inventory
    ├── monorepo-roadmap.md       # Master roadmap
    ├── 2026-03-27-dual-tier-semantic-memory.md
    ├── 2026-04-07-semantic-graph-builder-and-vexx-boundary-reduction.md
    ├── 2026-04-09-atlas-local-deployment-for-production-vector-search.md
    └── openplanner-graph-events.md
```

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Myrmex        │────▶│   Graph-Weaver   │────▶│  OpenPlanner    │
│  (web crawler)  │     │  (GraphQL API)   │     │  (storage API)  │
│  graph.events   │     │  graph queries   │     │  MongoDB/Atlas  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                         │
                               ▼                         ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │ Eros-Eris-Field  │     │ Vector Search   │
                        │ (layout worker)  │────▶│ vexx / Atlas    │
                        │ force simulation │     │ $vectorSearch   │
                        └──────────────────┘     └─────────────────┘
```

---

## Spec Inventory Summary

### Top-Level Specs (7 specs)

| Spec | Status | Priority | Focus |
|------|--------|----------|-------|
| `2026-03-27-dual-tier-semantic-memory.md` | active | P2 | Hot/raw + compacted semantic stores |
| `2026-04-05-mongodb-only-reversible-migration.md` | landed | P0 | DuckDB → MongoDB migration |
| `2026-04-07-graph-stack-monorepo-cutover-pr-stack.md` | active | P0 | PR stack coordination |
| `2026-04-07-semantic-graph-builder-and-vexx-boundary-reduction.md` | active | P6 | 100k-500k node clustering |
| `2026-04-09-atlas-local-deployment-for-production-vector-search.md` | implemented | P6 | Native `$vectorSearch` |
| `openplanner-graph-events.md` | active | P2 | `graph.node`, `graph.edge` event kinds |
| `openplanner-web-edge-salience-and-backbone-projections.md` | active | P7 | Web frontier scaling |

### Knoxx Package Specs (68 specs)

The most comprehensive spec corpus, organized by program phase:

**P0 — Landed Baseline:**
- `knowledge-ops-clojure-backend-migration.md` (landed)
- `knowledge-ops-kms-query.md` (landed)

**P1A — Tenant Foundation (21 pts):**
- `knowledge-ops-multi-tenant-control-plane.md` (next epic)
- `knowledge-ops-mvp-phase1-epics.md` (next epic)

**P1B — Graph-Memory Coherence (35 pts):**
- `knowledge-ops-graph-memory-reconciliation.md` (epic)
- `knowledge-ops-graph-memory-roadmap.md` (detailed roadmap)
- 10 child specs covering runtime unblockers, canonical graph proof, workbench truth

**P1C — Translation Review (15 pts, 9-day deadline):**
- `knowledge-ops-translation-review-epic.md` (epic)
- `knowledge-ops-translation-routes.md` (5 pts)
- `knowledge-ops-translation-export.md` (2 pts)
- `knowledge-ops-translation-review-ui.md` (5 pts)
- `knowledge-ops-translation-mt-pipeline.md` (3 pts, deferrable)

**P2–P7:** Retrieval/lake convergence, CMS boundary, PII/audit, workbench UI, deployment portability, advanced graph intelligence

### Other Package Specs

- **graph-weaver/specs:** 3 specs (layers, query, service surface)
- **graph-weaver-aco/specs:** 6 specs (ACO engine, crawling, fetch backend)
- **myrmex/specs:** 2 specs (decomposition, runtime surfaces)
- **graph-runtime/specs:** 2 specs (decomposition, runtime surfaces)
- **cephalon/specs:** Research corpus (not on active roadmap)

---

## Key Technical Designs

### 1. Semantic Graph Builder (P6)

**Problem:** Current HTTP+JSON cosine matrix scoring ships full embedding tensors over HTTP, bottlenecking at 100k+ nodes.

**Solution:** Offline canonical graph builder that:
1. Exports normalized embeddings from MongoDB to contiguous float32 slabs
2. Builds local HNSW index for approximate neighbor generation
3. Exact-reranks candidates using local dot-product or vexx slab-based protocol
4. Symmetrizes into sparse weighted k-NN graph
5. Runs Leiden clustering for community detection
6. Persists `graph_semantic_edges`, `graph_cluster_memberships`, `semantic_graph_runs`

**Performance gains:**
- Avoids `O(n²)` all-pairs exact scoring
- No bulk JSON tensor transport
- Candidate factor 5-10x reduction in comparisons
- At 100k nodes: 1563x reduction in dot-product terms
- At 200k nodes: 3125x reduction

**Implementation status:** Package scaffolded with full CLI:
- `export`, `build-index`, `query-neighbors`, `persist-edges`, `cluster`, `run`, `update-delta`

### 2. Dual-Tier Semantic Memory

**Problem:** Short Discord-style messages produce noisy retrieval in a single vector collection.

**Solution:** Separate stores:
- **Hot/raw collection:** Fast ingest, message-level recall
- **Compact collection:** Synthesized semantic packs from related memories

**Phase 1 implementation:**
- Dual Chroma collection support
- Semantic compaction job
- Dual-tier vector search with result merging
- Health output exposure

**Phase 2 (planned):**
- Hybrid FTS + vector search in `packages/cephalon-ts`
- Auto-triggered compaction
- Model tuning (nomic-embed-text for hot, Qwen for compact)

### 3. Atlas Local for Production Vector Search

**Problem:** MongoDB Community Search containers lack `createSearchIndexes` and `$listSearchIndexes` commands. Production deployments without GPU/NPU cannot use vexx fallback.

**Solution:** Replace Community containers with `mongodb/mongodb-atlas-local` image for production:
- Full vector search index management
- Native `$vectorSearch` with real index backing
- No separate mongot container orchestration

**Status:** Implemented with Docker Compose overlay at `services/openplanner/docker-compose.atlas.yml`

### 4. Graph Events Schema

**New event kinds for web crawling:**

```json
// graph.node
{
  "kind": "graph.node",
  "data": {
    "url": "https://example.com/article",
    "title": "Article Title",
    "contentHash": "sha256:abc123",
    "pheromone": 1.5,
    "visitCount": 3
  }
}

// graph.edge
{
  "kind": "graph.edge",
  "data": {
    "source": "https://example.com/article",
    "target": "https://example.com/related",
    "linkText": "related article"
  }
}
```

**Storage:** DuckDB tables (`graph_nodes`, `graph_edges`) + ChromaDB embeddings for graph node content

**API additions:**
- `GET /v1/graph/stats`
- `GET /v1/graph/nodes?url=...`
- `GET /v1/graph/edges?source=...`
- `POST /v1/graph/traverse` with BFS/DFS/pheromone strategies
- `scope=graph` parameter for FTS/vector search

### 5. Multi-Tenant Control Plane (P1A)

**Core principle:** "Every request resolves a tenant. Every object belongs to a tenant. No data crosses boundaries."

**Architecture:**
```
┌───────────────────────────────┐
│         CONTROL PLANE         │
│  Tenant Catalog               │
│  Tenant Policy Store          │
│  Model Profile Registry       │
└──────────────┬────────────────┘
               │ resolves tenant + policy
               ▼
┌──────────────────────────────┐
│    TENANT GATEWAY / API      │
│ auth, tenant resolve, RBAC,  │
│ rate limits, audit logging   │
└──────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│        DATA PLANE            │
│ Doc | Vector | Graph | Logs  │
│ scoped per tenant            │
└──────────────────────────────┘
```

**Isolation ladder:**
1. **Shared:** Tenant namespace/schema, strict API filtering
2. **Isolated data:** Separate DB/index/account per tenant
3. **Dedicated stamp:** Separate deployment + data plane

**Failure mode:** Requests without valid tenant context **fail closed** — no fallback, no default tenant, no anonymous access.

---

## Roadmap Execution Order

### Master Sequence

```
P0 (landed) → P1A (tenant) → P1B (graph-memory) → P1C (translation) →
P2 (retrieval) → P3 (CMS) → P4 (PII/audit) → P5 (workbench) →
P6 (deployment) → P7 (advanced graph)
```

### Current Focus (Next 9 Days)

**P1C Translation Review** is the client demo priority:

| Spec | Points | Dependencies |
|------|--------|--------------|
| Translation routes | 5 | MongoDB migration (done) |
| Translation export | 2 | Translation routes |
| Translation review UI | 5 | Translation routes |
| MT pipeline | 3 | Translation routes (deferrable) |

**Total: 12 pts critical path → ~5 focused days**

### Graph-Memory Roadmap (P1B)

**Milestone sequence:**

| Milestone | Points | Exit Signal |
|-----------|--------|-------------|
| M0: Runtime unblockers | 8 | KMS ingest fixed, health stable, Myrmex writing |
| M1: Canonical graph proof | 5 | OpenPlanner graph endpoints show real data |
| M2: Workbench truth | 5 | Graph-Weaver matches OpenPlanner or signals degraded |
| M3: E2E guardrail | 3 | Producer → lake → workbench → Knoxx smoke path |
| M4: Contract freeze | 5 | `graph_query` v1 documented, README/spec drift resolved |
| M5–M7: Derived views, adaptive seam, telemetry | 9 | Later work |

**Total: 35 pts**

---

## Implementation Status

### Fully Implemented

1. **MongoDB migration** — DuckDB → MongoDB for events, documents, vectors
2. **Semantic graph builder package** — Full CLI with all commands
3. **Atlas local deployment** — Docker Compose overlay for production vector search
4. **Graph routes** — 1923 lines covering traversal, edges, layout, semantic search
5. **Vector search with vexx fallback** — 1032 lines with cosine similarity, HNSW support

### Partially Implemented

1. **Knoxx graph query contract** — API exists, needs documentation against real behavior
2. **Graph-Weaver live sync** — Syncs from OpenPlanner but needs coherence validation
3. **Dual-tier semantic memory** — Collection support exists, compaction job needs completion
4. **Translation review UI** — Backend routes ready, frontend needs wiring

### Not Started (Current Priority)

1. **Multi-tenant control plane** — Design complete, implementation pending
2. **Policy-backed tool authorization** — Design complete, implementation pending
3. **PII handling protocol** — Design complete, implementation pending

---

## Deployment Structure

### Local Development

```bash
cd /home/err/devel/services/openplanner
docker compose up --build -d
```

**Services:**
- `mongodb` (Community Search with mongot sidecar)
- `openplanner` on `http://127.0.0.1:7777`
- `graph-weaver` on `http://127.0.0.1:8796` (with `--profile graph`)
- `myrmex`, `eros-eris-field-app` (with `--profile graph`)
- `vexx` on `http://host.docker.internal:8787` (host-run for NPU access)

### Production Vector Search

```bash
docker compose -f docker-compose.yml -f docker-compose.atlas.yml up --build -d
```

**Differences:**
- `mongodb/mongodb-atlas-local` replaces Community containers
- Full `createSearchIndexes` / `$listSearchIndexes` support
- Native `$vectorSearch` with real index backing

### Runtime Data

All mutable state lives under `services/openplanner/openplanner-lake/`:
- `cache/` — Ollama embedding cache
- `chroma/` — Vector collections
- `duckdb/` — Legacy DuckDB files (migration complete)
- `graph-weaver/` — Graph-weaver runtime state
- `jobs/` — Semantic graph builder artifacts

---

## Recommendations

### Immediate Actions (P1C Demo)

1. **Wire translation review UI** — Connect Knoxx frontend to OpenPlanner routes
2. **Seed devel docs corpus** — Load en → es, en → de translation segments
3. **Test review workflow** — End-to-end pending → approved flow
4. **Demonstrate SFT export** — Downloadable JSONL with manifest

### Short-Term (P1A + P1B)

1. **Implement tenant gateway** — Request-scoped identity, fail-closed enforcement
2. **Fix KMS ingest arity** — Restore `kms-ingestion` writes to OpenPlanner
3. **Validate graph coherence** — Prove producer → OpenPlanner → Graph-Weaver path
4. **Document graph contract** — Freeze v1 semantics against real behavior

### Medium-Term (P2–P5)

1. **Role-scoped lakes** — Make lake boundaries runtime-enforced, not conceptual presets
2. **CMS lifecycle states** — Document lifecycle, review boundary as product surface
3. **PII classification** — Build enforceable sensitive-content handling
4. **Workbench context bar** — UI reflects actual enforcement boundaries

### Long-Term (P6–P7)

1. **Atlas local migration** — Move production to native `$vectorSearch`
2. **Provider abstraction** — Self-hosted, AWS, Azure deployment options
3. **Derived edge projections** — Canonical views without mutating raw receipts
4. **Adaptive expansion policy** — Telemetry-driven traversal optimization

---

## Spec Gaps and Orphans

### Not Integrated into Main Roadmap

1. **packages/cephalon/specs/** — All specs are orphaned from active roadmaps (research corpus)
2. **packages/graph-runtime/specs/** — Not integrated into `knowledge-ops-full-roadmap`
3. **packages/myrmex/specs/** — Partially integrated via P1B recovery specs

### Recommendations

1. **Integrate graph-runtime/myrmex specs** into knowledge-ops-full-roadmap as P2 sub-components
2. **Create graph-weaver roadmap** with execution ordering
3. **Archive cephalon specs** to `packages/cephalon/specs/archive/` marked as research corpus

---

## Cross-Package Dependencies

### Critical Path

```
myrmex → (graph events) → OpenPlanner → (graph export) → graph-weaver → (layout) → eros-eris-field-app
                                        ↓
                                   (vector search)
                                        ↓
                               vexx / Atlas $vectorSearch
                                        ↓
                                    knoxx backend
                                        ↓
                                   knoxx frontend
```

### Data Ownership

| Data Type | Owner | Consumers |
|-----------|-------|-----------|
| Events, documents | OpenPlanner | All packages |
| Graph nodes/edges | OpenPlanner | graph-weaver, knoxx |
| Vector embeddings | OpenPlanner | vexx, semantic-graph-builder, knoxx |
| Layout positions | OpenPlanner | graph-weaver, eros-eris-field-app |
| Policy/tenants | Knoxx Postgres | Knoxx backend, OpenPlanner (org scope) |
| Translation segments | OpenPlanner | Knoxx frontend, Shibboleth pipeline |

---

## Definition of Done

Treat the current OpenPlanner era as having crossed the main threshold when:

- [ ] P1A: Request-scoped tenancy and policy enforcement are real
- [ ] P1B: Graph-memory runtime coherence is real
- [ ] P1C: Translation review is demo-ready
- [ ] P2: Scoped retrieval and lake semantics are real
- [ ] P3: CMS/review/public boundaries are real
- [ ] P4: PII and audit guarantees are enforceable
- [ ] P6: Production vector search works without GPU/NPU

At that point, UI polish, portability, and graph intelligence become compounding improvements.

---

## Files Referenced

### Specs
- `orgs/open-hax/openplanner/specs/README.md`
- `orgs/open-hax/openplanner/specs/inventory.md`
- `orgs/open-hax/openplanner/specs/monorepo-roadmap.md`
- `orgs/open-hax/openplanner/specs/2026-03-27-dual-tier-semantic-memory.md`
- `orgs/open-hax/openplanner/specs/2026-04-07-semantic-graph-builder-and-vexx-boundary-reduction.md`
- `orgs/open-hax/openplanner/specs/2026-04-09-atlas-local-deployment-for-production-vector-search.md`
- `orgs/open-hax/openplanner/specs/openplanner-graph-events.md`
- `orgs/open-hax/openplanner/packages/knoxx/specs/knowledge-ops-full-roadmap.md`
- `orgs/open-hax/openplanner/packages/knoxx/specs/knowledge-ops-graph-memory-roadmap.md`
- `orgs/open-hax/openplanner/packages/knoxx/specs/knowledge-ops-multi-tenant-control-plane.md`
- `orgs/open-hax/openplanner/packages/knoxx/specs/knowledge-ops-translation-review-epic.md`
- `orgs/open-hax/openplanner/packages/graph-weaver/specs/graph-layers-and-storage.md`

### Source Code
- `orgs/open-hax/openplanner/src/routes/v1/graph.ts` (1923 lines)
- `orgs/open-hax/openplanner/src/lib/mongo-vectors.ts` (1032 lines)
- `orgs/open-hax/openplanner/packages/semantic-graph-builder/src/cli.ts`
- `orgs/open-hax/openplanner/README.md`
- `services/openplanner/README.md`

---

## Conclusion

The OpenPlanner ecosystem has a mature architectural foundation with:
- Clear separation of concerns (storage, query, layout, acceleration)
- Well-documented roadmap with executable specs capped at 5 points
- Concrete plans for production vector search without GPU/NPU dependency
- Dual-tier memory design for better retrieval quality
- Multi-tenant control plane design for enterprise readiness

The immediate priority is the P1C translation review demo (9-day deadline), followed by P1A tenant enforcement and P1B graph-memory coherence. The ecosystem is well-positioned to deliver on these commitments with the existing implementation base and clear spec guidance.
