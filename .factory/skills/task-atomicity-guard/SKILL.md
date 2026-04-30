---
name: task-atomicity-guard
description: "Protocol to keep work atomic and prevent scope creep."
---

# Skill: Task Atomicity Guard

## Goal
Ensure the agent completes one atomic unit of work at a time and does not drift into extra tasks.

## Use This Skill When
- The user asks for multiple unrelated changes in one request.
- You are tempted to "also fix" nearby issues.
- You are about to start a second task before the first is verified.

## Do Not Use This Skill When
- The task is naturally multi-step but still one unit (for example, a safe rename).

## Steps
1. **Decompose**: List the atomic tasks.
2. **Pick One**: Select the highest-priority item.
3. **Track the Rest**: Add remaining items to the todo list.
4. **Execute**: Perform only the chosen task.
5. **Verify**: Run required checks and finish the task fully.

## Output
- One completed unit of work with verification.

## Strong Hints
- **Constraint**: Do not start a new task while the current one is failing.
- **Tip**: Small, verified steps reduce regressions.
