---
name: workspace-typecheck
description: "Type check all TypeScript files across the entire workspace, including all submodules under orgs/**, using strict TypeScript settings"
---

# Skill: Workspace Typecheck

## Goal
Type check affected TypeScript projects across the workspace using Nx affected detection, with a full-run fallback available.

## Use This Skill When
- You need to verify type safety across multiple repositories
- You are about to commit changes and want to ensure type compliance
- You want to catch type errors before running build or tests

## Do Not Use This Skill When
- You are only working in a single submodule and can run its own typecheck
- The change is unrelated to TypeScript files

## Inputs
- File paths to typecheck (default: affected files from git working tree + staged + untracked)
- Nx target (default: `typecheck`)

## Steps
1. Run `pnpm typecheck` to execute Nx affected typecheck
2. Script uses `scripts/nx-affected.mjs` to collect uncommitted changes
3. Runs `nx affected --target=typecheck` with the computed file list
4. Use `pnpm typecheck:all` to force a full run

## Output
- Type error summary
- File paths, line numbers, and error messages
- Exit code 1 if any type errors found, 0 otherwise

## Strong Hints
- **TypeScript Strict**: Uses strict mode with all type-checking options enabled
- **Target**: ES2022 module system
- **No Any**: No `any` types allowed
- **Explicit Types**: All parameters must have explicit types
- **ReadOnly**: Prefer `readonly` parameters where appropriate
- **Sync Submodules**: Typecheck may fail if submodules have issues

## Common Commands

### Typecheck Affected Workspace Files
```bash
# Typecheck affected projects
pnpm typecheck

# Full run across all projects
pnpm typecheck:all
```

### Typecheck Specific Submodule
```bash
# Navigate to submodule and run its typecheck
cd orgs/riatzukiza/promethean
pnpm typecheck

# Or from workspace root
cd orgs/riatzukiza/promethean && pnpm typecheck
```

## References
- Typecheck runner: `scripts/nx-affected.mjs`
- Nx config: `nx.json`

## Important Constraints
- **TypeScript Strict**: Uses strict mode with all type-checking options enabled
- **Target**: ES2022 module system
- **No Any**: No `any` types allowed
- **Explicit Types**: All parameters must have explicit types
- **ReadOnly**: Prefer `readonly` parameters where appropriate
- **Submodule State**: Typecheck may fail if submodules have uncommitted changes or issues

## Error Handling
- **Uncommitted Changes**: Submodules with uncommitted changes may fail typechecking
- **Dependency Issues**: Missing dependencies in submodules cause failures
- **Type Errors**: Script exits with code 1 on any type errors
- **Build Issues**: Typecheck runs before build; build failures may be related to types

## Output Format
```
❌ /path/to/file.ts:42:5 error: Type 'string' is not assignable to type 'number'.
❌ /path/to/file.ts:78:12 error: Parameter 'x' implicitly has an 'any' type.
```
