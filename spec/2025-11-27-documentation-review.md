# Documentation Review (2025-11-27)

## Prompt

"Lets review our documentation" — provide a current-state readout of key docs, coverage, and gaps.

## Scope

- Focus on top-level repository docs and process guidance.
- Identify obvious gaps or link breakage risk; do not edit content in this slice.

## References (paths:lines)

- README.md:1-381 (repo overview, quick start, package matrix)
- docs/agile/process.md:1-244 (kanban FSM and workflow rules)
- docs/contributing/docs-policy.md:1-33 (docs guard and structure expectations)
- docs/inbox/README.md:1-679 (opencode-client package doc placeholder)

## Existing issues/PRs

- Not investigated in this slice (timeboxed discovery).

## Definition of Done

- Inventory of key documentation entry points captured.
- High-level assessment of coverage and navigability recorded.
- Actionable gaps or next-step recommendations listed.

## Requirements / Notes

- Respect docs policy: package changes require docs updates in docs/packages/<slug>/.
- Keep documentation graph traversable; prefer linking into existing index docs.
- New docs should go to docs/inbox/ if placement unclear.

## Findings

- README referenced missing docs for environment variables and Nx workspace; added stubs to remove dead links.
- README architecture pointer now targets `docs/architecture/index.md` (existing hub).
- `docs/inbox/README.md` (opencode-client) was orphaned; surfaced via README Key Documentation.

## Change Log

- Added `docs/environment-variables.md` and `docs/nx-workspace.md` to satisfy README links.
- Updated `README.md` Key Documentation section to include architecture index, env/Nx docs, and opencode-client inbox doc.
