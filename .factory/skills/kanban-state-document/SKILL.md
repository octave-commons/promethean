# Kanban State: Document

This skill guides agents through the **Document** state.

## Purpose
**Document** ensures knowledge transfer. We "work backward" from docs, or ensure docs catch up before closing.

## Triggers
- Code is approved (from Review).

## Actions in this State
1.  **Update Artifacts**:
    - Update `README.md` if interfaces changed.
    - Update `docs/` if architecture changed.
    - Update `AGENTS.md` if agent instructions changed.
2.  **Capture Evidence**: Record screenshots, logs, or metrics proving success.
3.  **Changelog**: Add entry to changelog (if applicable).

## Exit Criteria
- [ ] **Docs synced**: Documentation matches the implemented reality.
- [ ] **Evidence**: Proof of functionality is recorded on the task/PR.

## Allowed Transitions
- **-> Done**: When docs are complete.
- **-> Review**: If docs need review.
