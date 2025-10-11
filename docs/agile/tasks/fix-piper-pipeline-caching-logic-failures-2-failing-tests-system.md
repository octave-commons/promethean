---
uuid: "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a"
title: "Fix Piper pipeline caching logic failures (2 failing tests) -system"
slug: "fix-piper-pipeline-caching-logic-failures-2-failing-tests-system"
status: "incoming"
priority: "P2"
labels: ["build-system", "caching", "piper", "testing"]
created_at: "2025-10-11T19:22:57.818Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

#incoming

## 🛠️ Description

Piper pipeline runner has 2 failing tests related to caching logic that is critical for build system performance. The caching mechanism is not properly detecting when intermediate inputs change.

**What changed?** Pipeline re-execution caching is broken - tests expect full caching on second run but getting partial execution.

**Where is the impact?** Piper package (600 lines runner.ts) affecting build system reliability and performance.

**Why now?** Build system reliability is critical for development workflow and CI/CD pipeline performance.

**Supporting context**: Test failure in `packages/piper/src/tests/runner.test.ts:432` - `res2.every((r) => r.skipped)` assertion failing.

## Goals

- Fix Piper pipeline caching logic to properly detect unchanged inputs
- Ensure build system performance through intelligent caching
- Restore reliable incremental build functionality
- Validate pipeline re-execution behavior

## Requirements

- [ ] Pipeline caching tests pass for unchanged intermediate inputs
- [ ] Content hash validation works correctly for caching decisions
- [ ] Incremental builds only execute changed steps
- [ ] Build performance remains optimal with caching enabled

## Subtasks

1. Investigate caching logic in pipeline runner
2. Fix content hash calculation for intermediate inputs
3. Debug cache invalidation and re-execution logic
4. Test various caching scenarios (content changes, file additions/removals)
5. Verify incremental build performance improvements
6. Update test expectations to match correct caching behavior
7. Add comprehensive caching test coverage

Estimate: 5

---

## 🔗 Related Epics

- [[build-system-reliability-improvements]]
- [[development-performance-optimization]]

---

## ⛓️ Blocked By

- None

## ⛓️ Blocks

- Optimize build system performance
- Implement build caching monitoring

---

## 🔍 Relevant Links

- Piper runner: `packages/piper/src/runner.ts`
- Caching tests: `packages/piper/src/tests/runner.test.ts`
- Retry logic: `packages/piper/src/tests/retry.test.ts`
- Pipeline configuration: `pipelines.json`
