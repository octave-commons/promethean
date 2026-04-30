# Skill: work-on-incoming-task

Execute the best next work for a task currently in `incoming`.

## Context
- FSM rules: `docs/reference/process.md`

## Behavior
- Read the task spec, update it with progress notes, and prepare evidence required for the next transition.
- Before transitioning, call `validate-incoming-to-<target>`.

## Outputs
- Updated spec notes
- Suggested next state
- Evidence links (PRs/tests/docs) as applicable

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[validate-incoming-to-accepted](../validate-incoming-to-accepted/SKILL.md)**
- **[validate-incoming-to-icebox](../validate-incoming-to-icebox/SKILL.md)**
- **[validate-incoming-to-rejected](../validate-incoming-to-rejected/SKILL.md)**
