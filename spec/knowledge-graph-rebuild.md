# Knowledge Graph Rebuild

## Context

- User request: "rebuild the knowledge graph" for the Promethean repository.
- Tooling: @promethean-os/knowledge-graph CLI (SQLite-backed builder and Mermaid exporter).

## Code References

- services/knowledge-graph/README.md:37-60 — CLI commands for building graphs and exporting Mermaid/markdown.
- services/knowledge-graph/src/cli.ts:55-161 — CLI entry handling `build` command and DB initialization.
- services/knowledge-graph/src/builder.ts:21-60 — Repository graph build workflow and logging of success/error counts.
- graph.md (repo root) — Existing Mermaid export to refresh.

## Existing Issues

- Not reviewed in this session.

## Existing PRs

- Not reviewed in this session.

## Requirements

- Run the knowledge-graph CLI against the repository to regenerate the SQLite database and outputs.
- Export an updated Mermaid graph (graph.md) reflecting the rebuild.
- Note any warnings or errors encountered during processing.

## Definition of Done

- CLI `build` completes successfully for the repository path (database regenerated/updated).
- Mermaid export regenerated and written to repo root (graph.md) with default or configured options.
- Observed logs/errors summarized for the user; no additional code changes introduced.

## Progress Log

- 2025-12-06: Ran `KG_RELATED_ENABLED=false pnpm --filter @promethean-os/knowledge-graph run cli -- build /home/err/devel/orgs/riatzukiza/promethean` (cwd: services/knowledge-graph); completed with successCount=2720, errorCount=1 (AGENTS.md path traversal validation error).
- 2025-12-06: Exported Mermaid to `/home/err/devel/orgs/riatzukiza/promethean/graph.md` via `KG_RELATED_ENABLED=false pnpm --filter @promethean-os/knowledge-graph run cli -- mermaid /home/err/devel/orgs/riatzukiza/promethean/graph.md LR`; database location `/home/err/devel/orgs/riatzukiza/promethean/services/knowledge-graph/knowledge-graph.db`.
- 2025-12-06: Exported frontend assets via `KG_RELATED_ENABLED=false pnpm --filter @promethean-os/knowledge-graph run cli -- export:ndjson /home/err/devel/orgs/riatzukiza/promethean/services/knowledge-graph/packages/knowledge-graph-ui/public/graph.ndjson`; wrote NDJSON and JSON.
