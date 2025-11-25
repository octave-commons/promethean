# Documentation review: hubs & gaps

## Context

- Goal: take a fast pass over major documentation hubs to understand navigation, coverage, and visible gaps to prioritize follow-up improvements.
- Scope limited to top entry points and process/architecture hubs; no edits made yet.

## Sources (with line refs)

- `docs/HOME.md:1-167` — public-facing overview + package catalog table.
- `README.md:1-189` — repo introduction, quickstart, core components overview.
- `docs/agents/AGENTS.md:1-150` — repo structure, stack, working style, kanban guidance.
- `docs/agile/README.md:1-43` and `docs/agile/process.md:1-200` — process-as-code layout and FSM workflow rules.
- `docs/architecture/index.md:1-45` — hub linking architecture graphs and initiative checklists.

## Findings

- HOME hub is the main landing page and carries an auto-generated package catalog; many rows marked "Coming soon," suggesting catalog refresh cadence matters for accuracy.
- README gives a clear product/architecture primer but is largely decoupled from process/kanban links (no pointers to docs/agile or agents guidelines from the quickstart section).
- Agents guide is detailed on workflow/kanban usage; it references `CROSS_REFERENCES.md` but that file is currently missing from the repository (likely should exist alongside `AGENTS.md`).
- Agile docs are thorough but fragmented: process FSM is deep in `docs/agile/process.md` without a short path from HOME/README; newcomers must guess the route unless they know to open `docs/agile/`.
- Architecture index is solid and links to graphs/checklists, but it isn’t linked from HOME/README, so strategic docs are discoverable only if you already know the path.

## Requirements / Definition of Done

- Produce a concise map of primary doc entry points and note missing/low-discoverability areas.
- Identify broken/missing references (e.g., `CROSS_REFERENCES.md`) to queue follow-up fixes.
- Capture candidate linking/refresh actions to improve traversal without editing files yet.

## Proposed follow-ups

- Add lightweight cross-links from `README.md` and `docs/HOME.md` to `docs/agile/README.md` and `docs/architecture/index.md` so process and strategy docs are discoverable.
- Restore or recreate `CROSS_REFERENCES.md` referenced in `AGENTS.md`/workspace docs, or update references if deprecated.
- Refresh the package catalog in `docs/HOME.md` (or confirm automation cadence) so "Coming soon" rows remain accurate.
- Consider a small "start here" block in `docs/HOME.md` pointing to HOME → Agile process → Architecture index → Agents guide for navigation.
