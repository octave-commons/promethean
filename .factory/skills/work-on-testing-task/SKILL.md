# Skill: work-on-testing-task

Execute the best next work for a task currently in `testing`.

## Context
- FSM rules: `docs/reference/process.md`

## Behavior
- Read the task spec, update it with progress notes, and prepare evidence required for the next transition.
- Before transitioning, call `validate-testing-to-<target>`.

## Outputs
- Updated spec notes
- Suggested next state
- Evidence links (PRs/tests/docs) as applicable

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[validate-testing-to-document](../validate-testing-to-document/SKILL.md)**
- **[validate-testing-to-in_progress](../validate-testing-to-in_progress/SKILL.md)**
- **[validate-testing-to-in_review](../validate-testing-to-in_review/SKILL.md)**
