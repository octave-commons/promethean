---
```
uuid: d3e6cca5-2b2f-4cd9-8131-db74ebe7c8f9
```
title: Clean up useless regex escape in agent package
status: todo
priority: P3
labels: []
```
created_at: '2025-09-15T02:02:58.509Z'
```
---
# Clean up useless regex escape in agent package

## Description
The `noUselessEscapeInRegex` rule flagged an unnecessary escape in `packages/agent/src/policy.ts`.

## Goals
- Remove redundant escape sequences to simplify the regex.

## Requirements
- Adjust the pattern in `globToRegExp` to avoid escaping characters that don't require it.
- Verify lint passes after the change.

## Subtasks
- [ ] Update regex in `packages/agent/src/policy.ts`.
- [ ] Ensure associated tests still pass.
```
#Todo #codex-task
```
