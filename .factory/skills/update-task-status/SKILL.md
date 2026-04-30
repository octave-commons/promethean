# Skill: update-task-status

Prime the agent to evaluate a task's current FSM state and choose the correct next transition.

## Steps
1. Load task file (spec/) and parse frontmatter.
2. If frontmatter missing: generate it (status=incoming) and add to inbox.
3. Validate current status is one of: icebox,incoming,accepted,breakdown,blocked,ready,todo,in_progress,in_review,testing,document,done,rejected.
4. Treat `tags` as canonical; accept `labels` as legacy input and normalize to `tags`.
5. Enumerate valid next states from `docs/reference/process.md`.
6. For each candidate transition, call the corresponding `validate-{from}-to-{to}` skill.
7. Recommend the best transition and the next `work-on-{status}-task` delegation.

## Output
- current_status
- candidate_transitions
- blockers (per transition)
- recommended_transition
- recommended_work_skill
