# Knowledge Graph Documentation Survey

## Prompt

"look for documentation relating to knowledge graphs"

## Code & Doc References

- services/knowledge-graph/README.md:2-34 — package overview, install, commands (dev/build/test/lint/typecheck/db:migrate/db:seed/cli).
- services/knowledge-graph/src/cli.ts:1-64 — Bun-based CLI wiring for building repo or single-file knowledge graphs; creates `knowledge-graph.db`, migrates schema, and runs `build`/`file` commands.
- services/knowledge-graph/test-docs/README.md:1-25 — test fixture README describing Markdown/TypeScript/dependency extraction and SQLite-backed graph storage example.
- docs/agile/tasks/migrate kanban label frontmatter field to tags for better compatability with obsdian.md:2-39 — task to switch Kanban task frontmatter from `label` to `tags` for Obsidian knowledge graph visibility (uuid:363f1d14-a864-11f0-a5c2-7fa31ed98b3f).
- docs/hacks/notes/promethean-copilot-intent-engine.md:11-23 — concept note describing a copilot that integrates knowledge graphs, AGENTS governance, and semantic search for context-aware responses.
- spec/opencode-plugin-organization.md:51 — mentions documenting structure to keep the knowledge graph traversable (cross-linking requirement).

## Existing Issues / PRs

- Kanban label->tags migration task (uuid:363f1d14-a864-11f0-a5c2-7fa31ed98b3f) touches knowledge-graph visibility in Obsidian; no linked PR noted.

## Requirements (from prompt and context)

- Enumerate all present knowledge-graph-related docs and code touchpoints.
- Surface entrypoints for building/using the knowledge graph (CLI, package usage, test fixtures).
- Highlight organizational docs/tasks that affect knowledge graph traversal or visibility (Obsidian tags, plugin documentation).

## Definition of Done

- List all knowledge-graph documentation sources with file/line pointers.
- Note any active work items impacting knowledge-graph visibility.
- Summarize how to run or interact with the knowledge-graph tooling (CLI/package) based on repo docs.
