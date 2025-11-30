# Docs Graph + opencode.json update

## Context

- Goal: add `docs/AGENTS.md` describing documentation structure/linking rules, ensure markdown files are connected, and update `opencode.json` to scan docs recursively.
- Key references already in repo:
  - `docs/agents/AGENTS.md` (repository overview, package anatomy)
  - `docs/agents/platforms/opencode/AGENTS.md` (opencode platform instructions; notes on placing docs)
  - `docs/agents/readme.md` (agents categorization)
  - `docs/HOME.md` (entry point; package catalog table)
  - `opencode.json` instructions array at lines 81-89 currently excludes docs.

## Planned changes

1. Create `docs/AGENTS.md` that
   - Explains docs/ layout (agile/, adr/, agents/, research/, scripts/, setup/, templates/, packages/, labeled/, etc.)
   - Describes linking/traversability expectations (wikilinks, HOME as hub, inbox guidance) and how to keep docs connected.
   - Points to key anchors: [[HOME]], [[agents/AGENTS]], [[agile/process]], [[agents/platforms/opencode/AGENTS]], [[CONTRIBUTOR-FRIENDLY-GITHUB-BOARDS]], etc.
2. Update `opencode.json` instructions list to scan docs recursively (e.g., include `./docs/**/*.md` and the new `docs/AGENTS.md`).
3. Add/adjust links so the new doc is reachable and existing hubs reference it (likely `docs/HOME.md` and/or `docs/agents/AGENTS.md`).

## Definition of done

- `docs/AGENTS.md` exists with clear structure overview, linking policy, and references to major doc hubs.
- `opencode.json` instructions include docs recursive scan without breaking existing entries.
- At least two-way linkage established: new doc links out to existing hubs and at least one existing hub links back, maintaining traversable graph.
- No broken formatting; Markdown remains Obsidian-friendly (wikilinks where sensible).

## Notes / Risks

- Large doc set; scope limited to establishing hub links rather than auditing every file.
- Keep edits minimal outside of the identified hubs.
