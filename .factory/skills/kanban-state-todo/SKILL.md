# Kanban State: Todo

This skill guides agents through the **Todo** state (The Ready Queue).

## Purpose
**Todo** represents work that is fully specified, sized, and prioritized. It is the immediate queue for execution.

## Triggers
- A task passes the "Ready Gate" in Backlog.
- A task is returned from In Progress (handoff/blocked).

## Actions in this State
1.  **Queue**: Tasks sit here until an agent/developer is free.
2.  **Blocker Check**: Ensure no dependencies are blocking start.

## Exit Criteria (Pulling Work)
- [ ] **WIP Check**: Verify `In Progress` column is not full (WIP Limits apply).
- [ ] **Assign**: Assign yourself (or the worker) to the task.

## Allowed Transitions
- **-> In Progress**: When starting work.
- **-> Backlog**: If the task needs re-scoping.
