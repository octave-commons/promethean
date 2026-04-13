# Kanban State: Backlog

This skill guides agents through the **Backlog** state, covering Refinement, Breakdown, and Sizing.

## Purpose
The **Backlog** is where tasks are prepared for execution. Raw ideas are transformed into actionable, sized, and tested specifications.

## Triggers
- A task is promoted from Icebox.
- A new priority task is created.

## Actions in this State (The "Breakdown" Loop)
1.  **Clarify**: Update description with specific goals.
2.  **Define Done**: Add an "Acceptance Criteria" checklist to the task body.
3.  **Breakdown**: If the task is large, split it into smaller tasks.
4.  **Size**: Assign a Fibonacci score (`storyPoints`) to the front matter.
    - **1**: Trivial (typo, config tweak)
    - **2**: Small (single function/test)
    - **3**: Medium (component, known pattern)
    - **5**: Large (complex, new pattern) - *Maximum allowed for Todo*
    - **8+**: Too big - **MUST SPLIT**

## Exit Criteria (Ready Gate)
- [ ] **Scored**: `storyPoints` is set and is **≤ 5**.
- [ ] **Clear**: Acceptance criteria are explicit.
- [ ] **Context**: Relevant docs/files are linked.

## Allowed Transitions
- **-> Todo**: When "Ready Gate" passed and capacity allows.
- **-> Icebox**: If deprioritized.
