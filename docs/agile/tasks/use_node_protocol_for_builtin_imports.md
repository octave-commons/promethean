---
uuid: "77011385-81b7-42aa-9137-cd522a63910e"
title: "Use `node:` protocol for builtin imports"
slug: "use_node_protocol_for_builtin_imports"
status: "testing"
priority: "P3"
labels: ["node", "imports", "use", "protocol"]
created_at: "2025-09-15T02:02:58.523Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

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
```
#Todo #codex-task
```
