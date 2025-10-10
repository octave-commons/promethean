---
uuid: "cc373a25-f288-4def-8ced-b824cc72c06a"
title: "Remove `any` types across packages"
slug: "remove_any_types_across_packages"
status: "testing"
priority: "P3"
tags: ["any", "types", "packages", "remove"]
created_at: "2025-10-10T03:23:55.970Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







# Remove `any` types across packages

## Description
`pnpm -r lint` reports many `noExplicitAny` warnings in packages like `agent`, `codex-context`, and `compiler`.

## Goals
- Improve type safety by replacing `any` with explicit types.

## Requirements
- Identify all `noExplicitAny` lint warnings.
- Refactor code to use specific types or generics.

## Subtasks
- [ ] Replace `any` usages in `packages/agent`.
- [ ] Replace `any` usages in `packages/codex-context` tests and types.
- [ ] Replace `any` usages in `packages/compiler`.
```
#Todo #codex-task
```






