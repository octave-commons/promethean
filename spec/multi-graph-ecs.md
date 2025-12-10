# Multi-Graph ECS Setup

## Context

- ECS utilities live in `packages/ds/src/ecs.ts` (archetype, double-buffered world; change tracking via `changed*` sets around lines 4-465).
- Knowledge-graph ECS is now separated into `services/knowledge-graph/packages/knowledge-graph-simulation/src/agent-entities.ts` (single-graph store using the DS ECS; ingestion/upsert/delta paths around lines 73-399).
- Graph domain types come from `services/knowledge-graph/packages/knowledge-graph-domain/src/graph.ts` (node/edge shape and enums around lines 1-130).

## Existing Issues / PRs

- None found related to multi-graph ECS.

## Requirements

- Support multiple graph instances (distinct graph IDs and graph types) within one ECS world.
- Allow nodes/edges of different types and relationship kinds per graph without collisions.
- Provide per-graph snapshots and deltas (frame-based) while retaining the single-graph API for backward compatibility.
- Preserve layout/view metadata and tolerate cross-graph edges (endpoints may live in other graphs).

## Definition of Done

- New ECS layer can ingest multiple graphs and maintain per-graph membership metadata alongside node/edge components.
- Consumers can fetch full graphs or deltas scoped to a graph ID; removed entities are tracked per graph.
- Node/edge type flexibility (custom relationship names) is supported without breaking existing callers.
- Tests cover multi-graph ingestion, cross-graph edges, and delta behavior; existing single-graph behavior remains intact.
- Usage documented at the simulation package entrypoint.

## Plan

1. **Type layer**: extend graph domain types with optional graph identifiers/context and relaxed node/edge type unions; add a helper type for graph projections.
2. **ECS store**: enhance `AgentEntityStore` (or a new multi-graph variant) to tag entities with graph ID/type, use composite keys to avoid collisions, handle cross-graph edge endpoints, and expose per-graph snapshot/delta helpers while keeping current methods working for the default graph.
3. **Interop & exports**: surface the new multi-graph ECS API from `knowledge-graph-simulation` and keep backwards compatibility for existing imports.
4. **Tests**: add vitest coverage for multi-graph ingestion, cross-graph edge endpoints, per-graph delta/removal tracking, and backward-compatible single-graph flows.
5. **Docs**: document the multi-graph ECS usage and graph-scoping expectations in the simulation package README or inline docstring.
