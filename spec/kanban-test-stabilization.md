# Kanban Test Stabilization Plan

## Background

Recent runs of `pnpm --filter @promethean-os/kanban test` (2025-11-10) surfaced >90 failing tests across commit-message generation, markdown formatting, workflow automation, and git/WIP integration suites. Key breakages stem from:

- Newly enforced starting-status validation in `packages/kanban/src/lib/kanban.ts:567-604` blocking legacy tests/CLI flows that create `Todo`/`Ready` items directly.
- Playwright UI smoke tests (`packages/kanban/src/tests/dark-mode-ui.test.ts:4-226`) being executed under AVA, triggering runtime errors.
- Shared temporary directories in `git-workflow` & `scar-file-manager` specs (e.g. `packages/kanban/src/tests/git-workflow-integration.test.ts:81-130`, `packages/kanban/src/tests/scar-file-manager.test.ts:29-75`) causing clobbered repos and ENOENT failures.
- ESM incompatibilities such as `require('os')` in `scar-context-builder` tests (`packages/kanban/src/tests/scar-context-builder.test.ts:31`) and a dangling `await import()` macro in `git-utils` tests (`packages/kanban/src/tests/git-utils.test.ts:10-22`).
- Behavioral regressions in `CommitMessageGenerator` (`packages/kanban/src/lib/heal/utils/commit-message-generator.ts:75-145`) and markdown table helpers (`packages/kanban/src/lib/markdown-output.ts:185-252`), leading to dozens of expectation mismatches.
- New WIP enforcement engine (`packages/kanban/src/lib/wip-enforcement.ts:92-704`) returning incorrect limits/utilization, breaking `packages/kanban/src/tests/wip-enforcement.test.ts`.

## Goals & Definition of Done

1. `pnpm --filter @promethean-os/kanban test` completes with zero failures.
2. Starting-status enforcement remains available but is opt-in (e.g., env/config flag) so legacy tests and scripts can create seeded tasks freely.
3. Commit-message, markdown-output, git workflow, scar manager, WIP enforcement, and transition-rule suites behave deterministically using isolated temp fixtures.
4. Playwright UI tests are excluded from AVA runs but still runnable via dedicated Playwright runner.

## Phased Implementation Plan

### Phase 1 – Test Harness Stabilization

- Update git/scar suites to use per-test temp dirs (use `fs.mkdtemp` + `os.tmpdir()`) and ensure cleanup to prevent ENOENT/fatal git errors.
- Replace CommonJS `require` usage in tests with ESM imports.
- Remove the unused `mockExecSync` macro that injects `await import()` in a non-async context (`git-utils.test.ts:10-22`).
- Extend `packages/kanban/ava.config.mjs` to explicitly exclude `**/dark-mode-ui.test.*` so Playwright specs are not executed by AVA.

### Phase 2 – Starting-Status Enforcement Flag

- Add a feature flag (e.g., `KANBAN_ENFORCE_STARTING_STATUS=true`) that toggles the strict check inside `validateStartingStatus` and `createTask`.
- Default flag off for tests/legacy workflows; update `starting-status-validation.test.ts` and CLI validation tests to enable the flag explicitly when asserting rejection.
- Document the new env flag in relevant README/CLI help if needed.

### Phase 3 – Output Generators

- Adjust `CommitMessageGenerator` subject/body helpers so headings use lowercase style expected by tests, and expose a static factory (`CommitMessageGenerator.createCommitMessageGenerator`).
- Align `formatTableCell`/`formatTable` in `markdown-output.ts` with tests for missing titles/UUIDs, special characters, and large data sets.

### Phase 4 – Workflow & Persistence Suites

- Provide a static factory on `ScarFileManager`, ensure rotation checks gracefully handle freshly created files, and keep temp fixtures isolated.
- Fix `ScarContextBuilder` temp-dir helper + integrity validation expectations.
- Review `WIPLimitEnforcement` limit lookup (`getColumnLimit` and config casing) so numeric limits from `promethean.kanban.json` propagate correctly; verify warning thresholds & suggestion ordering.
- Re-run git workflow/scar/heal command suites to confirm deterministic behavior.

### Phase 5 – Transition Rules & Residual Failures

- Investigate `transition-rules.test.ts` failures (Clojure DSL evaluation missing `evaluate-transition`) by ensuring mocked DSL files export expected symbols or guard tests when DSL is invalid.
- Iterate on any remaining failures until the full test run passes cleanly.

## Existing Issues / References

- Failing CI log captured locally (2025-11-10) – no linked GitHub issue yet.
- Relevant docs: `docs/agile/process.md`, `docs/agile/rules/kanban-transitions.clj` for workflow semantics.

## Risks & Mitigations

- **Environmental variance** (Playwright/AVA interplay): mitigate by explicit config gating and documentation.
- **Feature flag regressions**: add regression tests ensuring both strict and legacy modes behave as intended.
- **Temp directory cleanup**: ensure tests always `rm -rf` mkdtemp paths in `t.teardown` to avoid disk bloat.

## Validation Steps

1. Run targeted suites after each phase (e.g., `ava packages/kanban/src/tests/git-workflow-integration.test.ts`).
2. Final gate: `pnpm --filter @promethean-os/kanban test`.
