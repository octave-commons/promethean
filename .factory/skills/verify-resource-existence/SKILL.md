---
name: verify-resource-existence
description: "Protocol to verify a resource exists before creating a new one."
---

# Skill: Verify Resource Existence

## Goal
Avoid creating duplicate or incorrect files by exhaustively confirming the resource does not already exist.

## Use This Skill When
- You are about to create a new file or package because a reference is missing.
- You see `Module not found` or missing import errors.
- The user insists the resource exists but you cannot find it.

## Do Not Use This Skill When
- The user explicitly asked to create a new resource from scratch.

## Steps
1. **Stop and Search**:
   - Use `glob` with `**/<name>*` to find candidates.
   - Use `grep` to search for exports or references.
2. **Check Config**:
   - Inspect workspace config (for example `pnpm-workspace.yaml`, `tsconfig.json`).
3. **Check Ignore Rules**:
   - Review `.gitignore` and `.dockerignore` for hidden files.
4. **Decide**:
   - If found, update your path or config.
   - If not found, proceed with creation.

## Output
- The existing path to the resource, or a confirmed decision to create it.

## Strong Hints
- **Constraint**: Never create a fake package to silence errors.
- **Tip**: References in code often point to the correct location.
