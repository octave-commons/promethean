---
name: giga-workflow
description: "Execute Giga system operations for workspace automation, including watching changes, running submodule tests, and propagating commits"
---

# Skill: Giga Workflow

## Goal
Execute Giga system operations for workspace automation, including watching changes, running submodule tests, and propagating commits.

## Use This Skill When
- You need to watch `orgs/**` for changes and run affected tests/builds
- You need to run a specific target (test/build/typecheck/lint) in a submodule
- You need to propagate submodule changes to parent repositories
- You need to generate commit messages using Pantheon

## Do Not Use This Skill When
- You are only editing documentation in `docs/`
- You are working in a single non-submodule directory
- The change is unrelated to workspace automation

## Inputs
- Submodule path to operate on (e.g., `orgs/riatzukiza/promethean`)
- Target to run (test, build, typecheck, lint)
- Optional commit message generator (Pantheon CLI)
- Watch mode flag for continuous monitoring

## Steps
1. **For Giga Watch**:
   - Start `bun run src/giga/giga-watch.ts`
   - Script watches `orgs/**` for changes
   - Automatically runs affected tests/builds
   - Commits changes and propagates submodule pointers

2. **For Single Submodule Target**:
   - Use `bun run src/giga/run-submodule.ts <subPath> <target>`
   - Script detects package manager (bun/pnpm/yarn/npm)
   - Runs matching script or falls back to Nx/test/typecheck strategies
   - Returns exit code 0 on success, 1 on failure

3. **For Commit Propagation**:
   - Run `bun run src/giga/commit-propagator.ts`
   - Commits staged changes in submodule
   - Generates commit message (Pantheon or fallback summarizer)
   - Tags commit with `giga/v<version>/<action>/<result>/<id>`
   - Propagates submodule pointer to parent repos

4. **For Pantheon Commit Messages**:
   - Set `PANTHEON_CLI=<cli-path>` environment variable
   - Run `bun run src/giga/pantheon.ts <action> <result> <repoPath> [version]`
   - Pantheon CLI receives JSON with action, result, version, affectedFiles
   - Returns generated commit message or falls back to summarizer

## Output
- Updated submodule code with test/build results
- Commit messages with Pantheon AI or fallback summaries
- Submodule pointer updates in parent repositories
- Tagged commits for traceability

## Strong Hints
- **Bun.watch**: Requires `Bun.watch` (unavailable on some platforms) - script falls back to manual mode
- **Parallel Jobs**: Use `SUBMODULE_JOBS=<n>` environment variable to control parallel execution (default: 8)
- **Affected Tests**: When using Giga watch with Nx, prefers `nx affected --target=test` before `build`
- **Dirty Snapshot**: When workspace gets chaotic, capture everything on `dirty/stealth` branch (git checkout + commit, skip typecheck)
- **Tag Format**: Tags use pattern `giga/v<version>/<action>/<result>/<id>` for traceability
- **Commit Messages**: Pantheon CLI receives JSON input; supports dry-run for previewing

## Common Commands

### Watch for Changes
```bash
# Start Giga watch (background or foreground)
bun run src/giga/giga-watch.ts

# Use custom job count
SUBMODULE_JOBS=4 bun run src/giga/giga-watch.ts
```

### Run Submodule Target
```bash
# Test a submodule
bun run src/giga/run-submodule.ts orgs/riatzukiza/promethean test

# Build a submodule
bun run src/giga/run-submodule.ts orgs/sst/opencode build

# Typecheck a submodule
bun run src/giga/run-submodule.ts orgs/bhauman/clojure-mcp typecheck

# Lint a submodule
bun run src/giga/run-submodule.ts orgs/moofone/codex-ts-sdk lint
```

### Propagate Submodule Changes
```bash
# Commit submodule changes and propagate to parent repos
bun run src/giga/commit-propagator.ts

# Use custom Pantheon CLI
PANTHEON_CLI="pantheon" bun run src/giga/commit-propagator.ts

# Dry-run to preview changes
PANTHEON_CLI="pantheon --dry-run" bun run src/giga/commit-propagator.ts
```

### Generate Commit Message
```bash
# Use Pantheon CLI for AI commit message
PANTHEON_CLI="pantheon" bun run src/giga/pantheon.ts "watch-test" "success" "orgs/riatzukiza/promethean" "v1.0.0"

# Fallback summary
bun run src/giga/pantheon.ts "watch-build" "success" "orgs/sst/opencode" "v2.0.0"
```

## References
- Giga watch script: `src/giga/giga-watch.ts`
- Run submodule script: `src/giga/run-submodule.ts`
- Commit propagator: `src/giga/commit-propagator.ts`
- Pantheon generator: `src/giga/pantheon.ts`
- Smart commit: `src/submodule/smart-commit.ts`
- Giga Nx plugin: `tools/nx-plugins/giga/`
