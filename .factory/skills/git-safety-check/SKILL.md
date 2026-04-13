---
name: git-safety-check
description: "Protocol to ensure safe git operations and avoid detached HEAD or dirty commits."
---

# Skill: Git Safety Check

## Goal
Prevent destructive git states like detached HEAD or unintended commits on the wrong branch.

## Use This Skill When
- You are about to rebase, reset, or change branches.
- You are unsure which branch is active.
- You see merge conflicts or history divergence warnings.

## Do Not Use This Skill When
- You are only staging known changes and committing on the correct branch.

## Steps
1. **Check Status**: Run `git status`.
2. **Confirm Branch**: Run `git branch --show-current`.
3. **Handle Detached HEAD**:
   - Create a branch immediately to preserve work.
4. **Confirm Remotes**:
   - Check `git remote -v` if you need to push.
5. **Submodule Awareness**:
   - If a submodule is dirty, enter it and handle it separately.

## Output
- A clean working tree on the intended branch.

## Strong Hints
- **Constraint**: Never force push unless explicitly authorized.
- **Tip**: Detached HEAD commits are easy to lose.
