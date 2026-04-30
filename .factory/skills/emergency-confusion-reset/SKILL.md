---
name: emergency-confusion-reset
description: "Protocol for agents to recover when confused, hallucinating tools, or stuck in unproductive loops."
---

# Skill: Emergency Confusion Reset

## Goal
Stop unsafe or unproductive behavior, re-orient to the user's request, and resume with verified context.

## Use This Skill When
- You catch yourself using tools that do not exist.
- You are repeating the same failed attempt with no progress.
- The user says "STOP", "WRONG", or "WAIT".
- You realize you drifted from the original request.

## Do Not Use This Skill When
- The task is proceeding normally.
- A simple syntax error is clearly identified and fixable with one edit.

## Steps
1. **Stop Actions**: Stop editing files and stop running commands.
2. **Verify State**:
   - Run `git status` to inspect local changes.
   - Confirm the working directory and target files.
3. **Re-read Instructions**:
   - Re-read the original user request.
   - Re-read system and workspace constraints.
4. **Check Tools**:
   - Verify tool names and inputs against the tool list.
5. **Recover**:
   - If changes are broken, revert the file and start fresh.
   - If context is missing, run search or explore before editing.
6. **Report**:
   - State the correction and the next safe step.

## Output
- A stabilized workspace and a clear path forward.

## Strong Hints
- **Constraint**: Never guess tool names; verify once and use the exact tool.
- **Tip**: It is better to pause and re-check than to damage the codebase.
