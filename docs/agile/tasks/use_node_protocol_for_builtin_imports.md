# Use `node:` protocol for builtin imports

## Description
Biome flagged `useNodejsImportProtocol` violations where Node.js builtins like `path` and `url` are imported without the `node:` prefix in `packages/codex-context`.

## Goals
- Ensure all Node.js builtin modules use the `node:` import protocol.

## Requirements
- Locate imports of core Node modules without `node:`.
- Update imports to include `node:` prefix and adjust tests.

## Subtasks
- [ ] Fix imports in `packages/codex-context` `ecosystem.config.js`.
- [ ] Audit other packages for missing `node:` prefixes.

#Todo #codex-task
