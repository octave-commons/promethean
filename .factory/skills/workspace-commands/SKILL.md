---
name: workspace-commands
description: "Run common workspace-level commands for linting, typechecking, building, and utilities"
---

# Skill: Workspace Commands

## Goal
Run common workspace-level commands for linting, typechecking, building, and utilities.

## Use This Skill When
- The user asks for workspace command quick reference.
- You need to run `pnpm lint`, `pnpm typecheck`, `pnpm test`, or `pnpm build`.
- You need to run the utility script at `src/hack.ts`.

## Do Not Use This Skill When
- The task is confined to a single submodule with its own scripts.
- The request is about creating OpenCode commands (use `opencode-command-authoring`).

## Inputs
- Command category (lint, typecheck, build, utility).
- Optional flags or arguments.

## Steps
1. Select the command from the quick reference list.
2. Run the command from the workspace root.
3. Report success or failures with any follow-up actions.

## Quick Reference
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build:all
pnpm test:all
pnpm run build:octavia
bun run src/hack.ts
```

## Output
- Command output and exit status.
- Follow-up guidance if errors occur.

## Related Skills
- `workspace-lint`
- `workspace-typecheck`
- `workspace-build`

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[opencode-command-authoring](../opencode-command-authoring/SKILL.md)**
- **[workspace-build](../workspace-build/SKILL.md)**
- **[workspace-lint](../workspace-lint/SKILL.md)**
- **[workspace-typecheck](../workspace-typecheck/SKILL.md)**
