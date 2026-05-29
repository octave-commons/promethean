---
uuid: "orgs-octave-commons-promethean-kanban-orgs-octave-commons-promethean-spec-knowledge-graph-rebuild-mutation-md"
title: "Knowledge Graph Rebuild via GraphQL Mutation"
status: incoming
priority: P3
labels: ["specs", "migrated-spec"]
created_at: "2026-05-29T04:01:14.620Z"
source: "orgs/octave-commons/promethean/spec/knowledge-graph-rebuild-mutation.md"
category: "specs"
---

> Source: `orgs/octave-commons/promethean/spec/knowledge-graph-rebuild-mutation.md`
> Migrated-to-kanban: `orgs/octave-commons/promethean/kanban/knowledge-graph-rebuild-mutation.md`

# Knowledge Graph Rebuild via GraphQL Mutation

## Context

- UI rebuild button currently calls `POST /api/rebuild` and fails in dev because Vite (port 4173) has no `/api` proxy; backend GraphQL server lives on port 4000.
- Goal: expose rebuild as a GraphQL mutation and have the SPA call it so the request flows through the existing `/graphql` proxy.

## Code References

- services/knowledge-graph/src/http-server.ts:75-98 — existing REST rebuild handler.
- services/knowledge-graph/src/graphql-server.ts:9-257 — GraphQL schema/resolvers (queries only) running on port 4000.
- services/knowledge-graph/packages/knowledge-graph-ui/src/App.tsx:278-303 — UI rebuild trigger (calls `/api/rebuild`).
- services/knowledge-graph/packages/knowledge-graph-ui/vite.config.ts:62-89 — dev server proxies `/graphql` only (no `/api`), causing rebuild 404s.
- services/knowledge-graph/src/config.ts — config helpers for DB/paths.
- services/knowledge-graph/src/export.ts — `collectGraph` serialization used to emit NDJSON.

## Existing Issues

- Dev rebuild 404 due to missing `/api` proxy; rebuild button reports failure.

## Existing PRs

- Not reviewed in this session.

## Requirements

- Add a GraphQL mutation (e.g., `rebuildGraph`) that triggers the same rebuild workflow as the REST endpoint, returning status/message/node/edge counts and NDJSON path.
- Ensure rebuild writes the streamed NDJSON file used by the SPA and prevents concurrent rebuilds.
- Update the SPA to call the mutation instead of the REST endpoint and reload the graph on success.
- Keep REST endpoint behavior intact (no regressions).

## Definition of Done

- GraphQL schema exposes a rebuild mutation; calling it rebuilds the graph, writes NDJSON, and returns success metadata.
- SPA rebuild button hits the mutation via `/graphql` and reloads the graph without 404s.
- Manual check: mutation returns 200 with success payload; UI reports success and reloads graph; failure surfaces an error message.
- Document any follow-up risks or env assumptions (ports, env vars like KG_REPOSITORY_PATH/KG_GRAPH_NDJSON_PATH).
