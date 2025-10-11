---
uuid: "a7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d"
title: "Implement tiered timeout strategy for different test types"
slug: "implement-tiered-timeout-strategy-for-test-types"
status: "incoming"
priority: "P2"
labels: ["testing", "infrastructure", "timeouts", "configuration"]
created_at: "2025-10-11T01:03:32.221Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























#incoming

## 🛠️ Description

Current test configuration uses a uniform 30-second timeout for all tests, which is inappropriate for integration and E2E tests that naturally take longer. Need tiered timeout strategy based on test type and complexity.

**What changed?** One-size-fits-all timeout approach is causing failures for legitimate long-running tests while not catching genuinely stuck unit tests quickly enough.

**Where is the impact?** All packages using AVA test runner, affecting test reliability and CI/CD pipeline performance.

**Why now?** Essential for test reliability - unit tests should fail fast, integration tests need appropriate time, E2E tests require longer timeouts.

**Supporting context**: Current config in `config/ava.config.mjs` sets `timeout: "30s"` globally, but SmartGPT bridge and DocOps tests need longer, while unit tests should fail faster.

## Goals

- Implement tiered timeout configuration for different test categories
- Improve test failure detection speed for unit tests
- Provide adequate time for integration and E2E tests
- Reduce CI/CD pipeline time through appropriate timeout settings

## Requirements

- [ ] Unit tests timeout after 10 seconds (fast failure)
- [ ] Integration tests timeout after 60 seconds
- [ ] E2E tests timeout after 3 minutes
- [ ] Performance tests have configurable timeouts up to 10 minutes
- [ ] Timeout configuration is automatic based on test file patterns

## Subtasks

1. Analyze existing test execution times to categorize appropriate timeout values
2. Create test type detection based on file patterns and directory structure
3. Implement tiered AVA configuration with conditional timeout settings
4. Update package-specific AVA configs to use appropriate timeouts
5. Add timeout override mechanism for exceptional cases
6. Document timeout strategy and guidelines for developers
7. Update CI/CD pipeline to respect tiered timeouts
8. Monitor test execution times and adjust thresholds as needed

Estimate: 5

---

## 🔗 Related Epics

- [[testing-infrastructure-overhaul]]
- [[ci-cd-performance-optimization]]

---

## ⛓️ Blocked By

- None

## ⛓️ Blocks

- Resolve SmartGPT bridge test timeouts
- Resolve DocOps performance timeout issues
- Optimize test execution performance

---

## 🔍 Relevant Links

- Current AVA config: `config/ava.config.mjs`
- Package AVA configs: `packages/*/ava.config.mjs`
- Test patterns: Various test files across packages
- CI/CD configuration: `.github/workflows/`

























