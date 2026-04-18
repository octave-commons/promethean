# OpenPlanner + Knoxx Reorganization Spec

Date: 2026-04-02

## Current State

```
services/
├── openplanner/           # TypeScript data lake - WRONG SPOT
└── futuresight-kms/
    └── kms-ingestion/     # Clojure ingestion worker - ORPHANED
```

## Target State

```
orgs/open-hax/
├── openplanner/     # Data lake (infrastructure)
│                   # - API-first personal data lake
│                   # - Documents, events, blobs, search
│                   # - DuckDB/MongoDB/ChromaDB backends
│
├── knoxx/          # Knowledge vault system (product)
│   ├── frontend/   # React UI
│   ├── backend/    # FastAPI
│   └── ingestion/  # Clojure worker
│
├── proxx/          # OpenAI proxy
└── voxx/           # Voice gateway
```

## Rationale

### OpenPlanner as Infrastructure (`orgs/open-hax/openplanner`)

- Foundational data layer - other services can use it independently
- Clean API contract: `/v1/documents`, `/v1/search/fts`, `/v1/events`
- Multi-backend storage (DuckDB, MongoDB, ChromaDB)
- Not specific to Knoxx - could serve any knowledge/conversation system

### Ingestion in Knoxx (`orgs/open-hax/knoxx/ingestion/`)

- Ingestion is Knoxx's primary data input mechanism
- File browser, source management, and job APIs are operator surfaces
- Single repo = single deployment unit for the KMS product
- The worker writes TO OpenPlanner, doesn't need to be separate

### Data Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Knoxx     │────▶│ knoxx/ingestion  │────▶│ OpenPlanner │
│   Frontend  │     │  (Clojure)       │     │ (TypeScript)│
│             │◀────│                  │◀────│             │
│   CMS Page  │     │  /api/query/*    │     │ /v1/docs    │
│   Query     │     │  /api/ingestion/*│     │ /v1/search  │
└─────────────┘     └──────────────────┘     └─────────────┘
```

## Execution Plan

### Phase 1: OpenPlanner Move

1. Create `orgs/open-hax/openplanner` repo from `services/openplanner`
2. Update package name to `@openhax/openplanner`
3. Add as submodule to devel
4. Update any workspace references

### Phase 2: Ingestion Move

1. Move `services/futuresight-kms/kms-ingestion` to `orgs/open-hax/knoxx/ingestion/`
2. Update config to reference OpenPlanner at new location
3. Update Knoxx frontend to point to ingestion API
4. Update Docker Compose / deployment configs

### Phase 3: Cleanup

1. Archive or remove `services/futuresight-kms/` (other components?)
2. Update AGENTS.md with new structure
3. Verify all cross-references work

## Component Inventory

### OpenPlanner (`services/openplanner`)

**Tech**: TypeScript, Fastify, DuckDB, MongoDB, ChromaDB

**Routes**:
- `GET /v1/health`
- `POST /v1/events` - ingest events
- `POST /v1/documents` - upsert documents (used by ingestion worker)
- `GET /v1/documents` - list documents
- `POST /v1/search/fts` - full-text search
- `POST /v1/search/vector` - vector search
- `GET /v1/gardens` - list knowledge gardens
- `GET /v1/sessions` - list sessions
- `POST /v1/jobs/import/*` - import jobs

**Storage**:
- DuckDB (default): events, blobs, FTS
- MongoDB (optional): scalable storage
- ChromaDB: vector embeddings

### kms-ingestion (`services/futuresight-kms/kms-ingestion`)

**Tech**: Clojure, Ring, Reitit, PostgreSQL, Redis

**Routes**:
- `GET /health`
- `GET /api/ingestion/browse` - file browser
- `GET /api/ingestion/file` - file preview
- `GET /api/ingestion/sources` - list sources
- `POST /api/ingestion/sources` - create source
- `GET /api/ingestion/jobs` - list jobs
- `POST /api/ingestion/jobs` - create/start job
- `POST /api/query/search` - federated FTS search
- `POST /api/query/answer` - grounded summary
- `GET /api/query/gardens` - proxy to OpenPlanner

**Worker**:
- Discovers files via drivers (local filesystem)
- Classifies into lakes: docs, code, config, data
- Ingests to OpenPlanner `/v1/documents`
- Tracks state in PostgreSQL

## Environment Variables to Update

After move:

```bash
# In knoxx/ingestion config
OPENPLANNER_URL=http://localhost:7777
OPENPLANNER_API_KEY=xxx

# In knoxx frontend
VITE_INGESTION_API_URL=http://localhost:3002
```

## Rejected Alternatives

### Separate ingestion as `floe` product

Would add a fourth product (`orgs/open-hax/floe`):
- Pro: clear separation of concerns
- Con: deployment complexity (3 repos for one product)
- Con: ingestion only has one consumer (Knoxx)

Decision: Keep ingestion in Knoxx repo.

### Keep OpenPlanner in services/

Would avoid the move:
- Con: inconsistent with product line (proxx, voxx, knoxx are all in orgs/open-hax)
- Con: services/ is for devops/runtime wrappers, not product code

Decision: Move OpenPlanner to orgs/open-hax/.
