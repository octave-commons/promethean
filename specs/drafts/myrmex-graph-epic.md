# Myrmex Graph Epic

## Status
Draft

## Summary
Build a traversable knowledge graph by combining GraphWeaver ACO's ant colony optimization with ShuvCrawl's paywall-bypassing content extraction, orchestrated by **Myrmex** (Greek: μύρμηξ, "ant"), with all content flowing into OpenPlanner's data lake through Proxx's unified gateway.

## Narrative
The web is an ocean of locked doors. Paywalls, JS render traps, anti-bot walls — most crawlers bounce off. ShuvCrawl is the mandible that cracks them. GraphWeaver ACO is the pheromone trail that remembers which paths lead to food. Myrmex is the colony that puts them together.

This is the foraging layer of the larger system:
- **Proxx** is the gate — the single entry point for all services
- **OpenPlanner** is the lake — where all knowledge settles and becomes searchable
- **Voxx** is the voice — that speaks what the lake holds
- **MCP servers** are the hands — that act on what the lake knows
- **Myrmex** is the forager — that goes out into the web and brings content back

The colony sends ants into the dark. They follow pheromone trails of novelty, avoiding stale paths. When they find a page, ShuvCrawl cracks it open — paywalls fall, JS renders, clean markdown emerges. The content flows back through Proxx into OpenPlanner, where it's embedded, indexed, and made searchable. The graph grows. The colony remembers.

## Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │                  Proxx                       │
                    │  /api/v1/graph/*  /api/v1/lake/*  /mcp/*   │
                    └──────┬──────────────────────┬───────────────┘
                           │                      │
              graph events │                      │ search queries
                           ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                        OpenPlanner                                │
│  DuckDB: page events, graph nodes/edges, FTS index               │
│  ChromaDB: vector embeddings of all crawled content              │
│  MongoDB (optional): scalable event storage                      │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │ crawl jobs, checkpoint state
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Myrmex                                    │
│  GraphWeaver ACO ──▶ ShuvCrawl Client ──▶ Event Router           │
│  (ants, pheromones)   (paywall bypass)     (to OpenPlanner)      │
│  Frontier manager     Content extraction   Graph persistence     │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │ POST /scrape, POST /map
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                        ShuvCrawl                                  │
│  Patchright browser + BPC extension                              │
│  Paywall bypass, JS rendering, clean markdown extraction         │
└──────────────────────────────────────────────────────────────────┘
```

## Component specs
This epic spans multiple projects. Each has its own spec:

| Component | Spec location | Scope |
|-----------|--------------|-------|
| **Myrmex Orchestrator** | `orgs/octave-commons/graph-weaver-aco/specs/myrmex-orchestrator.md` | The new orchestrator package combining ACO + ShuvCrawl |
| **Proxx Graph Surface** | `orgs/open-hax/proxx/specs/drafts/proxx-graph-surface.md` | `/api/v1/graph/*` proxy and management API in Proxx |
| **OpenPlanner Graph Events** | `services/openplanner/specs/openplanner-graph-events.md` | Graph event kinds, storage, and search scoping |
| **GraphWeaver ACO Backend** | `orgs/octave-commons/graph-weaver-aco/specs/pluggable-fetch-backend.md` | Pluggable fetch backend interface for ACO engine |
| **ShuvCrawl Integration** | (private repo — see Myrmex spec for integration contract) | Standardized config endpoint, trust compose network |

## Goals
1. Myrmex orchestrator combines ACO traversal with ShuvCrawl extraction.
2. All crawled content flows into OpenPlanner through Proxx.
3. Graph state (nodes, edges, pheromones, frontier) persists across restarts.
4. Proxx exposes `/api/v1/graph/*` for graph management and query.
5. Crawled content is searchable via semantic + FTS search through OpenPlanner.
6. Web console has Graph management page with live crawl status.

## Non-goals
- Rewriting ShuvCrawl's browser engine or BPC integration.
- Rewriting GraphWeaver ACO's pheromone algorithm.
- Building a general-purpose web search engine.
- Replacing OpenPlanner's storage backends.

## Phases

### Phase 1: Foundation
- Create Myrmex orchestrator package at `orgs/octave-commons/myrmex/`
- Add pluggable fetch backend to GraphWeaver ACO
- Implement ShuvCrawl client with `POST /scrape` and `POST /map`
- Test: ACO selects URLs, ShuvCrawl extracts content

### Phase 2: Ingestion
- Implement event router sending page events to OpenPlanner via Proxx
- Define graph event schema (`graph.node`, `graph.edge`)
- Add graph event support to OpenPlanner
- Test: crawled content stored and embedded in OpenPlanner

### Phase 3: Persistence
- Implement graph state persistence to OpenPlanner
- Checkpoint frontier state for crash recovery
- Implement graph restore from persisted state
- Test: restart preserves graph state and frontier

### Phase 4: Proxx Surface
- Add `/api/v1/graph/*` routes to Proxx
- Implement graph management endpoints (start/stop/pause/stats)
- Add graph query endpoints (nodes, edges, traverse, frontier)
- Build graph management UI in web console

### Phase 5: Unified Search
- Add graph-scoped search filters to OpenPlanner
- Implement semantic + FTS search across crawled content
- Add graph traversal queries
- Build search UI in web console

### Phase 6: Fleet
- Register remote graph crawlers from host dashboard targets
- Support distributed crawling across hosts
- Implement graph merge across hosts
- Fleet-wide content search

## Deployment

### Compose stack
```yaml
services:
  proxx:
    ports:
      - "8789:8789"
    networks:
      - gateway
    depends_on:
      - openplanner
      - myrmex

  openplanner:
    build: ../../services/openplanner
    networks:
      - gateway
    volumes:
      - openplanner-data:/data

  myrmex:
    build: ../../orgs/octave-commons/myrmex
    networks:
      - gateway
    depends_on:
      - shuvcrawl
    environment:
      - SHUVCRAWL_BASE_URL=http://shuvcrawl:3777
      - PROXX_BASE_URL=http://proxx:8789
      - SEED_URLS=https://example.com

  shuvcrawl:
    build: git@github.com:shuv1337/shuvcrawl.git
    networks:
      - gateway
    volumes:
      - shuvcrawl-data:/data
```

## Verification
- Myrmex selects URLs via ACO, ShuvCrawl extracts content with paywall bypass
- Extracted content appears in OpenPlanner with embeddings and FTS index
- `POST /api/v1/lake/search/vector?q=...` returns relevant crawled content
- `GET /api/v1/graph/stats` returns accurate node/edge counts
- Graph state survives restart (frontier, pheromones, visited URLs)
- Web console shows Graph page with live crawl status and content preview

## Definition of done
- Myrmex package exists and runs as a compose service
- All crawled content is ingested into OpenPlanner through Proxx
- `/api/v1/graph/*` provides full graph management and query surface
- Content from crawled pages is searchable via semantic and FTS search
- Graph state persists across restarts
- Web console has Graph management UI
- Compose stack deploys Proxx + OpenPlanner + Myrmex + ShuvCrawl together

## Risks
- ShuvCrawl browser pool memory usage on resource-constrained hosts
- Paywall bypass reliability varies by site
- Graph size growth unbounded without pruning policy
- ShuvCrawl is a private repo — dependency management
- Rate limiting and politeness when crawling at scale

## Related specs
- `proxx-mcp-gateway.md` — MCP server gateway integration
- `proxx-openplanner-integration.md` — OpenPlanner data lake integration
- `proxx-voxx-integration.md` — Voxx voice service integration
