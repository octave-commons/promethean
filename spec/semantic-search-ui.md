# Semantic Search UI via ANN

## Context

- Request: "use the ANN to do a semantic search on the UI to limit the graph query".
- Existing graph UI streams `graph.ndjson` and filters client-side (`packages/knowledge-graph-ui/src/App.tsx`).
- Graph data/back-end: `services/knowledge-graph/src/graphql-server.ts` exposes graph/node queries; `src/ann/related-embeddings.ts` builds related edges via embeddings.

## Code References

- services/knowledge-graph/src/ann/related-embeddings.ts — embedding builder and related edge creation.
- services/knowledge-graph/src/graphql-server.ts — GraphQL API; place to add semantic search endpoint.
- services/knowledge-graph/src/builder.ts — link/import processing (for context of node shapes).
- services/knowledge-graph/packages/knowledge-graph-ui/src/App.tsx — UI filters/graph rendering; currently fetches `/graph.ndjson`.
- services/knowledge-graph/packages/knowledge-graph-ui/src/types.ts — graph types used by UI.

## Existing Issues

- Not reviewed in this pass.

## Existing PRs

- Not reviewed in this pass.

## Requirements

- Add backend semantic search that uses ANN embeddings (existing `related-embeddings`) to score file/documentation nodes for a text query.
- Expose an API (GraphQL or REST) returning scored hits; avoid failing on missing/invalid paths.
- Update UI to call the semantic search API and limit the displayed graph to results (optionally including neighbors) with user controls and feedback.
- Keep existing NDJSON load path working; fall back gracefully on errors.

## Definition of Done

- Semantic search endpoint available and returns scored node hits for a query (top N, deterministic ordering).
- UI has a semantic search input/action that limits rendered graph to the returned hits (with option to include neighbors) and shows loading/error state.
- ANN embeddings are reused (cache) and do not crash on invalid links.
- Rebuild/export still works; relevant tests updated/run.
