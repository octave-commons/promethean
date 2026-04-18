# PM2 Ecosystem → pm2-clj Migration

## TL;DR

> **Quick Summary**: Convert every PM2 ecosystem source file to the pm2-clj DSL (`*.pm2.edn`), delete legacy `ecosystem.config.*` sources, and update all documentation to use pm2-clj render/start flows. Generated dist/aggregate configs remain build artifacts.
>
> **Deliverables**:
> - Converted pm2-clj DSL files replacing all ecosystem sources
> - Updated docs and scripts referencing pm2-clj CLI/DSL
> - TDD validation tests + automated parity checks
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Inventory + parity analysis → conversions → docs + tests

---

## Context

### Original Request
Convert all PM2 ecosystem files to the new Clojure DSL format and update all documentation to use the pm2-clj CLI/DSL. Prior attempts (sentinel, ecosystem-dsl) are historical inputs; this pm2-clj approach is final.

### Interview Summary
**Key Discussions**:
- Canonical target is pm2-clj.
- Scope is source-of-truth configs only; generated dist/aggregate outputs remain build artifacts.
- Convert legacy `ecosystem.config.*` sources to `*.pm2.edn` and delete the old files.
- Test strategy: TDD using Vitest plus pm2-clj render validation.

**Research Findings**:
- Ecosystem sources live under `system/daemons/**/ecosystem.edn` and multiple `orgs/**/ecosystem.config.*` files.
- Documentation references PM2 workflows in `system/README.md`, OpenHAX/Promethean docs, pm2-enhanced usage docs, and pm2-clj notes.
- ecosystem-dsl and sentinel are adjacent systems; no external EDN→PM2 DSL exists in OSS.

### Metis Review
**Identified Gaps (addressed in plan)**:
- Confirm guardrails (no production process changes, preserve names/env/ports).
- Validate pm2-clj feature parity with existing configs.
- Add explicit acceptance criteria for rendering parity and doc updates.

---

## Work Objectives

### Core Objective
Standardize all PM2 ecosystem sources on pm2-clj DSL (`*.pm2.edn`) while preserving runtime behavior and updating documentation to the new CLI/DSL workflow.

### Concrete Deliverables
- All ecosystem sources converted to `*.pm2.edn` and legacy `ecosystem.config.*` sources removed.
- Docs updated to use `pm2-clj render/start` and the new DSL file extensions.
- Vitest-based tests validating pm2-clj render parity and conversion coverage.

### Definition of Done
- [ ] Every legacy `ecosystem.config.*` and `system/daemons/**/ecosystem.edn` source replaced with a `*.pm2.edn` equivalent.
- [ ] `rg "ecosystem.config"` across docs/scripts returns only generated output references.
- [ ] New Vitest suite passes and validates pm2-clj render parity.

### Must Have
- Preserve all process names, env vars, cwd/script paths, ports, and scaling settings during conversion.

### Must NOT Have (Guardrails)
- Do not touch running PM2 processes or production runtime environments.
- Do not change log paths, port bindings, or scaling parameters beyond structural translation.
- Do not edit generated outputs: `dist/ecosystem.config.mjs` or `ecosystem.config.enhanced.mjs`.

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (`/home/err/devel/vitest.config.ts`, `/home/err/devel/tests/`)
- **User wants tests**: YES (TDD)
- **Framework**: Vitest

### If TDD Enabled

Each conversion task includes RED-GREEN-REFACTOR checks:

1. **RED**: Add a failing test covering a sample conversion (expected JSON match fails before conversion).
2. **GREEN**: Convert the corresponding ecosystem source to `*.pm2.edn` and update test fixtures.
3. **REFACTOR**: Normalize shared helpers (render helpers, JSON normalization, diff reporting).

Test Setup Task (if needed):
- Add test pattern for pm2-clj under `/home/err/devel/vitest.config.ts` (e.g., `tests/pm2-clj.*.test.ts`).

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately):
├── Task 1: Inventory + feature parity analysis
└── Task 2: Test harness scaffolding (Vitest + render parity helpers)

