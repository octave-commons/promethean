---
uuid: 0427985f-f4ad-4f85-975f-9c085bcc452a
title: Install Biome dependency for cephalon-discord
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.515Z'
---
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
```
#Todo #codex-task
```
