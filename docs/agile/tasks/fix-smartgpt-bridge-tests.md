---
task-id: TASK-20250928-041600
title: Fix hanging SmartGPT bridge tests
state: InProgress
prev:
txn: "2025-09-28T04:16:00Z-1a2b"
owner: err
priority: p2
size: s
epic: EPC-000
depends_on: []
labels:
  - board:auto
  - lang:ts
due:
links: []
artifacts: []
rationale: >-
  SmartGPT bridge integration tests intermittently hang because the in-memory
  Mongo client from prior runs stays cached after teardown, leaving later
  suites talking to a closed connection. Restoring clean teardown should
  stabilize the suite.
proposed_transitions:
  - New->Accepted
  - Accepted->Breakdown
  - Breakdown->Ready
  - Ready->Todo
  - Todo->InProgress
  - InProgress->InReview
  - InReview->Document
  - Document->Done
  - InReview->InProgress
  - InProgress->Todo
tags:
  - task/TASK-20250928-041600
  - board/kanban
  - state/InProgress
  - owner/err
  - priority/p2
  - epic/EPC-000
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
