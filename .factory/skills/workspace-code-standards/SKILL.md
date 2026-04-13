---
name: workspace-code-standards
description: "Apply workspace TypeScript and ESLint standards, including functional style and strict typing rules"
---

# Skill: Workspace Code Standards

## Goal
Apply workspace TypeScript and ESLint standards consistently across the repo.

## Use This Skill When
- You are writing or refactoring TypeScript in this workspace.
- The user asks about code style or linting standards.
- You need to align changes with repository conventions.

## Do Not Use This Skill When
- The task is documentation-only and no code changes are needed.
- You are working in an external repo with different standards.

## Inputs
- Target file paths and language (TypeScript, JavaScript).
- Existing lint/typecheck errors (if any).

## Standards
- **ESM only**: No `require` or `module.exports`.
- **Functional style**: Prefer `const`, avoid `let`, no classes.
- **TypeScript strict**: No `any`, explicit types, prefer `readonly` parameters.
- **Import order**: builtin -> external -> internal -> sibling -> index.
- **Function limits**: Max 100 lines per function, 15 cognitive complexity.
- **Parameter limits**: Max 4 parameters per function.
- **File limits**: Max 600 lines per file.
- **No default exports**: Prefer named exports.
- **Avoid try/catch**: Use safer patterns when possible.
- **Bun APIs**: Prefer Bun-native APIs (for example `Bun.file()`) when available.

## Strong Hints
- ESLint uses functional, sonarjs, and promise plugins.
- TypeScript targets ES2022 with CommonJS module output.

## Output
- Code that follows workspace lint and typecheck conventions.
- A short note if any standard could not be met.

## Related Skills
- `workspace-lint`
- `workspace-typecheck`

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[workspace-lint](../workspace-lint/SKILL.md)**
- **[workspace-typecheck](../workspace-typecheck/SKILL.md)**
