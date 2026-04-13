# Kanban State: Icebox

This skill guides agents through managing the **Icebox** state.

## Purpose
The **Icebox** is the holding area for ideas, future tasks, and deprioritized work. It captures value without clogging the active workflow.

## Triggers
- A new idea is generated but not yet prioritized.
- An active task is deprioritized or deferred.
- A task is rejected from the active workflow but might be valuable later.

## Actions in this State
1.  **Capture**: Ensure the task has a clear title and basic description.
2.  **Tag**: Apply relevant tags (e.g., `feature`, `refactor`, `idea`).
3.  **Cool Down**: Do not expend effort on deep analysis or sizing here.
4.  **Review**: Periodically review for candidates to promote to Backlog.

## Exit Criteria (Moving to Backlog)
- [ ] The task is deemed relevant for the upcoming cycle/milestone.
- [ ] A stakeholder/owner explicitly prioritizes it.

## Allowed Transitions
- **-> Backlog**: When work is prioritized.
- **-> Done**: If the idea is discarded/wont-fix (close it).
