# Skill: work-on-document-task

Execute the best next work for a task currently in `document`.

## Context
- FSM rules: `docs/reference/process.md`

## Behavior
- Read the task spec, update it with progress notes, and prepare evidence required for the next transition.
- Before transitioning, call `validate-document-to-<target>`.

## Outputs
- Updated spec notes
- Suggested next state
- Evidence links (PRs/tests/docs) as applicable

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[validate-document-to-done](../validate-document-to-done/SKILL.md)**
- **[validate-document-to-in_review](../validate-document-to-in_review/SKILL.md)**
