---
uuid: 87654321-4321-4321-4321-cba987654321
title: Integration Test Task - Low Coverage
status: testing
priority: P1
tags: [test, integration, low-coverage]
created: 2025-10-15T20:00:00Z
updated: 2025-10-15T20:00:00Z
---

# Integration Test Task - Low Coverage

This task tests the testing→review transition with low coverage.

## Testing Information

coverage-report: test-integration/low-coverage-final.lcov
executed-tests: coverage-analyzer-test
requirement-mappings: [{"requirementId": "REQ-001", "testIds": ["coverage-analyzer-test"]}]

## Description

This is a test task to validate that the testing→review transition rule correctly blocks transitions when coverage is low (below 90%).

## Acceptance Criteria

- [x] Coverage report generated
- [x] Some tests passing
- [ ] Coverage below 90% - should block transition
- [ ] Ready for review
