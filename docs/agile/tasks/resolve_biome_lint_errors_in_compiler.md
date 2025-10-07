---
$$
uuid: 9124fbc4-92c2-4b37-a234-95dc28dd17ff
$$
title: Resolve Biome lint errors in compiler package
status: todo
priority: P3
labels: []
$$
created_at: '2025-09-15T02:02:58.519Z'
$$
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
$$
#Todo #codex-task
$$
