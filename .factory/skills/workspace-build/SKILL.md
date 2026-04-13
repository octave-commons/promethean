---
name: workspace-build
description: "Build all affected submodules across the workspace, including running tests for changed files, using Nx for affected project detection"
---

# Skill: Workspace Build

## Goal
Build affected submodules across the workspace using Nx affected detection, with a full-run fallback available.

## Use This Skill When
- You need to build all affected submodules after making changes
- You want to verify build success across multiple repositories
- You need to run tests for affected files before committing

## Do Not Use This Skill When
- You are only working in a single submodule and can run its own build
- The change is unrelated to the codebase being built

## Inputs
- File paths to check for changes (default: affected files from git working tree + staged + untracked)
- Target to run (build)

## Steps
1. Run `pnpm build` to build affected submodules
2. Script uses `scripts/nx-affected.mjs` to collect uncommitted changes
3. Runs `nx affected --target=build` with the computed file list
4. Use `pnpm build:all` to force a full run

## Output
- Build/test summary for each affected submodule
- Exit code 0 if all builds succeed, 1 if any fail

## Strong Hints
- **Affected Tests**: Prefer `nx affected --target=test` before `build`
- **Files Argument**: Pass `--files <path>` to limit to specific files
- **Parallel Execution**: Uses Nx's parallel execution for efficiency
- **Workspace Root**: Run from workspace root to detect changes correctly
- **Nx Config**: Uses `nx.json` from workspace root

## Common Commands

### Build Affected Submodules
```bash
# Build affected submodules
pnpm build

# Build all submodules
pnpm build:all

# Build with specific files
nx affected --target=build --files src/some/file.ts
```

### Build Specific Submodule
```bash
# Navigate to submodule and build
cd orgs/riatzukiza/promethean
pnpm build

# Build with Nx
nx build
```

## References
- Nx config: `nx.json`
- Giga Nx plugin: `tools/nx-plugins/giga/`
- Build runner: `scripts/nx-affected.mjs`

## Important Constraints
- **Affected Detection**: Only builds submodules affected by your changes
- **Parallel Execution**: Nx uses parallel jobs for efficiency
- **File Changes**: Run from workspace root to detect changes correctly
- **Nx Config**: Uses `nx.json` from workspace root
- **Build Order**: Nx handles dependency order automatically

## Error Handling
- **Build Failures**: Script exits with code 1 on build failures
- **Test Failures**: Script exits with code 1 on test failures
- **Dependency Issues**: Missing dependencies cause build failures
- **Nx Errors**: Nx errors are propagated to the build script

## Output Format
```
nx affected --target=test --build
> nx affected --target=test --build

orgs/riatzukiza/promethean
  test: success
  build: success

orgs/sst/opencode
  test: success
  build: success
```
