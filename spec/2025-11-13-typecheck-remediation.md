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

### Knowledge-graph package (2025-11-13 deep dive)

- `packages/knowledge-graph/src/builder.ts:6-12,32,65-80,154` – unused `resolve` import, unused `DependencyProcessor`, and metadata `processingContext` typed as `Record<string, unknown>` leading to `filePath` access errors; helper receives `ProcessingContext` but logger still sees `{}`.
- `packages/knowledge-graph/src/cli.ts:22-40` – CLI wires the in-memory `Database` adapter, which lacks the methods expected by `GraphRepository` (`db`, `createTables`, etc.), causing structural type mismatch.
- `packages/knowledge-graph/src/database/database.ts:59-246` – return type declared as `Database.Database` even though `Database` is a class (not namespace); config `verbose` type mismatches better-sqlite3 signature and causes downstream failures in `src/database/migrate.ts:8`.
- `packages/knowledge-graph/src/database/memory-database.ts:1-83` – unused schema import, unused `config`/`args`, and hand-rolled adapter does not align with the real Database interface (no logger, `getDatabase` returns loose object).
- `packages/knowledge-graph/src/processors/content.ts:2` – unused `resolve` import keeps failing `noUnusedLocals`.
- `packages/knowledge-graph/src/processors/dependency.ts:3`, `src/processors/markdown.ts:6`, `src/processors/typescript.ts:3` – bad relative paths (`../../types/index.js`) lead to TS2307; markdown processor also references `unist` types without installing `@types/unist`, and lacks guards for wikilink parsing.
- `packages/knowledge-graph/src/processors/markdown.ts:98-112` – regex capture handling allows `content` to be `undefined`, so `text` assignment triggers TS18048/TS2322.
- `packages/knowledge-graph/src/processors/typescript.ts:3-70,97-112` – traverse import has no call signatures under `moduleResolution: nodenext`, visitor callbacks use implicit `any` parameters, and helper methods (`getImportType`, `isTypeOnlyImport`) appear unused because `this` is lost inside visitor objects.

**Knowledge-graph Definition of Done**

- `pnpm --filter @promethean-os/knowledge-graph typecheck` runs clean with 0 TypeScript diagnostics.
- CLI + database wiring rely on the production SQLite adapter so runtime behaviour matches the public surface.
- Processor outputs always include a strongly typed `processingContext` and avoid undefined string assignments.

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
