# Folder Guide: scripts/

Purpose: Task-specific or ad-hoc automation used by maintainers and agents for builds, linting, migrations, and diagnostics.

What belongs

- One-off or narrowly scoped scripts (lint guards, doc generators, migrations, validation helpers).
- Development utilities that don’t warrant a packaged tool.

Keep out

- Reusable libraries (see packages/).
- Deployable services (see services/).
- Long-lived repo tools or generators (see tools/).

Notes

- Keep scripts small and single-purpose; document usage in comments or README.md.
- If a script becomes broadly reused, promote it to tools/ or a CLI package.

## RELEVANT SKILLS
These skills are configured for this directory's technology stack and workflow.

### clojure-namespace-architect
Resolves Clojure namespace-path mismatches and classpath errors with definitive path conversion

### clojure-quality
Auto-fix Clojure delimiters and validate syntax with OpenCode tools.

### clojure-syntax-rescue
Protocol to recover from Clojure/Script syntax errors, specifically bracket mismatches and EOF errors.

### test-preservation
Protocol to forbid deleting or skipping tests to make builds pass.

### testing-bun
Set up and write tests using Bun's built-in test runner for maximum performance and TypeScript support

### testing-clojure-cljs
Set up and write tests for Clojure and ClojureScript projects using cljs.test, cljs-init-tests, and shadow-cljs

### testing-e2e
Write end-to-end tests that verify complete user workflows and critical system paths across the full stack

### testing-general
Apply testing best practices, choose appropriate test types, and establish reliable test coverage across the codebase

### testing-integration
Write integration tests that verify multiple components work together correctly with real dependencies

### testing-nx
Configure and run tests across multiple projects using Nx affected detection for efficient workspace testing

### testing-typescript-ava
Set up and write tests using Ava test runner for TypeScript with minimal configuration and fast execution

### testing-typescript-vitest
Set up and write tests using Vitest for TypeScript projects with proper configuration and TypeScript support

### testing-unit
Write fast, focused unit tests for individual functions, classes, and modules with proper isolation and mocking

### work-on-in_progress-task
Execute the best next work for a task currently in `in_progress`.

### work-on-todo-task
Execute the best next work for a task currently in `todo`.

### workspace-lint
Lint all TypeScript and markdown files across the entire workspace, including all submodules under orgs/**

### workspace-typecheck
Type check all TypeScript files across the entire workspace, including all submodules under orgs/**, using strict TypeScript settings

