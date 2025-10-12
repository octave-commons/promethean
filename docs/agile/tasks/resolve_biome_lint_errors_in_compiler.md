---
uuid: "9124fbc4-92c2-4b37-a234-95dc28dd17ff"
title: "Resolve Biome lint errors in compiler package"
slug: "resolve_biome_lint_errors_in_compiler"
status: "todo"
priority: "P3"
labels: ["biome", "compiler", "errors", "lint"]
created_at: "2025-10-12T02:22:05.427Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































# Resolve Biome lint errors in compiler package

## Description
`packages/compiler` fails Biome lint with multiple errors including `useTemplate`, `noUselessUndefinedInitialization`, `noCommaOperator`, `noNonNullAssertion`, `noSwitchDeclarations`, and `noUnusedImports`.

## Goals
- Address all Biome errors so `pnpm --filter @promethean/compiler lint` passes.

## Requirements
- Refactor code to satisfy each listed Biome rule.
- Maintain existing functionality and test coverage.

## Subtasks
- [ ] Replace string concatenation with template literals.
- [ ] Remove unnecessary `undefined` initializations.
- [ ] Eliminate comma operator usage.
- [ ] Remove non-null assertions where possible.
- [ ] Scope switch-case declarations correctly.
- [ ] Drop unused imports.
```
#Todo #codex-task
```








































































































