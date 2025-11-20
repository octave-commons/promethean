# Pantheon Coordination Types Export Fix

## Context

- `packages/pantheon/coordination/src/types/index.ts:8-15` re-exports every module with `export *` which:
  - re-exports duplicate symbol names (e.g., `TaskStatus`, `AgentCapability`) coming from multiple modules, causing TS2308 duplicate export errors.
  - references modules that do not exist (`performance.js`, `learning.js`, `security.js`).
- TypeScript also flags unused imports:
  - `packages/pantheon/coordination/src/types/agent-instance.ts:7` imports `randomUUID` but never uses it.
  - `packages/pantheon/coordination/src/types/enso-integration.ts:8` imports `AgentInstance` but never uses it.
  - `packages/pantheon/coordination/src/types/kanban-integration.ts:8-9` imports `AgentInstance` and `TaskAnalysis` but never use them.

No related GitHub issues or PRs were found for this scope.

## Requirements

1. Stop using wildcard re-exports that collide and drop references to non-existent modules.
2. Provide a conflict-free, ergonomic export surface for the coordination types package (namespacing acceptable as long as consumers can reach every type).
3. Remove all unused imports called out by TypeScript to keep the build clean.
4. Maintain TypeScript strictness and align with repo coding standards (ESM, const, no `let` where avoidable, etc.).
5. Validate the package after changes (typecheck or targeted build/test) to ensure duplicate export and unused import errors disappear.

## Definition of Done

- `pnpm --filter @promethean-os/pantheon-coordination typecheck` (or equivalent validation) succeeds without duplicate export or unused import warnings.
- `packages/pantheon/coordination/src/types/index.ts` exposes all type modules without re-export collisions or phantom modules.
- `randomUUID`, `AgentInstance`, and `TaskAnalysis` unused imports are removed.
- CI-facing docs/testing notes updated if behavior changes (not anticipated here).

## Plan

### Phase 1 – Export Surface Restructure

- Replace wildcard exports in `index.ts` with explicit grouped exports that avoid duplicate symbol names (likely via namespacing each module, e.g., `export * as AgentInstanceTypes from './agent-instance.js';`).
- Remove `performance.js`, `learning.js`, `security.js` as they have no backing modules.
- Ensure documentation comments describe the new structure so consumers know to import via namespaces if needed.

### Phase 2 – Import Hygiene

- Delete the unused `randomUUID` import from `agent-instance.ts`.
- Delete unused imports from `enso-integration.ts` and `kanban-integration.ts` while leaving the rest untouched.

### Phase 3 – Validation

- Run the pantheon coordination typecheck (or most targeted command available) to confirm duplicate export errors and unused import warnings are resolved.
- Review git status to ensure only expected files changed.

## Notes / Open Questions

- Confirm no tooling relies on the previous wildcard export shape; if needed, we can offer helper namespaces plus curated named exports in future iterations.
