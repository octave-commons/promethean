---
name: apology-action-protocol
description: "Protocol to stop apology loops and focus on verified fixes."
---

# Skill: Apology Action Protocol

## Goal
Replace repeated apologies with concrete, verified fixes.

## Use This Skill When
- You have apologized more than once for the same issue.
- You are about to apologize instead of fixing the root cause.

## Do Not Use This Skill When
- A one-off apology is appropriate and you have a clear fix.

## Steps
1. **State the Error**: Explain the mistake in one sentence.
2. **Verify Assumptions**: Run a tool or search to confirm the fix path.
3. **Apply Fix**: Make the change.
4. **Verify**: Run the relevant check (lint/test/build).

## Output
- A verified fix without repeated apologies.

## Strong Hints
- **Constraint**: Never apologize twice for the same problem; fix it instead.
- **Tip**: Users value working code more than polite loops.
