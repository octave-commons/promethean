---
task-id: TASK-20241120-grepfix
title: Fix SmartGPT Bridge grep parity with ripgrep
state: InProgress
prev:
txn: "2024-11-20T00:00:00Z-0001"
owner: gpt
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
rationale: |
  Unit tests in `@promethean/smartgpt-bridge` show flaky behavior around the
  `grep` adapter. The first unit case reports a rejected promise, so we need to
  tighten the implementation until it matches the contract verified against
  ripgrep.
proposed_transitions:
  - New->Accepted
  - Accepted->Breakdown
  - Breakdown->Ready
  - Ready->Todo
  - Todo->InProgress
  - InProgress->InReview
tags:
  - task/TASK-20241120-grepfix
  - board/kanban
  - state/InProgress
  - owner/gpt
  - priority/p2
  - epic/EPC-000
---

## Context
- **What changed?**: CI surfaced a failure for `grep: matches ripgrep output with context and flags`.
- **Where?**: `packages/smartgpt-bridge` (grep adapter + fixtures).
- **Why now?**: This check blocks pipelines; aligning our adapter with the
  reference ripgrep behavior unblocks further work.

## Inputs / Artifacts
- Failing test log: `packages › smartgpt-bridge › dist › tests › unit › grep › grep: matches ripgrep output with context and flags`.
- Implementation under investigation: `packages/smartgpt-bridge/src/rg.ts`.

## Definition of Done
- [ ] Identify the rejection root cause by reproducing the failure locally.
- [ ] Patch `grep` so it gracefully handles the triggering scenario.
- [ ] Add or adjust automated coverage if the regression path is missing.
- [ ] Package build + targeted tests pass.

## Plan
1. Reproduce the unit failure locally and collect stack traces.
2. Inspect `grep` error handling for the rejection signature and design a fix.
3. Implement the adjustment plus any needed fixtures or tests.
4. Re-run unit tests and lint for the touched files.
5. Prepare PR notes with evidence of the fix.

## Relevant Resources
- ripgrep manual: <https://github.com/BurntSushi/ripgrep>
- Ava docs: <https://github.com/avajs/ava>
