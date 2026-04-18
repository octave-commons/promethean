# Skill: work-on-accepted-task

Execute the best next work for a task currently in `accepted`.

## Context
- FSM rules: `docs/reference/process.md`

## Behavior
- Read the task spec, update it with progress notes, and prepare evidence required for the next transition.
- Before transitioning, call `validate-accepted-to-<target>`.

## Outputs
- Updated spec notes
- Suggested next state
- Evidence links (PRs/tests/docs) as applicable

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[validate-accepted-to-breakdown](../validate-accepted-to-breakdown/SKILL.md)**
- **[validate-accepted-to-icebox](../validate-accepted-to-icebox/SKILL.md)**
