# Kanban State: Review

This skill guides agents through the **Review** state.

## Purpose
**Review** is the quality assurance gate. It involves Pull Requests (PRs), code reviews, and feedback loops.

## Triggers
- Implementation is complete (from In Progress).

## Actions in this State
1.  **Open PR**: Create a Pull Request with a clear description linking the task.
2.  **Checklists**: The automation will post a checklist to the PR. **Complete it.**
3.  **Respond**: Address feedback from reviewers.

## Exit Criteria (Moving to Document/Done)
- [ ] **Approved**: PR has passing reviews.
- [ ] **CI Green**: All automated checks pass.
- [ ] **Checklist Done**: PR body/comment checklist is complete.

## Allowed Transitions
- **-> Document**: If documentation updates are needed (preferred flow).
- **-> In Progress**: If major changes are requested.
- **-> Done**: If no docs needed (rare).
