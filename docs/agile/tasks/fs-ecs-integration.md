---
task-id: TASK-20250123-fs-ecs
title: Integrate fs ECS facade for kanban sync
state: InProgress
prev:
txn: "2025-01-23T00:00:00Z-0000"
owner: err
priority: p2
size: m
epic: EPC-000
depends_on: []
labels:
  - board:auto
  - lang:ts
due:
links: []
artifacts: []
rationale: >-
  Add ECS abstractions for filesystem operations so higher-level processors can schedule
  directory syncs without direct fs.promises usage.
proposed_transitions:
  - InProgress->InReview
  - InReview->Done
tags:
  - task/TASK-20250123-fs-ecs
  - board/kanban
  - state/InProgress
  - owner/err
  - priority/p2
  - epic/EPC-000
---

## Context
### Changes and Updates
- **What changed?**: Need to orchestrate filesystem sync through ECS components for board/task processors.
- **Where?**: `packages/fs`, `packages/kanban-processor`, and related tests.
- **Why now?**: Aligns kanban sync with ECS-driven operations per latest request.

## Inputs / Artifacts
- `packages/fs/src/util.ts`
- `packages/fs/src/tree.ts`
- `packages/kanban-processor/src/index.ts`

## Definition of Done
- [ ] ECS components for directory intents/snapshots/write buffers exist.
- [ ] Systems update snapshots and perform writes via ECS.
- [ ] Kanban processor emits intents instead of touching fs directly.
- [ ] Unit tests cover change propagation for new systems.

## Plan
1. Model ECS components within `@promethean/fs` to represent desired directory state and buffers.
2. Implement systems for scanning directories and writing updates, delegating to existing helpers.
3. Refactor kanban processor to emit intents and rely on world updates.
4. Add targeted AVA tests covering directory scan/write flows and kanban sync usage.

## Relevant Resources
- Existing ECS utilities in `packages/agent-ecs`.
