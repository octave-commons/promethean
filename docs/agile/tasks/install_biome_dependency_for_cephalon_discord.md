# Install Biome dependency for cephalon-discord

## Description
`pnpm -r lint` failed in `packages/cephalon-discord` because `@biomejs/biome` was not found.

## Goals
- Ensure the package has Biome installed so linting can run.

## Requirements
- Add `@biomejs/biome` to `packages/cephalon-discord` dev dependencies.
- Verify `pnpm --filter @promethean/cephalon-discord lint` runs successfully.

## Subtasks
- [ ] Update `package.json` for `cephalon-discord` with Biome dependency.
- [ ] Commit lockfile changes if necessary.
- [ ] Run the package lint script to confirm.

#Todo #codex-task
