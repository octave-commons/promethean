---
uuid: 137054cb-d7c9-4b0a-9aa9-5ce0425948db
title: Resolve ESLint violations across repository
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.519Z'
---
# Resolve ESLint violations across repository

## Description
Multiple packages trigger ESLint errors such as `functional/prefer-immutable-types`, `functional/no-let`, and other functional rules. Inline disables have started appearing, but we prefer configuration changes or code refactors over ad‑hoc ignores.

## Goals
- Audit the entire repo for ESLint failures.
- Remove or minimize inline `eslint-disable` comments.
- Update [[eslint.config.ts]] to reflect agreed rule adjustments.
- Document complex rule decisions for future contributors.

## Requirements
- Run `pnpm lint` in a CI-like environment.
- Group violations by rule and propose fixes.
- Prefer config updates or pattern changes over blanket disables.
- Record any rules that remain unmet with rationale.

## Subtasks
- [ ] Execute repository-wide lint and capture all rule failures.
- [ ] Categorize issues and identify recurring patterns.
- [ ] Draft config changes in [[eslint.config.ts]] to address systemic problems.
- [ ] Refactor code or add utilities where patterns recur.
- [ ] Create documentation summarizing unresolved or complex rules.

#Todo #codex-task #doc-this

