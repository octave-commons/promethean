---
uuid: 94a2959e-21b1-4a41-9c1f-85787c1a0894
title: Format auth-service README with Prettier
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.513Z'
---
# Format auth-service README with Prettier

## Description
The `auth-service` package lint step reported Prettier formatting issues in `README.md`.

## Goals
- Apply Prettier formatting to the README to satisfy the lint script.

## Requirements
- Run `prettier --write` on `packages/auth-service/README.md`.
- Ensure lint and tests still pass.

## Subtasks
- [ ] Format `packages/auth-service/README.md` with Prettier.
- [ ] Re-run lint for the package.
```
#Todo #codex-task
```
