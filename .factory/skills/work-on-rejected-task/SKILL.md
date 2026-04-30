# Skill: work-on-rejected-task

Execute the best next work for a task currently in `rejected`.

## Context
- FSM rules: `docs/reference/process.md`

## Behavior
- Read the task spec, update it with progress notes, and prepare evidence required for the next transition.
- Before transitioning, call `validate-rejected-to-<target>`.

## Outputs
- Updated spec notes
- Suggested next state
- Evidence links (PRs/tests/docs) as applicable

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[validate-rejected-to-icebox](../validate-rejected-to-icebox/SKILL.md)**
