---
uuid: "f12dba73-161a-498a-9139-6a735eb75c3a"
title: "Fix hanging SmartGPT bridge tests /TASK-20250928-041600 /kanban /InProgress /err /p2 /EPC-000 :auto :ts"
slug: "fix-smartgpt-bridge-tests"
status: "in_progress"
priority: "p2"
labels: ["task", "board", "state", "owner", "priority", "epic", "board", "lang"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


## Context

### Changes and Updates
- **What changed?**: Integration tests for `@promethean/smartgpt-bridge` now stall after
  a Mongo-backed suite because cached clients point at a torn-down
  `MongoMemoryServer` instance.
- **Where?**: `packages/smartgpt-bridge/src/tests/helpers/server.ts`.
- **Why now?**: Latest CI run showed the suite hanging; stabilizing tests is
  prerequisite for further bridge work.

### Inputs / Artifacts
- `packages/smartgpt-bridge/src/tests/helpers/server.ts`
- `packages/persistence/src/clients.ts`

## Definition of Done
- [ ] SmartGPT bridge tests finish without hanging locally.
- [ ] Helper resets cached persistence clients during teardown.
- [ ] Added regression coverage (implicit via existing tests) and changelog
      entry.
- [ ] PR merged.

## Plan
1. Audit `withServer` teardown and persistence client cache behaviour.
2. Reset cached Mongo/Chroma clients and restore env vars after each test run.
3. Run `pnpm --filter @promethean/smartgpt-bridge test` to ensure stability.
4. Document change in `changelog.d` and prepare PR summary.



