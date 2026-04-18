---
name: break-edit-loop
description: "Protocol to break out of repetitive, failing edit loops by forcing analysis over action."
---

# Skill: Break Edit Loop

## Goal
Stop repeated failing edits and switch to analysis so the fix targets the root cause.

## Use This Skill When
- You edited the same file three times and the error remains.
- `lsp_diagnostics` reports the same error after your fix.
- You are trying random syntax changes to see what sticks.

## Do Not Use This Skill When
- Errors are changing and you are clearly making progress.

## Steps
1. **Stop Editing**: Do not touch the file again yet.
2. **Revert if Needed**: Restore the file to a known good state if it is messy.
3. **Analyze**:
   - Read the exact error message and its location.
   - Find the type definitions or examples that match the failing code.
4. **Search for Patterns**:
   - Use `grep` or `glob` to find working examples in the repo.
5. **Plan**:
   - Write the fix in plain English before coding.
   - If you still cannot solve it, delegate to a specialist agent.

## Output
- A single, verified fix that addresses the root error.

## Strong Hints
- **Constraint**: After three failures, you must change strategy.
- **Tip**: Random changes are not debugging; they are noise.
