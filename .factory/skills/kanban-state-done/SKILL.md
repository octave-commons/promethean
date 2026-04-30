# Kanban State: Done

This skill guides agents through the **Done** state (Closure).

## Purpose
**Done** signifies the value has been delivered.

## Triggers
- Code merged and docs updated.
- Task cancelled/wont-fix (from Icebox/Backlog).

## Actions in this State
1.  **Merge**: Merge the PR (if not already).
2.  **Close Task**: Update status to `done`.
3.  **Celebrate**: 🎉
4.  **Reflect**: If the task was painful, add a note to the retro/inbox.

## Exit Criteria
- **None**. This is a terminal state.

## Allowed Transitions
- **-> Icebox/Backlog**: Only if reopened (regression or re-scope).
