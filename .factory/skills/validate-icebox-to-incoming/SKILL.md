# Skill: validate-icebox-to-incoming

Validates the FSM transition `icebox → incoming` using `docs/reference/process.md` rules and WIP checks.

## Steps
1. Confirm task currently has `status: icebox`.
2. Confirm `incoming` is a valid next state from `icebox`.
3. Enforce transition-specific gates:
   - breakdown→ready: storyPoints <= 5 and acceptance criteria exist.
   - in_progress→in_review: reviewable artifact (PR/commit) exists and gates pass.
   - testing→document: tests pass and criteria met.
   - document→done: docs complete and evidence recorded.
   - breakdown→blocked: dependency is real and bidirectional links exist.
4. If `incoming` has WIP caps, verify capacity (via kanban CLI / configured limits).

## Output
- valid (bool)
- blockers[]
- warnings[]
- recommended_action
