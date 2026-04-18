# Kanban State: In Progress

This skill guides agents through the **In Progress** state (Implementation).

## Purpose
**In Progress** is the execution phase. Code is written, tests are added, and the feature is implemented.

## Triggers
- Pulled from Todo.
- Returned from Review (requests changes).

## Actions in this State
1.  **Branch**: Create a git branch (if applicable) or worktree.
2.  **Test-First**: Write failing tests that match the Acceptance Criteria.
3.  **Implement**: Write the code to pass the tests.
4.  **Lint/Typecheck**: Ensure `pnpm lint` and `pnpm typecheck` pass.
5.  **Refactor**: Clean up the code before moving on.

## Exit Criteria (Moving to Review)
- [ ] **Tests Pass**: All new and existing tests pass.
- [ ] **Lint Clean**: No linting errors.
- [ ] **Builds**: The project builds successfully.
- [ ] **Self-Review**: You have reviewed your own diffs.

## Allowed Transitions
- **-> Review**: When code is ready for feedback.
- **-> Todo**: If shifting focus (stop work).
- **-> Backlog**: If the scope was misunderstood (abort).
