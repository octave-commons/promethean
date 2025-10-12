---
uuid: "5f8a9b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c"
title: "Fix unified test coverage collection system"
slug: "fix-unified-test-coverage-collection-system"
status: "incoming"
priority: "P1"
labels: ["coverage", "infrastructure", "testing"]
created_at: "2025-10-12T02:22:05.425Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































#incoming

## 🛠️ Description

The unified test coverage system is reporting 0% coverage across all packages despite tests running successfully. This is blocking meaningful coverage analysis and quality metrics.

**What changed?** Coverage collection mechanism in `tools/unified-test-coverage.mjs` is not properly collecting coverage data from individual package test runs.

**Where is the impact?** Entire monorepo - affects all packages' ability to measure and track test coverage metrics.

**Why now?** Critical blocker for the testing initiative - without accurate coverage data, cannot identify gaps or measure improvement.

**Supporting context**: LCOV file contains 110,913 lines but shows 0% coverage, indicating collection rather than execution issue.

## Goals

- Restore functional coverage collection system reporting accurate metrics
- Ensure coverage data integrates properly with CI/CD pipeline
- Establish baseline coverage metrics for all packages

## Requirements

- [ ] Coverage collection reports accurate statement/branch/function coverage
- [ ] Unified coverage script works across all packages
- [ ] Coverage reports generate in multiple formats (LCOV, HTML, text)
- [ ] Coverage thresholds can be enforced in CI/CD

## Subtasks

1. Debug the `tools/unified-test-coverage.mjs` script to identify why coverage is not being collected
2. Fix coverage collection mechanism to properly instrument test runs
3. Verify coverage data is accurately aggregated from all packages
4. Update CI/CD pipeline to enforce coverage thresholds
5. Generate baseline coverage report for repository

Estimate: 3

---

## 🔗 Related Epics

- [[testing-infrastructure-overhaul]]

---

## ⛓️ Blocked By

- None

## ⛓️ Blocks

- Fix cephalon package critical test coverage gaps
- Implement coverage-based quality gates

---

## 🔍 Relevant Links

- Current unified coverage script: `tools/unified-test-coverage.mjs`
- Coverage configuration: `config/ava.config.mjs`
- LCOV output: `coverage/lcov.info`








































































































