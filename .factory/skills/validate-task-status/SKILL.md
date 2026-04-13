# Skill: validate-task-status

Reviews the task's current status for correctness using the FSM rules in `docs/reference/process.md`.

## Checks
- Frontmatter present and parseable.
- Status is a valid FSM state.
- `tags` present or derivable (if only `labels` exist, normalize to `tags`).
- Minimal prerequisites align with state (e.g., ready implies storyPoints <= 5).
- Content alignment hints (review should have a PR/artifact reference, etc.).

## Output
- valid (bool)
- issues[] / warnings[]
- suggested_fix (optional)
- valid_next_states[]
