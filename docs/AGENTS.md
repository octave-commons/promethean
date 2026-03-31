# Docs & Navigation Guide

Use this file as the map for everything in `docs/`. It explains where content lives, how to keep markdown files connected, and which hubs to start from.

## Primary hubs

- [[HOME]] — high-level story, package catalog, and quick links.
- [[docs/prompting/agents/AGENTS]] — repository overview and build conventions.
- [[docs/prompting/agents/platforms/opencode/AGENTS]] — opencode-specific agent rules.
- [[agile/process]] and [[agile/kanban]] — workflow, board conventions, CLI reference lives nearby.
- [[CONTRIBUTOR-FRIENDLY-GITHUB-BOARDS]] — guidance for contributor-facing boards.

## Directory overview (docs/)

- `agile/` — kanban artifacts, pipelines, and generated board views; see [[agile/process]] and [[agile/kanban]].
- `adr/` — architectural decision records such as [[2025-10-16-mcp-role-model-strict-mode-dangerous-operation-policy]].
- `agents/` — platform, role, and resident instructions; start with [[docs/prompting/agents/AGENTS]] and [[docs/prompting/agents/platforms/opencode/AGENTS]].
- `labeled/` — timestamped/curated notes and guides (e.g., [[docs/hacks/labeled/MCP_SECURITY_IMPLEMENTATION_SUMMARY]] and [[docs/hacks/labeled/ui-components]]).
- `packages/` — package-specific docs and READMEs exported into docs (e.g., [[docs/dev/packages/llm/README]] and [[packages/discord/README]]).
- `research/` — investigations and API notes; templates for study writeups like [[buildingthefields]].
- `scripts/` — documentation for helper scripts and generators such as [[generate_orphan_docs]].
- `setup/` — environment/bootstrap instructions; see [[environment]] and [[clojurescript-lsp]].
- `templates/` — reusable doc templates (tasks, service READMEs, text generators) including [[docs/templates/readme]] and [[templates/service.readme.template]].
- Root markdown ([[HOME]], [[SUBMODULE_INTEGRATION]], [[environment-variables]], [[nx-workspace]], [[spacekeys]], etc.) — cross-cutting references that should stay reachable from hubs above.

## Recent additions

- Pantheon architecture docs: [[lisp-dsl-specification]], [[multi-runtime-architecture]], [[session-management]]
- Typecheck triage specs: [[spec/2025-12-01-typecheck-triage]], [[spec/2025-12-02-typecheck-kanban-docs]]
- Kanban CLI coverage plan: [[spec/cli-kanban-plugin-loading-tests]]

## Linking and graph rules

- Prefer `[[wikilinks]]` so Obsidian and docops graph stay intact; include paths when names collide (e.g., `[[agents/AGENTS]]` vs repo-root `AGENTS.md`).
- Each new markdown file should link back to at least one hub (HOME, agents/AGENTS, or a relevant section index) and link out to the most relevant neighbors.
- Avoid orphaned pages: add incoming links from the closest hub or parent directory index when you add a doc (e.g., update `agents/AGENTS.md` or `HOME.md`).
- Keep directory-level summaries up to date here when adding or moving docs; note major additions in the appropriate hub.
- When unsure where to file content, place it in `docs/inbox` temporarily and link it from a hub until properly filed.

## How to add/maintain docs

1. Create the new markdown in the correct subfolder (or `docs/inbox` temporarily).
2. Add at least two links: one inbound from a hub (e.g., add a bullet in [[HOME]] or [[docs/prompting/agents/AGENTS]]), and one outbound to related material.
3. Update this guide if the structure shifts (new directories or hubs).
4. Keep automation references current: kanban boards under `docs/agile/boards/` are generated; don’t edit them manually.
