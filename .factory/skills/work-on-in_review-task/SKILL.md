# Skill: work-on-in_review-task

Execute the best next work for a task currently in `in_review`.

## Context
- FSM rules: `docs/reference/process.md`

## Behavior
- Read the task spec, update it with progress notes, and prepare evidence required for the next transition.
- Before transitioning, call `validate-in_review-to-<target>`.

## Outputs
- Updated spec notes
- Suggested next state
- Evidence links (PRs/tests/docs) as applicable

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[validate-in_review-to-breakdown](../validate-in_review-to-breakdown/SKILL.md)**
- **[validate-in_review-to-in_progress](../validate-in_review-to-in_progress/SKILL.md)**
- **[validate-in_review-to-testing](../validate-in_review-to-testing/SKILL.md)**
- **[validate-in_review-to-todo](../validate-in_review-to-todo/SKILL.md)**
