# Docs & Navigation Guide

Use this file as the map for everything in `docs/`. It explains where content lives, how to keep markdown files connected, and which hubs to start from.

## Primary hubs

- [[HOME]] — high-level story, package catalog, and quick links.
- [[agents/AGENTS]] — repository overview and build conventions.
- [[agents/platforms/opencode/AGENTS]] — opencode-specific agent rules.
- [[agile/process]] and [[agile/kanban]] — workflow, board conventions, CLI reference lives nearby.
- [[CONTRIBUTOR-FRIENDLY-GITHUB-BOARDS]] — guidance for contributor-facing boards.

## Directory overview (docs/)

- `agile/` — kanban artifacts, pipelines, and generated board views.
- `adr/` — architectural decision records.
- `agents/` — platform, role, and resident instructions for agents.
- `labeled/` — timestamped/curated notes and guides (e.g., migrations, security summaries).
- `packages/` — package-specific docs and READMEs exported into docs.
- `research/` — investigations and API notes; templates for study writeups.
- `scripts/` — documentation for helper scripts and generators.
- `setup/` — environment/bootstrap instructions.
- `templates/` — reusable doc templates (tasks, service READMEs, text generators).
- Root markdown (`HOME.md`, `SUBMODULE_INTEGRATION.md`, `environment-variables.md`, `nx-workspace.md`, `spacekeys.md`, etc.) — cross-cutting references that should stay reachable from hubs above.

## Linking and graph rules

- Prefer `[[wikilinks]]` so Obsidian and docops graph stay intact; include paths when names collide (e.g., `[[agents/AGENTS]]` vs repo-root `AGENTS.md`).
- Each new markdown file should link back to at least one hub (HOME, agents/AGENTS, or a relevant section index) and link out to the most relevant neighbors.
- Avoid orphaned pages: add incoming links from the closest hub or parent directory index when you add a doc (e.g., update `agents/AGENTS.md` or `HOME.md`).
- Keep directory-level summaries up to date here when adding or moving docs; note major additions in the appropriate hub.
- When unsure where to file content, place it in `docs/inbox` temporarily and link it from a hub until properly filed.

## How to add/maintain docs

1. Create the new markdown in the correct subfolder (or `docs/inbox` temporarily).
2. Add at least two links: one inbound from a hub (e.g., add a bullet in [[HOME]] or [[agents/AGENTS]]), and one outbound to related material.
3. Update this guide if the structure shifts (new directories or hubs).
4. Keep automation references current: kanban boards under `docs/agile/boards/` are generated; don’t edit them manually.
