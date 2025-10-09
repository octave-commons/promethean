---
uuid: '99ee9a9f-a7b5-489d-9eba-5de75e6840ab'
title: 'Fix SmartGPT Bridge grep parity with ripgrep /TASK-20241120-grepfix /kanban /InProgress /gpt /p2 /EPC-000 :auto :ts'
slug: 'fix-smartgpt-bridge-grep-test'
status: 'ready'
priority: 'p2'
labels: ['task', 'board', 'state', 'owner', 'priority', 'epic', 'board', 'lang']
created_at: '2025-10-07T20:25:05.643Z'
estimates:
  complexity: 3
  scale: 2
  time_to_completion: '2 hours'
---

## Context

- **What changed?**: CI surfaced a failure for `grep: matches ripgrep output with context and flags`.
- **Where?**: `packages/smartgpt-bridge` grep adapter + fixtures.
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
