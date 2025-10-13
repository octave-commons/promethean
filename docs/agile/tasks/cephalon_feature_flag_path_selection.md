---
uuid: "1bb6f2f2-bcca-4365-aa6f-7cab3cdf8269"
title: "cephalon feature flag path selection"
slug: "cephalon_feature_flag_path_selection"
status: "in_review"
priority: "P3"
labels: ["cephalon", "feature", "flag", "path"]
created_at: "2025-10-11T19:23:08.664Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---





















Cephalon: Feature-flag classic vs ECS path

Goal: Add a feature flag to select between the classic `AIAgent` flow and the newer ECS orchestrator flow to simplify debugging and rollout.

Why: Codebase is in-between worlds; a flag allows toggling behavior while we complete persistence and context wiring.

Scope:
- Env var `CEPHALON_MODE` in `packages/cephalon/src/index.ts` to choose startup path.
- Document behavior and defaults; add note in README for temporary nature.

Exit Criteria:
- Able to switch modes without code edits; both modes functional.

#incoming #cephalon #feature-flag #migration

## Session Notes (2025-10-09)

### Scope & Plan
- Parse `CEPHALON_MODE` centrally and expose helpers for consumers.
- Branch Cephalon bootstrap between ECS (default) and legacy `AIAgent` flows.
- Document the temporary flag in package README.
- Cover the mode parsing logic with unit tests and run eslint/tests on touched paths.

### Estimate
- Complexity: 3 (Fibonacci)
- Time: 1 session

### Verification
- [ ] `pnpm --filter @promethean/cephalon test` *(fails: missing `@types/node`/`@types/ava` declarations in the workspace build container)*
- [ ] `pnpm exec eslint packages/cephalon/src/index.ts packages/cephalon/src/bot.ts packages/cephalon/src/actions/start-dialog.scope.ts packages/cephalon/src/mode.ts packages/cephalon/src/tests/mode.test.ts` *(fails: missing \"`typescript-eslint\"` dependency in lint config; captured for follow-up)*




