Wave 2 (After Wave 1):
├── Task 3: Convert system/daemons ecosystem sources
├── Task 4: Convert orgs/** ecosystem.config.* sources
└── Task 5: Update scripts/docs references for pm2-clj

Wave 3 (After Wave 2):
└── Task 6: Full verification + regression sweep

Critical Path: Task 1 → Task 3 → Task 5 → Task 6

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 3, 4 | 2 |
| 2 | None | 6 | 1 |
| 3 | 1 | 6 | 4, 5 |
| 4 | 1 | 6 | 3, 5 |
| 5 | 1 | 6 | 3, 4 |
| 6 | 2, 3, 4, 5 | None | None |

---

## TODOs

- [ ] 1. Inventory ecosystem sources + feature parity analysis

  **What to do**:
  - Enumerate all `ecosystem.config.*` and `system/daemons/**/ecosystem.edn` sources.
  - Build a conversion matrix (source → target `*.pm2.edn` path).
  - Compare current config features (env overrides, cluster mode, watch, cwd) against pm2-clj DSL support; list gaps.

  **Must NOT do**:
  - Do not alter any config files yet; this is inventory-only.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-repo inventory and DSL parity assessment.
  - **Skills**: `workspace-navigation`, `submodule-ops`
    - `workspace-navigation`: needed to locate ecosystem sources across orgs/ and system/.
    - `submodule-ops`: changes will span submodules; inventory should be submodule-aware.
  - **Skills Evaluated but Omitted**:
    - `git-master`: no git operations required in inventory stage.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None

  **References**:
  - `/home/err/devel/system/daemons/` - source-of-truth EDN configs to enumerate.
  - `/home/err/devel/ecosystem.config.mjs` - legacy root ecosystem source.
  - `/home/err/devel/orgs/riatzukiza/promethean/ecosystem.config.mjs` - legacy repo ecosystem source.
  - `/home/err/devel/orgs/open-hax/openhax/ecosystem.config.cjs` - legacy repo ecosystem source.
  - `/home/err/devel/orgs/open-hax/clients/ecosystem.config.js` - legacy repo ecosystem source.
  - `/home/err/devel/orgs/open-hax/clients/ecosystem.config.json` - JSON ecosystem source.
  - `/home/err/devel/orgs/riatzukiza/ollama-benchmarks/ecosystem.config.cjs` - legacy repo ecosystem source.
  - `/home/err/devel/orgs/riatzukiza/ollama-benchmarks/ecosystem.dev.config.cjs` - env variant.
  - `/home/err/devel/orgs/riatzukiza/riatzukiza.github.io/ecosystem.config.js` - legacy repo ecosystem source.
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/ecosystem.config.cjs` - legacy repo ecosystem source.
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/ecosystem.dev.config.cjs` - env variant.
  - `/home/err/devel/orgs/octave-commons/promethean-discord-io-bridge/ecosystem.config.cjs` - legacy repo ecosystem source.
  - `/home/err/devel/orgs/octave-commons/promethean-discord-io-bridge/ecosystem.dev.config.cjs` - env variant.
  - `/home/err/devel/orgs/octave-commons/promethean-discord-io-bridge/ecosystem.duck.config.cjs` - env variant.
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/ecosystem.config.cjs` - legacy repo ecosystem source.
  - `/home/err/devel/pm2-clj-project/src/pm2_clj/dsl.cljs` - pm2-clj DSL capabilities.
  - `/home/err/devel/pm2-clj-project/src/pm2_clj/cli.cljs` - CLI flags for mode/set/unset.

  **Acceptance Criteria**:
  - [ ] Inventory list contains every `ecosystem.config.*` and `ecosystem.edn` under workspace.
  - [ ] Feature parity checklist drafted (env overrides, watch, exec_mode, instances, cwd, env vars).

