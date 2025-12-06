# Knowledge Graph Mermaid Run

- Goal: generate a fresh Mermaid graph for this repository using the @promethean-os/knowledge-graph CLI and capture the output location.

## Code references

- services/knowledge-graph/src/cli.ts:94 (build command entry for repository graph)
- services/knowledge-graph/src/cli.ts:195 (mermaid export command handling)
- services/knowledge-graph/src/visualization/mermaid.ts:4 (allowed Mermaid directions)
- services/knowledge-graph/src/visualization/mermaid.ts:58 (generateMermaid reads nodes/edges and renders)

## Existing issues

- Not reviewed in this session.

## Existing PRs

- Not reviewed in this session.

## Requirements

- Use the package CLI (`pnpm --filter @promethean-os/knowledge-graph run cli`) against the repo root to build the knowledge graph database.
- Export a Mermaid diagram from the generated database; choose a sensible layout direction (e.g., LR) and record the output path.
- Avoid altering unrelated files or configs; keep outputs in workspace root (or explicitly specified path).

## Definition of done

- Knowledge graph build completes successfully for the repo (database written without errors) and a Mermaid diagram is generated.
- Output artifacts and paths are noted for the user (DB and .mmd file).
- No regressions introduced (tests/build unaffected by the graph run).
