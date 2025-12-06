# Docs CLI ↔ Knowledge Graph Integration Plan

## Context

- Goal: provide a text-only Markdown/JSON view of the knowledge graph through `@promethean-os/docs-cli`, leveraging the existing `@promethean-os/knowledge-graph` database.
- Implement an export in the knowledge-graph CLI/package and consume it via a new docs-cli subcommand.

## Code & Doc References

- services/knowledge-graph/src/cli.ts:79-230 — current CLI commands (build, file, node/edge CRUD, mermaid) and argument parsing.
- services/knowledge-graph/src/database/repository.ts:10-216 — GraphRepository CRUD and query helpers (findNodes/findEdges/getConnectedNodes).
- services/knowledge-graph/src/visualization/mermaid.ts:2-65 — mermaid generation from repository.
- services/knowledge-graph/docs/knowledge-graph-usage.md:15-34 — documented CLI commands and workflow.
- cli/docs/src/cli.ts:69-950 — docs CLI commands (search/view/tasks), parsing, and output formatting helpers.
- cli/docs/README.md:1-68 — docs CLI usage and install instructions.
- services/knowledge-graph/package.json:1-83 — package exports and scripts (CLI at `tsx src/cli.ts`).
- cli/docs/package.json:1-31 — docs CLI scripts and dependency list (needs KG dependency for graph view).

## Requirements

- Add a knowledge-graph export that emits nodes/edges as Markdown tables or JSON (text-only), optionally to stdout or file.
- Expose export logic via the knowledge-graph package so other tools (docs-cli) can consume it programmatically.
- Add a docs-cli `graph` subcommand that reads `knowledge-graph.db` (default cwd, override flag) and prints the export in Markdown or JSON.
- Update documentation to show the new commands and workflow between the two CLIs.
- Add tests covering the new export command (knowledge-graph) and docs-cli graph subcommand output/flags.

## Definition of Done

- Knowledge-graph CLI supports a graph export command producing Markdown (default) or JSON and documented in README/usage docs.
- Export helpers are available from the knowledge-graph package (root or subpath) for reuse.
- Docs CLI includes a `graph` subcommand that reads a KG DB path, outputs Markdown/JSON, and is covered by unit tests.
- README updates for docs-cli and knowledge-graph mention the new text-only graph view and example invocations.
