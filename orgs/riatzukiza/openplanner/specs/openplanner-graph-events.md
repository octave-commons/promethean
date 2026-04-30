# OpenPlanner Graph Events

## Status
Draft

## Summary
Add graph event kinds (`graph.node`, `graph.edge`) to OpenPlanner's event ingestion pipeline, enabling the storage and search of hyperlink graph data from Myrmex's web crawling.

## Problem statement
OpenPlanner currently ingests generic events and supports FTS/vector search on content. It has no concept of:
- Graph nodes (web pages with URLs, titles, content hashes)
- Graph edges (hyperlinks between pages)
- Graph-scoped search (search only within crawled content)
- Graph traversal queries (find pages linked from X, find pages about Y)

Myrmex needs to store the growing hyperlink graph somewhere persistent and queryable. OpenPlanner is the natural home — it already stores events, generates embeddings, and indexes content.

## Goals
1. Support `graph.node` and `graph.edge` event kinds in OpenPlanner.
2. Store graph nodes with URL, title, content hash, pheromone, visit metadata.
3. Store graph edges with source, target, link text, discovery metadata.
4. Add graph-scoped search filters to FTS and vector search endpoints.
5. Support graph traversal queries via structured event queries.

## Non-goals
- Building a graph database engine in OpenPlanner.
- Replacing DuckDB/MongoDB storage backends.
- Implementing graph algorithms (PageRank, community detection) — those live in Myrmex.

## Event schemas

### graph.node
```json
{
  "kind": "graph.node",
  "timestamp": "2026-04-01T18:00:00Z",
  "data": {
    "url": "https://example.com/article",
    "title": "Article Title",
    "content": "# Article Title\n\nArticle body...",
    "contentHash": "sha256:abc123",
    "metadata": {
      "author": "John Doe",
      "publishedAt": "2026-03-30T00:00:00Z",
      "bypassMethod": "bpc-extension",
      "status": "success",
      "elapsed": 2341
    },
    "discoveredAt": "2026-04-01T17:55:00Z",
    "lastVisitedAt": "2026-04-01T18:00:00Z",
    "visitCount": 3,
    "pheromone": 1.5
  }
}
```

### graph.edge
```json
{
  "kind": "graph.edge",
  "timestamp": "2026-04-01T18:00:00Z",
  "data": {
    "source": "https://example.com/article",
    "target": "https://example.com/related",
    "linkText": "related article",
    "discoveredAt": "2026-04-01T18:00:00Z"
  }
}
```

## Storage

### DuckDB schema
```sql
CREATE TABLE IF NOT EXISTS graph_nodes (
  url TEXT PRIMARY KEY,
  title TEXT,
  content_hash TEXT,
  content TEXT,
  discovered_at TIMESTAMP,
  last_visited_at TIMESTAMP,
  visit_count INTEGER DEFAULT 0,
  pheromone DOUBLE DEFAULT 0.0,
  metadata TEXT  -- JSON blob
);

CREATE TABLE IF NOT EXISTS graph_edges (
  source TEXT,
  target TEXT,
  link_text TEXT,
  discovered_at TIMESTAMP,
  PRIMARY KEY (source, target)
);

CREATE INDEX IF NOT EXISTS idx_graph_nodes_title ON graph_nodes(title);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_discovered ON graph_nodes(discovered_at);
CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON graph_edges(source);
CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON graph_edges(target);
```

### ChromaDB collections
- Existing hot/raw collections continue to store embeddings for all content
- Graph node content is embedded the same way as other content
- Search scope filter `scope=graph` limits results to graph node content

## API changes

### Event ingestion
No changes needed — `POST /v1/events` already accepts arbitrary event kinds. Graph events are ingested like any other event, with additional processing to populate the graph tables.

### Search scoping
Add `scope` parameter to search endpoints:

```
POST /v1/search/fts
{
  "query": "machine learning",
  "scope": "graph"  -- new: limits to graph node content
}

POST /v1/search/vector
{
  "query": "machine learning",
  "scope": "graph"  -- new: limits to graph node embeddings
}
```

### Graph query endpoints (new)
```
GET /v1/graph/stats
→ { nodeCount, edgeCount, avgPheromone, oldestNode, newestNode }

GET /v1/graph/nodes?url=https://example.com/article
→ { url, title, content, metadata, visitCount, pheromone, outgoingEdges }

GET /v1/graph/nodes?url=https://example.com/article&edges=true
→ includes outgoing and incoming edges

GET /v1/graph/edges?source=https://example.com/article
→ [{ source, target, linkText, discoveredAt }]

GET /v1/graph/edges?target=https://example.com/article
→ incoming edges (pages that link to this)

POST /v1/graph/traverse
{
  "from": "https://example.com/article",
  "depth": 2,
  "limit": 50,
  "strategy": "bfs" | "dfs" | "pheromone"
}
→ [{ url, title, distance, pheromone }]
```

## Affected files

### OpenPlanner changes
- `src/routes/v1/graph.ts` — new: graph query routes
- `src/plugins/duckdb.ts` — add graph table creation and event processing
- `src/plugins/mongodb.ts` — add graph collection support (if MongoDB backend)
- `src/lib/event-processors/graph.ts` — new: graph event processor
- `src/routes/v1/search.ts` — add `scope` parameter support
- `src/lib/types.ts` — add graph event types

## Phases

### Phase 1: Event Processing
- Add `graph.node` and `graph.edge` event kind support
- Create DuckDB tables for graph storage
- Implement graph event processor that populates tables from events

### Phase 2: Graph Query API
- Implement `/v1/graph/*` query endpoints
- Add stats, nodes, edges, and traverse endpoints
- Test graph queries against stored data

### Phase 3: Search Scoping
- Add `scope` parameter to FTS and vector search
- Implement graph-scoped search filters
- Test: search returns only graph node content when scoped

## Verification
- `POST /v1/events` with `kind: graph.node` creates a row in `graph_nodes`
- `POST /v1/events` with `kind: graph.edge` creates a row in `graph_edges`
- `GET /v1/graph/stats` returns accurate counts
- `POST /v1/search/fts` with `scope: graph` returns only crawled content
- `POST /v1/graph/traverse` returns reachable nodes within depth limit

## Definition of done
- Graph events are ingested and stored in DuckDB/MongoDB
- Graph query endpoints return accurate data
- Search scoping limits results to graph content
- ChromaDB embeddings exist for all graph node content

## Related specs
- `myrmex-orchestrator.md` — Myrmex orchestrator sends graph events
- `myrmex-graph-epic.md` — parent epic
- `proxx-graph-surface.md` — Proxx proxies graph queries
