---
name: workspace-lint
description: "Lint all TypeScript and markdown files across the entire workspace, including all submodules under orgs/**"
---

# Skill: Workspace Lint

## Goal
Lint affected TypeScript and markdown files across the workspace using Nx affected detection, with a full-run fallback available.

## Use This Skill When
- You need to verify code quality across multiple repositories
- You are about to commit changes and want to ensure lint compliance
- You want to check for common ESLint violations before pushing

## Do Not Use This Skill When
- You are only working in a single submodule and can run its own lint
- The change is unrelated to TypeScript or markdown files

## Inputs
- File paths to lint (default: affected files from git working tree + staged + untracked)
- Lint options (if any from workspace scripts)

## Steps
1. Run `pnpm lint` to lint affected projects
2. Script uses `scripts/nx-affected.mjs` to collect uncommitted changes
3. Runs `nx affected --target=lint` with the computed file list
4. Use `pnpm lint:all` to force a full run

## Output
- Lint error/warning summary
- File paths and line numbers for each violation
- Exit code 1 if any lint errors found, 0 otherwise

## Strong Hints
- **ESM Only**: Script enforces ESM modules (no require/module.exports)
- **Functional Style**: Prefers const, avoids let, no classes
- **TypeScript Strict**: No any types, explicit types, readonly parameters
- **Import Order**: builtin → external → internal → sibling → index
- **Line Limits**: Max 100 lines per function, 15 cognitive complexity
- **File Limits**: Max 600 lines per file
- **Sync Submodules**: Lint may fail if submodules have uncommitted changes or issues

## Common Commands

### Lint Affected Workspace Files
```bash
# Lint affected projects
pnpm lint

# Full run across all projects
pnpm lint:all

# Lint all markdown files
pnpm lint:md

# Lint markdown in notes directory
pnpm lint:md:notes

# Lint markdown in agent files
pnpm lint:md:agent

# Lint markdown in agent SDK files
pnpm lint:md:agent:sdk
```

### Lint Specific Submodule
```bash
# Navigate to submodule and run its lint
cd orgs/riatzukiza/promethean
pnpm lint

# Or from workspace root
cd orgs/riatzukiza/promethean && pnpm lint
```

## References
- Lint runner: `scripts/nx-affected.mjs`
- ESLint config: `eslint.config.mjs`
- Nx config: `nx.json`

## Important Constraints
- **ESM Modules**: Script enforces ESM modules (no CommonJS require/module.exports)
- **Functional Programming**: Prefers const, avoids let, no classes
- **TypeScript Strict**: No any types, explicit types, readonly parameters
- **Import Order**: Strict ordering: builtin → external → internal → sibling → index
- **Function Complexity**: Max 100 lines per function, 15 cognitive complexity
- **File Size**: Max 600 lines per file
- **Submodule State**: Lint may fail if submodules have uncommitted changes or issues

## Error Handling
- **Uncommitted Changes**: Submodules with uncommitted changes may fail linting
- **Dependency Issues**: Missing dependencies in submodules cause failures
- **Type Errors**: TypeScript errors are caught by typecheck, but lint runs independently
- **Lint Errors**: Script exits with code 1 on any lint errors

## Output Format
```
❌ /path/to/file.ts:42:5 error: no-const-assign
❌ /path/to/file.ts:78:12 warning: prefer-const
```
