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

#Todo #codex-task
