---
name: testing-general
description: "Apply testing best practices, choose appropriate test types, and establish reliable test coverage across the codebase"
---

# Skill: Testing General

## Goal
Apply testing best practices, choose appropriate test types, and establish reliable test coverage across the codebase.

## Use This Skill When
- Starting a new test suite or adding tests to a project
- Deciding what tests to write for a feature
- Reviewing test coverage or quality
- Establishing testing standards for a new module
- The user asks about testing strategies or patterns

## Do Not Use This Skill When
- Only adding a simple assertion to an existing test file
- The test framework is already set up and working
- You only need to run existing tests (use `workspace-build` skill)

## Testing Pyramid

```
        /\
       /E2E\        ← Few, slow, comprehensive
      /─────\
     /Integration\  ← Medium, moderate coverage
    /─────────────\
   /   Unit Tests  \ ← Many, fast, focused
  /─────────────────\
```

- **Unit tests**: 70-80% of tests, single function/class, mock dependencies
- **Integration tests**: 15-25% of tests, multiple components, real integrations
- **E2E tests**: 5-10% of tests, full user flows, critical paths only

## Test Characteristics

### Good Tests Follow FIRST
- **Fast**: Complete in milliseconds, run on every change
- **Isolated**: No dependencies between tests, can run in any order
- **Repeatable**: Consistent results, no flaky behavior
- **Self-validating**: Pass/fail with clear output, no manual inspection
- **Timely**: Written with or before the code they test

### Test Naming Convention
```
test('should do something when condition', ...)
test('does not do something when condition', ...)
test('returns expected value when input is X', ...)
```

## When to Use Each Test Type

| Test Type | Use When | Example |
|-----------|----------|---------|
| Unit | Testing single function/class | `add(2, 3) === 5` |
| Integration | Multiple components working together | Database queries + cache |
| E2E | Complete user workflows | Login → Search → Checkout |

## Test File Organization

```
src/
├── component.ts
├── component.test.ts      # Unit tests
├── component.integration.test.ts  # Integration tests
└── __tests__/
    └── e2e/               # E2E tests (optional)
```

## Workspace Testing Standards
- Use `sleep` from the test utils instead of `setTimeout`.
- Mock at module boundaries with `esmock`.
- Place tests in `src/tests/` when following workspace conventions.
- Keep tests deterministic and parallel-friendly.

## Mocking Strategy

| Layer | Tool | Use For |
|-------|------|---------|
| Unit | vitest mocks, jest mocks | External APIs, time, random |
| Integration | Test containers, in-memory DBs | Databases, message queues |
| E2E | Real services (with fixtures) | External APIs, payment gateways |

## Common Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Testing implementation | Breaks on refactor | Test behavior, not implementation |
| Over-mocking | Tests don't reflect reality | Mock boundaries only |
| Async without await | Flaky tests | Always await async assertions |
| Long test files | Hard to maintain | Split into focused tests |
| No assertions | Tests pass vacuously | Add meaningful assertions |

## Test Coverage Guidelines

- Aim for 80%+ line coverage on critical paths
- 100% coverage on utilities and helpers
- Don't chase coverage on trivial code (getters, simple types)
- Focus on behavior coverage, not line coverage

## Running Tests

```bash
# Run all tests in workspace
pnpm test

# Run affected tests only
nx affected --target=test

# Run tests in specific submodule
cd orgs/org/package && pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch
```

## Output
- Test files following workspace conventions
- Appropriate test types for the code under test
- Clear, maintainable test code
- Proper mocking and fixtures

## References
- Workspace test utilities: `packages/test-utils`
- Vitest docs: https://vitest.dev/
- Ava docs: https://github.com/avajs/ava
- Nx testing: https://nx.dev/recipes/testing

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[workspace-build](../workspace-build/SKILL.md)**
