---
name: agile-proces
description: "This skill guides agents and developers through the Kanban workflow defined in `orgs/riatzukiza/promethean/docs/agile/process.md`."
---
# Agile Process Skill

This skill guides agents and developers through the Kanban workflow defined in `orgs/riatzukiza/promethean/docs/agile/process.md`.

## Workflow States

The board functions as a Finite State Machine (FSM). Tasks/Specs must exist in exactly one state.

### 1. Intake (`icebox`)
- **Action**: Create task.
- **Front Matter**: `status: icebox`

### 2. Prioritize (`backlog`)
- **Action**: Accept task for future work.
- **Front Matter**: `status: backlog`

### 3. Queue (`todo`)
- **Action**: Commit to current sprint/phase.
- **Front Matter**: `status: todo`

### 4. Implement (`in-progress`)
- **Action**: Start work.
- **Front Matter**: `status: in-progress`

### 5. Review (`review`)
- **Action**: Open PR.
- **Front Matter**: `status: review`

### 6. Document (`document`)
- **Action**: Update docs.
- **Front Matter**: `status: document`

### 7. Complete (`done`)
- **Action**: Merge and close.
- **Front Matter**: `status: done`

## Updates

When moving a task:
1.  **Read** the task file.
2.  **Update** the `status` field in the front matter.
3.  **Update** `updated_at`.
4.  **Add** notes/evidence to the body if moving to Review/Testing/Done.

Dispatch sub agents to investigate the current status of each issue in the projects github
mapping each to an existing repo/project spec if possible.
Add A comment to each issue communicating what you believe it's current state to be.
Then add a label to that issue corresponding to a state in @docs/reference/process.md
create new work trees for each confirmed issue that is ready to work on and dispatch an agent to work on that issue.
For each issue confirmed to be valid, but requires triage, dispatch an agent to clarify the issue and associated spec.
For each @gates-pr35-hardening-main/spec/ that does *not* have a corresponding issue, create an issue and give it an appropriate label.
If the github label to match a current status that is a valid state in the process FSM, create that label.
