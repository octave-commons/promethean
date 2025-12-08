# Knowledge Graph UI App.tsx Slimming

## Scope

- Target package: `services/knowledge-graph/packages/knowledge-graph-ui`
- Goal: shrink `src/App.tsx` (~2200 lines) by extracting helpers/components while keeping behavior.

## Key References

- `src/App.tsx` lines ~1-2223: monolithic app component, embeds helper functions (markdown/code highlighting, formatting, size helpers), UI cards (NodesCard/EdgesCard/GraphActions/DisplayCard), data fetching/effects, and details rendering.
- `src/components/DisplayCard.tsx` lines ~1-250: existing extracted display controls component (currently duplicated inside App).
- `src/components/GraphActions.tsx` lines ~1-42: existing extracted graph actions component (duplicated inline in App).
- `src/components/SimulationPanel.tsx`: simulation session UI already modular.
- `src/util.ts`: exports `nodeTypeColor` and layout helpers; App redefines `nodeTypeColor` locally.

## Existing Issues/PRs

- None discovered in repo context for this file.

## Definition of Done

- `App.tsx` delegates to extracted helpers/components (no duplicated inline versions of DisplayCard/GraphActions/NodesCard/EdgesCard/helpers).
- Shared helpers (markdown/code formatting, value formatting, size helpers, clipboard JSON) live in small utility modules and are imported.
- Imports updated; tests and build remain passing (at least App tests should run/continue to pass).
- No user-facing behavior changes.

## Plan (phased)

1. Identify and extract pure helpers into `src/utils` (markdown/code highlighting, formatting, size helpers, clipboard JSON). Reuse existing `util.ts` for `nodeTypeColor` or expand as needed.
2. Replace inline UI cards in `App.tsx` with imports from `src/components` (create `NodesCard`/`EdgesCard` components alongside existing ones if not present). Adjust tests/mocks to match paths.
3. Simplify `App.tsx` composition to use extracted helpers/components; ensure imports cleaned up. Run/inspect unit tests for the package if feasible.
