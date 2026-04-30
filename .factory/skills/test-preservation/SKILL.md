---
name: test-preservation
description: "Protocol to forbid deleting or skipping tests to make builds pass."
---

# Skill: Test Preservation

## Goal
Keep test coverage intact by fixing code or updating expectations instead of deleting tests.

## Use This Skill When
- A test fails and you are tempted to remove or skip it.
- You think a test is outdated but the behavior still matters.

## Do Not Use This Skill When
- You are intentionally replacing a test with a new one that covers the same behavior.

## Steps
1. **Read the Failure**: Identify expected vs actual.
2. **Fix Code First**: Try to fix the implementation.
3. **Validate Test**: If behavior changed intentionally, update the test.
4. **Preserve Coverage**: If a test must be removed, replace it with an equivalent check.

## Output
- Passing tests with preserved coverage.

## Strong Hints
- **Constraint**: Never delete `*.test.*` or `*.spec.*` files without a replacement.
- **Tip**: Failing tests are precise bug reports.
