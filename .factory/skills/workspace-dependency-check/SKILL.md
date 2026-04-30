---
name: workspace-dependency-check
description: "Protocol to diagnose pnpm workspace module resolution failures."
---

# Skill: Workspace Dependency Check

## Goal
Identify why a package cannot be resolved in a pnpm workspace and apply the correct fix.

## Use This Skill When
- You see `Module not found` or `ERR_MODULE_NOT_FOUND` in a workspace.
- A local package import fails in a monorepo.

## Do Not Use This Skill When
- You are installing a public registry package for the first time.

## Steps
1. **Locate Package**:
   - Find the package `package.json` and confirm its `name`.
2. **Check Workspace Config**:
   - Ensure `pnpm-workspace.yaml` includes the package path.
3. **Check Build Outputs**:
   - Confirm `main`/`exports` point to existing files.
4. **Check Consumer**:
   - Verify the consumer lists the dependency in `package.json`.
5. **Fix**:
   - Add the dependency or build the target package as needed.

## Output
- A clear diagnosis and a correct fix action.

## Strong Hints
- **Constraint**: Never install a local workspace package from the public registry.
- **Tip**: `exports` blocks can prevent deep imports that are not explicitly exported.
