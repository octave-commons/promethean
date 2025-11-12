# Spec: Stabilize @promethean-os/ai-learning Tests

## Context & Findings

- `pnpm --filter @promethean-os/ai-learning test` fails with `Couldn’t find any files to test`, so CI cannot validate this package.
- `packages/ai-learning/package.json:37-44` restricts AVA to `src/**/*.test.ts`, but no such files currently exist.
- `packages/ai-learning/src/basic-test.ts:1-15` is a console script rather than an AVA suite and therefore never runs.
- Core behavior that should be validated lives in:
  - `packages/ai-learning/src/learning-system.ts:19-297` (system orchestrator APIs)
  - `packages/ai-learning/src/performance-tracker.ts:14-406` (score storage/analytics used in tests)
  - `packages/ai-learning/src/model-router.ts:14-361` (routing logic we can exercise end-to-end)
  - `packages/ai-learning/src/task-classifier.ts:6-217` (category classification relied on by routing)

## Existing Issues / PRs

- Unable to query via `gh issue list` / `gh pr list` because GitHub CLI is not authenticated in this environment (`gh auth login` required). Manual search pending credentials.

## Requirements

1. Provide at least one deterministic AVA test file inside `src/` matching `*.test.ts`.
2. Cover the `AILearningSystem` happy path: initialization, model registration, routing, and metrics retrieval without external dependencies.
3. Validate that performance recording flows through to `getLearningMetrics` / `getPerformanceAnalysis` so regression is caught.
4. Keep tests hermetic (no network / randomness) and runnable via `pnpm --filter @promethean-os/ai-learning test`.

## Definition of Done

- `pnpm --filter @promethean-os/ai-learning test` exits 0 locally.
- A real AVA test file exists and runs automatically under the current `ava.files` glob.
- Test fixtures assert observable behavior of `AILearningSystem` (routing returns registered model, metrics reflect recorded scores, classifier recognizes category keywords).
- Documented any limitations or follow-up needs.

## Plan (Phased)

**Phase 1 – Test Scaffolding**

- Rename `src/basic-test.ts` to `src/learning-system.test.ts` so AVA discovers it.
- Replace the console-only script with an actual AVA suite using `test()` from `ava` and importing `AILearningSystem`.
- Build synthetic model capability data and deterministic prompts to avoid flaky routing.

**Phase 2 – Behavior Coverage & Verification**

- Seed the system with two models and recorded performance scores to validate routing preferences and metrics.
- Assert:
  - `routeTask` resolves after `initialize` and returns the expected model & metadata.
  - Recording scores affects `getModelPerformance`, `getLearningMetrics`, and `generateRecommendations`.
  - Task classification picks specialized categories (e.g., `buildfix-ts-errors`) for prompts matching keyword rules.
- Re-run `pnpm --filter @promethean-os/ai-learning test` and capture results for documentation.

## Testing Strategy

- Primary: `pnpm --filter @promethean-os/ai-learning test` after each phase.
- Optional future expansion: add targeted `pnpm --filter ... typecheck` if test compile errors appear.
