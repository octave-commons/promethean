# Typecheck Remediation (2025-11-13)

## Scope

- Resolve TypeScript errors blocking `pnpm --filter @promethean-os/<pkg> typecheck` for:
  - `@promethean-os/readmeflow`
  - `@promethean-os/prompt-optimization`
  - `@promethean-os/docs-system`
  - `@promethean-os/knowledge-graph`
  - `@promethean-os/data-stores`

## Observed Issues (initial reproduction)

- `packages/pipelines/readmeflow/src/03-write.ts:28,97` – undefined guards missing around `manager.agentOps` and `generatorStates[0]`.
- `packages/prompt-optimization/src/ab-testing.ts:299-616` – unguarded access to `testGroup` and unresolved undefined flows; `src/adaptive-routing.ts:433-609` – indexing with undefined keys; `src/deploy.ts:112-115` – optional prompt handling; `src/monitoring-dashboard.ts:285-386` – metrics optionality.
- `packages/docs-system/src/frontend/**/*` – TS config lacks JSX settings causing TS17004/TS6142 for every React component.
- `packages/knowledge-graph/tsconfig.json` – extends missing `/home/err/devel/orgs/riatzukiza/tsconfig.json` and lacks `@types/babel__parser` dependency, preventing compiler startup.
- `packages/data-stores/src/tests/data-store-manager.test.ts:10-280` – missing exports from `@promethean-os/persistence`, implicit `any` parameters, and outdated helper signatures.

## Existing Issues / PRs

- None explicitly identified for these failures (searched command history only). Note: update if related tickets surface.

## Requirements & Definition of Done

1. All five packages pass their scoped `pnpm --filter @promethean-os/<pkg> typecheck` commands locally.
2. Changes honor existing coding standards (per `STYLE.md`) and avoid introducing behavioural regressions (add targeted tests when needed).
3. Maintain strict null/undefined safety; prefer narrowing, default objects, or early returns over non-null assertions unless justified.
4. For docs-system, ensure JSX compilation works without loosening type safety (configure tsconfig appropriately, including `jsx` + module resolution).
5. Update any dependent mocks/tests (e.g., data store tests) to match current public APIs instead of leaking internal helpers.

## Plan (Phased)

1. **Tooling Fixes** – unblock compilers:
   - docs-system: make dedicated `tsconfig` for frontend with `jsx: react-jsx`, ensure path references use `.tsx` extensions.
   - knowledge-graph: point `extends` to repo tsconfig (likely `../../tsconfig.json`), add missing `@types/babel__parser` dependency if needed.
2. **Runtime Guards** – add safe defaults and guards for optional values causing undefined errors in readmeflow & prompt-optimization modules.
3. **Schema & Indexing Safety** – enforce proper typing in adaptive routing/prompt modules by validating keys and casting when needed.
4. **Test Refactors** – align data-stores tests with public persistence API; provide typed helpers instead of implicit anys.
5. **Verification** – rerun each package typecheck; if additional issues appear, iterate until clean.

## Notes / Risks

- Some prompt-optimization files are large; incremental fixes with helper functions may be necessary to keep clarity.
- Data-store tests should not rely on internal persistence shims; may require introducing fakes within package scope.
- docs-system may require splitting tsconfigs (frontend/back-end) if backend Node targets differ.

## Next Steps

- Begin with docs-system + knowledge-graph config tweaks to unblock compiler.
- Iterate through each package applying fixes, updating this spec with any new discoveries and linking code references as they arise.
