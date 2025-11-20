# Pantheon Build Remediation Plan

## Context

- `pnpm --filter @promethean-os/pantheon-*/ build` currently fails for coordination, core, protocol, and ui packages with TypeScript errors (captured 2025-11-09).
- No existing GitHub issues or PRs mention these failures (`gh issue list --search "pantheon build"`, `gh pr list --search "pantheon build"**).

## Discovered Issues

### @promethean-os/pantheon-coordination

**DONE**

- Wildcard re-exports in `packages/pantheon/coordination/src/types/index.ts:8-15` pull in overlapping symbols from several modules, triggering TS2308 duplicate export errors and referencing non-existent modules (`performance.js`, `learning.js`, `security.js`).
- Unused imports flagged by tsc in:
  - `src/types/agent-instance.ts:7` (`randomUUID`).
  - `src/types/enso-integration.ts:8` (unused `AgentInstance`).
  - `src/types/kanban-integration.ts:8-9` (unused `AgentInstance`, `TaskAnalysis`).

### @promethean-os/pantheon-core

**DONE**
- `packages/pantheon/core/src/core/context.ts:20-28` dynamically imports `@promethean-os/persistence` and destructures `makeContextStore`, but that symbol is not exported by the persistence package, producing TS2339.

### @promethean-os/pantheon-protocol

**DONE**
- `packages/pantheon/protocol/src/adapters/protocol-adapter.ts` contains numerous unused variables/imports and implicit `any` parameters (see diagnostics around lines 9, 66, 211, 373, 487, 633, 675). These violate the strict compiler settings and block emit.

### @promethean-os/pantheon-ui

- Missing runtime dependencies: `lit`, `lit/decorators.js`, `luxon`, `rxjs`, and `@promethean-os/ui-components` are imported in `src/components/*.ts` and `src/utils/state-manager.ts` but absent from `packages/pantheon/ui/package.json:15-23`.
- `tsconfig.json` lacks DOM lib entries, so `dispatchEvent` on LitElement subclasses is not part of the type environment.
- `src/utils/state-manager.ts:5-125` defines observables with anonymous parameters, causing implicit `any` warnings under `strict` mode.

## Plan (Phased)

### Phase 1 – Coordination types hygiene

1. Remove unused imports in `agent-instance.ts`, `enso-integration.ts`, and `kanban-integration.ts`.
2. Replace wildcard exports in `types/index.ts` with explicit exports or barrel modules that avoid duplicate names; drop references to non-existent files.
3. Re-run `pnpm --filter @promethean-os/pantheon-coordination build` to confirm TS2308/TS6133 resolved.

### Phase 2 – Core context adapter alignment

1. Inspect `@promethean-os/persistence` (dist + types) to identify the correct factory (e.g., `createContextStore`).
2. Update `packages/pantheon/core/src/core/context.ts` to import the actual factory symbol and adjust naming/usage accordingly.
3. Build the package to ensure TS2339 clears.

### Phase 3 – Protocol adapter cleanup

1. Audit `protocol-adapter.ts` for unused variables/imports; remove or utilize them.
2. Provide explicit types for parameters currently inferred as `any`, and add guards for possibly undefined values before assignment.
3. Verify `@promethean-os/pantheon-protocol` builds once tsc is satisfied.

### Phase 4 – UI dependency & typing fixes

1. Update `packages/pantheon/ui/package.json` dependencies to include `lit`, `luxon`, `rxjs`, and any internal UI packages actually consumed.
2. Run `pnpm install` (workspace) so the lockfile captures the additions.
3. Extend `packages/pantheon/ui/tsconfig.json` with appropriate `lib` entries (e.g., `DOM`, `ES2022`) to expose browser APIs to Lit components.
4. Add the missing type annotations in `src/utils/state-manager.ts` (observables, destructured parameters) so no implicit `any` remains.
5. Rebuild the package to verify the compiler no longer reports missing modules or DOM properties.

### Phase 5 – Consolidated verification

1. Run `pnpm --filter @promethean-os/pantheon-* build` and confirm all four packages compile.
2. Spot check any downstream packages that consume these modules for regressions (lint/typecheck if available).
3. Capture the results in the PR description and note follow-up work if additional refactors emerge.

## Definition of Done

- Coordination package builds without TS2308/TS6133 errors and exports remain uniquely defined.
- Core package resolves the persistence dependency without type errors and still compiles context data.
- Protocol adapter compiles cleanly under `strict` TypeScript settings with no unused declarations.
- UI package declares and installs all required dependencies, resolves DOM typings, and eliminates implicit `any` diagnostics.
- A workspace build of all Pantheon packages passes, and the remediation steps are documented in this spec for future reference.
