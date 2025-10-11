---
uuid: "87278205-437a-4b02-a2ca-84426c8c864a"
title: "Relax ESLint configuration to convert errors to warnings for developer productivity"
slug: "Relax ESLint configuration to convert errors to warnings for developer productivity"
status: "incoming"
priority: "P1"
labels: ["eslint", "errors", "warnings", "relax"]
created_at: "2025-10-11T03:39:14.371Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

The current ESLint configuration is too strict and blocking development. Need to relax rules to improve developer velocity:

## Current Major Issues Identified:

### High-impact rules to convert to warnings:
1. **@typescript-eslint/consistent-type-definitions** - interface vs type preference (44+ errors)
2. **@typescript-eslint/no-explicit-any** - any types in complex/external code (50+ errors)  
3. **@typescript-eslint/no-unsafe-* rules** - TypeScript safety warnings (100+ errors)
4. **max-lines** and **max-lines-per-function** - Code length limits (20+ errors)
5. **complexity** and **sonarjs/cognitive-complexity** - Complexity limits (15+ errors)
6. **@typescript-eslint/require-await** - unused await in async functions (10+ errors)
7. **import/order** - Import ordering (stylistic, 50+ warnings)

### Rules to keep as errors (critical):
- **@typescript-eslint/no-misused-promises** - Actual logical errors
- **@typescript-eslint/switch-exhaustiveness-check** - Missing switch cases  
- **@typescript-eslint/no-base-to-string** - Object stringification issues

## Relevant Files:
- [[eslint.config.mjs]] - Root ESLint configuration
- [[eslint.config.ts]] - Alternative ESLint config format

### Strategy:
1. Update root ESLint config to downgrade non-critical rules to warnings
2. Focus package-by-package cleanup on critical errors only
3. Enable auto-fix for stylistic issues
4. Set reasonable complexity limits (25 instead of 15)
5. Increase line limits (500 instead of 300 for files, 100 for functions)

Priority: P1 - Unblock development workflow
