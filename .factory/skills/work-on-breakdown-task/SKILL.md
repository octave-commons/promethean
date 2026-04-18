# Skill: work-on-breakdown-task

Execute the best next work for a task currently in `breakdown`.

## Context
- FSM rules: `docs/reference/process.md`

## Behavior
- Read the task spec, update it with progress notes, and prepare evidence required for the next transition.
- Before transitioning, call `validate-breakdown-to-<target>`.

## Outputs
- Updated spec notes
- Suggested next state
- Evidence links (PRs/tests/docs) as applicable

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[validate-breakdown-to-blocked](../validate-breakdown-to-blocked/SKILL.md)**
- **[validate-breakdown-to-icebox](../validate-breakdown-to-icebox/SKILL.md)**
- **[validate-breakdown-to-ready](../validate-breakdown-to-ready/SKILL.md)**
- **[validate-breakdown-to-rejected](../validate-breakdown-to-rejected/SKILL.md)**
