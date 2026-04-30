---
name: nx-integration
description: "Use Nx to detect affected projects and run targets across multiple submodules in the workspace"
---

# Skill: Nx Integration

## Goal
Use Nx to detect affected projects and run targets across multiple submodules in the workspace.

## Use This Skill When
- You need to detect which submodules are affected by your changes
- You need to run tests or builds only for affected projects
- You need to manage multi-repo Nx projects
- You need to generate Nx project configuration for submodules

## Do Not Use This Skill When
- You are only working in a single submodule
- The submodule doesn't have an Nx configuration
- The task is unrelated to Nx operations

## Inputs
- Target to run (test, build, lint, typecheck, etc.)
- Optional files to check for changes
- Optional scope (list of projects to include/exclude)

## Steps
1. **Detect Affected**: Run `nx affected` to detect affected projects based on file changes
2. **Run Target**: Run `nx affected --target=<target>` for affected projects
3. **Generate Projects**: Use `src/giga/generate-nx-projects.ts` to create Nx configuration for submodules
4. **Bundle Plugin**: Use `tools/nx-plugins/giga/bundle-plugin.ts` to bundle Nx plugin

## Output
- List of affected projects
- Results for each affected project (test/build/lint/typecheck success/failure)
- Nx project configuration files

## Strong Hints
- **Affected Detection**: Uses file changes to detect affected projects
- **Parallel Execution**: Nx uses parallel jobs for efficiency
- **Default Scope**: Checks all projects in workspace
- **File Argument**: Pass `--files <path>` to limit to specific files
- **Scope Argument**: Pass `--projects <project>` to include/exclude specific projects

## Common Commands

### Detect Affected Projects
```bash
# List affected projects
nx affected --target=test

# Build affected projects
nx affected --target=build

# Typecheck affected projects
nx affected --target=typecheck

# Lint affected projects
nx affected --target=lint
```

### Run Target with Files
```bash
# Test only affected by specific files
nx affected --target=test --files src/some/file.ts

# Build only affected by specific files
nx affected --target=build --files src/some/file.ts
```

### Generate Nx Projects
```bash
# Generate Nx configuration for all submodules
bun run src/giga/generate-nx-projects.ts

# Bundle Nx plugin
bun run tools/nx-plugins/giga/bundle-plugin.ts
```

## References
- Nx config: `nx.json`
- Giga Nx plugin: `tools/nx-plugins/giga/`
- Generate Nx projects: `src/giga/generate-nx-projects.ts`
- Bundle plugin: `tools/nx-plugins/giga/bundle-plugin.ts`

## Important Constraints
- **Nx Configuration**: Submodules must have `nx.json` to use Nx
- **Affected Detection**: Requires file changes to detect affected projects
- **Parallel Execution**: Nx uses parallel jobs for efficiency (default: 8)
- **Scope**: By default, checks all projects in workspace
- **Target Order**: Prefers test before build when both specified

## Error Handling
- **No Nx Config**: Submodules without `nx.json` will be skipped
- **Build Failures**: Script exits with code 1 on build failures
- **Test Failures**: Script exits with code 1 on test failures
- **Nx Errors**: Nx errors are propagated to the command

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

## Integration with Giga System
- **Giga Watch**: Uses `nx affected --target=test --files` to run affected tests
- **Commit Propagator**: Uses Nx for affected test/build detection
- **Nx Plugin**: Bundles Nx plugin for workspace-level project graph
- **Project Graph**: Giga system maintains project graph for affected detection
