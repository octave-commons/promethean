# Skill: work-on-todo-task

Execute the best next work for a task currently in `todo`.

## Context
- FSM rules: `docs/reference/process.md`

## Behavior
- Read the task spec, update it with progress notes, and prepare evidence required for the next transition.
- Before transitioning, call `validate-todo-to-<target>`.

## Outputs
- Updated spec notes
- Suggested next state
- Evidence links (PRs/tests/docs) as applicable

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[validate-todo-to-breakdown](../validate-todo-to-breakdown/SKILL.md)**
- **[validate-todo-to-in_progress](../validate-todo-to-in_progress/SKILL.md)**
