---
title: "Update existing kanban tasks to use FSM statuses"
status: ready
priority: P2
tags: [kanban, fsm, cleanup, process]
$$
uuid: kanban-fsm-update-001
$$
$$
created: 2025-10-06
$$
---

# Update existing kanban tasks to use FSM statuses

Update existing task statuses to match the new FSM states from docs/agile/process.md. Currently many tasks use legacy statuses like "backlog" that should be mapped to proper FSM states.

## Status Mapping

- `backlog` → `incoming` (new tasks should start in incoming)
- `in_progress` → `in_progress` (already correct)
- `review` → `review` (already correct)
- `document` → `document` (already correct)
- `done` → `done` (already correct)
- `icebox` → `icebox` (already correct)

## Tasks to Update

All tasks with status "backlog" should be moved to "incoming" to follow the FSM properly.

## Acceptance Criteria

- [ ] All "backlog" tasks moved to "incoming" status
- [ ] Verify board regeneration shows proper FSM column flow
- [ ] Update any task templates or documentation to use FSM statuses
- [ ] Test that WIP limits work correctly with new status flow