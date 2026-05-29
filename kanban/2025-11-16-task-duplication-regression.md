---
uuid: "orgs-octave-commons-promethean-kanban-orgs-octave-commons-promethean-spec-2025-11-16-task-duplication-regression-md"
title: "Task duplication regression test adjustment"
status: incoming
priority: P3
labels: ["specs", "migrated-spec"]
created_at: "2026-05-29T04:01:14.583Z"
source: "orgs/octave-commons/promethean/spec/2025-11-16-task-duplication-regression.md"
category: "specs"
---

> Source: `orgs/octave-commons/promethean/spec/2025-11-16-task-duplication-regression.md`
> Migrated-to-kanban: `orgs/octave-commons/promethean/kanban/2025-11-16-task-duplication-regression.md`

# Task duplication regression test adjustment

## Context

- Failing test: `packages/kanban/src/tests/task-duplication-regression.test.ts:L100-L123` (createTask allows same title in different columns).
- Root cause: test attempted to start a task in `ready`, which createTask rejects (only `icebox` and `incoming` are valid starting statuses).

## Change

- Updated the test to create the second task in `icebox` instead of `ready`, keeping the same title but different columns (both allowed starting statuses). Expectations adjusted to match statuses.
- File: `packages/kanban/src/tests/task-duplication-regression.test.ts`.

## Definition of done

- Regression test reflects allowed starting statuses while still asserting different-column duplicates are permitted.
- No change to production code; test aligns with createTask validation rules.

## Verification

- Attempted: `pnpm --filter @promethean-os/kanban exec ava dist/tests/task-duplication-regression.test.js --timeout=30s` (timed out when run in isolation; full suite not rerun). Additional verification recommended in full test run.
