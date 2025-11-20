# Kanban test failures triage

## Context

- `pnpm --filter @promethean-os/kanban test` currently fails with:
  - Playwright suite (`dist/tests/dark-mode-ui.test.js`) executing under AVA, causing `Playwright Test did not expect test.describe()` crash.
  - `src/tests/transition-rules.test.ts` cases calling `TransitionRulesEngine` without a DSL path (see lines 90-329) now fail because the engine enforces a non-empty DSL path and real evaluation.
  - Several suites time out or remain pending (`bulk-import-duplication`, `sync`, `task-duplication-regression`, `underscore-bug-demo`, `helpers/cli-test-utils`) once the suite crashes.

## Requirements / Definition of Done

1. `pnpm --filter @promethean-os/kanban test` runs `pnpm run clean` before the TypeScript build so that stale compiled tests like `dist/tests/dark-mode-ui.test.js` are removed before AVA scans `dist/tests` (package scripts at `packages/kanban/package.json:52-62`).
2. Transition rules tests write a temporary mock DSL file for every case that instantiates `TransitionRulesEngine`, even for helper/overview tests. No test should pass an empty string for `dslPath` anymore (`packages/kanban/src/tests/transition-rules.test.ts:90-329`).
3. After implementing #1 and #2, rerun focused suites (transition-rules + previously failing/pending spec files) to confirm they complete. Investigate remaining pending suites if they still hang once the hard failures are gone.

## Plan

- Update `packages/kanban/package.json` scripts to `clean` before `build`, ensuring `dist/tests/dark-mode-ui.*` disappears so AVA never imports Playwright-only specs.
- Enhance `src/tests/transition-rules.test.ts` by adding a helper that writes a canonical DSL snippet (valid, rejecting, invalid) inside the temp directory obtained via `withTempDir(t)`, and use it across tests so they pass legitimate `dslPath` values.
- Re-run the specific suites (`dist/tests/transition-rules.test.js`, `dist/tests/dark-mode-ui.test.js` implicitly excluded) and then the broader `pnpm test` run to uncover any remaining timeouts (bulk import, sync, etc.).