- [ ] 2. Add pm2-clj TDD harness and parity helpers

  **What to do**:
  - Extend `/home/err/devel/vitest.config.ts` to include `tests/pm2-clj.*.test.ts`.
  - Add helper utilities to render pm2-clj DSL and normalize JSON for parity comparisons.
  - Create an initial failing test for one representative config conversion.

  **Must NOT do**:
  - Do not convert configs yet beyond minimal fixture scaffolding for tests.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: test harness affects workspace tooling + core verification path.
  - **Skills**: `workspace-navigation`, `workspace-typecheck`
    - `workspace-navigation`: locate test config and repo conventions.
    - `workspace-typecheck`: ensure TS/Vitest config updates are sound.
  - **Skills Evaluated but Omitted**:
    - `workspace-lint`: not required unless lint errors appear.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - `/home/err/devel/vitest.config.ts` - test include patterns.
  - `/home/err/devel/package.json` - test scripts for Vitest.
  - `/home/err/devel/pm2-clj-project/src/pm2_clj/cli.cljs` - CLI render behavior.

  **Acceptance Criteria**:
  - [ ] New test suite `tests/pm2-clj.*.test.ts` exists and fails before conversion.
  - [ ] `pnpm test:octavia` reports at least one failing pm2-clj test (RED).

- [ ] 3. Convert `system/daemons/**/ecosystem.edn` to pm2-clj DSL

  **What to do**:
  - For each `system/daemons/**/ecosystem.edn`, convert to `*.pm2.edn` compatible with pm2-clj.
  - Delete the original `ecosystem.edn` after conversion (source-of-truth switch).
  - Preserve env vars, script paths, and process names.

  **Must NOT do**:
  - Do not modify generated dist outputs in `system/daemons/**/dist/`.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: bulk conversion across system daemons with strict parity requirements.
  - **Skills**: `workspace-navigation`, `submodule-ops`
    - `workspace-navigation`: locate all daemon sources.
    - `submodule-ops`: system/ is submodule-aware and cross-repo.
  - **Skills Evaluated but Omitted**:
    - `workspace-lint`: only needed if linting fails after edits.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 1

  **References**:
  - `/home/err/devel/system/daemons/` - all daemon configs.
  - `/home/err/devel/system/README.md` - daemon layout + generation notes.
  - `/home/err/devel/pm2-clj-project/ecosystems/base.pm2.edn` - example pm2-clj format.
  - `/home/err/devel/docs/notes/2026.01.28.13.09.31.md` - pm2-clj usage notes.

  **Acceptance Criteria (TDD)**:
  - [ ] New pm2-clj tests for daemon conversions pass (GREEN).
  - [ ] `pm2-clj render` on each new `*.pm2.edn` yields a valid `apps` array.

