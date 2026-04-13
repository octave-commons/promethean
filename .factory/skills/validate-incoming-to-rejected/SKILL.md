# Skill: validate-incoming-to-rejected

Validates the FSM transition `incoming → rejected` using `docs/reference/process.md` rules and WIP checks.

## Steps
1. Confirm task currently has `status: incoming`.
2. Confirm `rejected` is a valid next state from `incoming`.
3. Enforce transition-specific gates:
   - breakdown→ready: storyPoints <= 5 and acceptance criteria exist.
   - in_progress→in_review: reviewable artifact (PR/commit) exists and gates pass.
   - testing→document: tests pass and criteria met.
   - document→done: docs complete and evidence recorded.
   - breakdown→blocked: dependency is real and bidirectional links exist.
4. If `rejected` has WIP caps, verify capacity (via kanban CLI / configured limits).

## Output
- valid (bool)
- blockers[]
- warnings[]
- recommended_action
