---
name: lint-gate
description: "Protocol to enforce zero lint/type errors before marking work done."
---

# Skill: Lint Gate

## Goal
Prevent tasks from being marked complete when lint or type errors remain.

## Use This Skill When
- You finished edits and want to verify readiness.
- LSP or CI shows lint/type errors.

## Do Not Use This Skill When
- You are in the middle of a refactor (but fix errors before completion).

## Steps
1. **LSP Check**: Run `lsp_diagnostics` on modified files.
2. **Type Check**: Run the workspace typecheck command.
3. **Lint**: Run the workspace lint command.
4. **Fix Errors**: Resolve root causes, do not suppress.

## Output
- No lint or type errors.

## Strong Hints
- **Constraint**: Never use `@ts-ignore` or `eslint-disable` to bypass valid errors.
- **Tip**: Type errors often reveal logic bugs.
