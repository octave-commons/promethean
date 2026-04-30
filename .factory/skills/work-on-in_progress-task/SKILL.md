# Skill: work-on-in_progress-task

Execute the best next work for a task currently in `in_progress`.

## Context
- FSM rules: `docs/reference/process.md`

## Behavior
- Read the task spec, update it with progress notes, and prepare evidence required for the next transition.
- Before transitioning, call `validate-in_progress-to-<target>`.

## Outputs
- Updated spec notes
- Suggested next state
- Evidence links (PRs/tests/docs) as applicable

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[validate-in_progress-to-breakdown](../validate-in_progress-to-breakdown/SKILL.md)**
- **[validate-in_progress-to-in_review](../validate-in_progress-to-in_review/SKILL.md)**
- **[validate-in_progress-to-todo](../validate-in_progress-to-todo/SKILL.md)**