- [ ] 4. Convert `orgs/**/ecosystem.config.*` sources to pm2-clj DSL

  **What to do**:
  - Convert each legacy `ecosystem.config.*` source to `*.pm2.edn` and delete the old file.
  - Ensure environment variants (e.g., `ecosystem.dev.config.cjs`) are represented via pm2-clj profiles.

  **Must NOT do**:
  - Do not introduce new process options or change existing names/envs.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: multi-repo conversion with env/profile mapping.
  - **Skills**: `workspace-navigation`, `submodule-ops`
    - `workspace-navigation`: enumerate configs across orgs.
    - `submodule-ops`: changes span multiple submodules.
  - **Skills Evaluated but Omitted**:
    - `git-master`: no git operations needed in conversion stage.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 1

  **References**:
  - `/home/err/devel/ecosystem.config.mjs` - root source to convert.
  - `/home/err/devel/orgs/riatzukiza/promethean/ecosystem.config.mjs`
  - `/home/err/devel/orgs/open-hax/openhax/ecosystem.config.cjs`
  - `/home/err/devel/orgs/open-hax/clients/ecosystem.config.js`
  - `/home/err/devel/orgs/open-hax/clients/ecosystem.config.json`
  - `/home/err/devel/orgs/riatzukiza/ollama-benchmarks/ecosystem.config.cjs`
  - `/home/err/devel/orgs/riatzukiza/ollama-benchmarks/ecosystem.dev.config.cjs`
  - `/home/err/devel/orgs/riatzukiza/riatzukiza.github.io/ecosystem.config.js`
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/ecosystem.config.cjs`
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/ecosystem.dev.config.cjs`
  - `/home/err/devel/orgs/octave-commons/promethean-discord-io-bridge/ecosystem.config.cjs`
  - `/home/err/devel/orgs/octave-commons/promethean-discord-io-bridge/ecosystem.dev.config.cjs`
  - `/home/err/devel/orgs/octave-commons/promethean-discord-io-bridge/ecosystem.duck.config.cjs`
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/ecosystem.config.cjs`

  **Acceptance Criteria (TDD)**:
  - [ ] Each legacy `ecosystem.config.*` is removed and replaced by `*.pm2.edn`.
  - [ ] pm2-clj render parity tests pass for each converted repo.

- [ ] 5. Update docs and scripts to pm2-clj workflow

  **What to do**:
  - Replace `pm2 start ecosystem.config.*` and ecosystem-dsl commands with pm2-clj usage.
  - Update docs to reference new DSL file names (`*.pm2.edn`).
  - Keep instructions about generated dist outputs as artifacts (not sources).

  **Must NOT do**:
  - Do not add new documentation sections; update existing commands in-place.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: multiple documentation touchpoints need consistent command updates.
  - **Skills**: `workspace-navigation`
    - `workspace-navigation`: locate all PM2 docs and scripts.
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: not a UI/design task.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3, 4)
  - **Blocks**: Task 6
  - **Blocked By**: Task 1

  **References**:
  - `/home/err/devel/system/README.md`
  - `/home/err/devel/docs/notes/2026.01.28.13.09.31.md`
  - `/home/err/devel/docs/notes/2026.01.28.13.18.44.md`
  - `/home/err/devel/orgs/open-hax/openhax/spec/pm2-ecosystem.md`
  - `/home/err/devel/orgs/octave-commons/promethean/docs/pm2-enhanced-usage.md`
  - `/home/err/devel/orgs/octave-commons/promethean/docs/notes/pm2-orchestration-patterns.md`
  - `/home/err/devel/orgs/octave-commons/promethean/docs/notes/tooling/pm2-ecosystem-patterns.md`
  - `/home/err/devel/spec/pm2-daemon-sync.md`
  - `/home/err/devel/spec/octavia-cli.md`

  **Acceptance Criteria**:
  - [ ] `rg "pm2 start ecosystem.config"` in docs returns no legacy usage.
  - [ ] Docs consistently reference pm2-clj render/start and `*.pm2.edn` files.

- [ ] 6. Full verification + regression sweep

  **What to do**:
  - Run Vitest suite, ensure pm2-clj tests pass.
  - Run automated render parity checks for all converted files.
  - Verify no legacy ecosystem configs remain (except generated dist outputs).

  **Must NOT do**:
  - Do not start/stop production PM2 processes.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: multi-repo verification and regression checks.
  - **Skills**: `workspace-navigation`, `workspace-lint`
    - `workspace-navigation`: locate all converted files.
    - `workspace-lint`: ensure no formatting/test issues remain.
  - **Skills Evaluated but Omitted**:
    - `git-master`: no commit operations required for verification.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 3, 4, 5

  **References**:
  - `/home/err/devel/vitest.config.ts`
  - `/home/err/devel/tests/`
  - Converted `*.pm2.edn` files from Tasks 3 and 4

  **Acceptance Criteria**:
  - [ ] `pnpm test:octavia` passes (includes pm2-clj tests).
  - [ ] Render parity checks pass for each converted source.
  - [ ] `rg "ecosystem.config"` reports only generated dist/aggregate outputs.

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 | `test(pm2): add pm2-clj parity harness` | tests + vitest config | `pnpm test:octavia` (expect RED before conversion) |
| 3-4 | `chore(pm2): migrate ecosystem sources to pm2-clj` | converted configs | `pnpm test:octavia` |
| 5 | `docs(pm2): update cli + dsl references` | docs only | `rg "ecosystem.config" docs/` |
| 6 | `test(pm2): finalize parity checks` | tests/fixtures | `pnpm test:octavia` |

---

## Success Criteria

### Verification Commands
```bash
# Run tests (includes pm2-clj parity suite)
pnpm test:octavia

# Confirm no legacy ecosystem config sources remain
rg "ecosystem.config" system/ orgs/ docs/
```

### Final Checklist
- [ ] All converted configs have matching pm2-clj render output.
- [ ] No legacy ecosystem.config.* sources remain (only generated outputs).
- [ ] Docs reference pm2-clj CLI + `*.pm2.edn` files.
- [ ] Tests pass with no new lint/type errors.
