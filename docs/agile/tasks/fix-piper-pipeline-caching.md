---
$$
uuid: 8b57e951-99d2-4242-a56d-578a3f11cda6
$$
title: Fix Piper pipeline caching regressions
$$
status: in_progress
$$
priority: P2
labels:
  - piper
  - pipelines
$$
created_at: '2025-09-28T23:20:35.509916+00:00'
$$
$$
updated_at: '2025-09-29T00:13:42+00:00'
$$
---
## 🛠️ Task: Fix Piper pipeline caching regressions

### Context
- AVA runner tests `runPipeline executes steps and caches on second run` and `runPipeline re-executes only affected steps when an intermediate input changes` are failing.
- Both failures report that the second pipeline run does not read from cache (expected `true`, observed `false`).
- Resolving this is necessary to keep Piper's caching contract intact and unblock the test suite.

### Definition of Done
- [x] Identify the regression preventing cache hits on the second pipeline run.
- [ ] Add or update automated coverage to guard against the regression.
- [x] Ensure `pnpm test --filter @promethean/piper` passes locally.
- [x] Document findings and remediation in this task note.

### Plan
1. Reproduce the failing AVA tests locally and trace pipeline cache metadata for the affected steps.
2. Inspect Piper runner cache key generation and cache read logic for regressions introduced since the last passing state.
3. Implement fixes ensuring pipeline steps skip execution when cached data is valid.
4. Update or extend tests if needed and re-run the Piper package test suite.

### References
- `packages/piper/src/runner.ts`
- `packages/piper/src/tests/runner.test.ts`
- `packages/piper/src/cache/*`

### Notes
- Persist both content and mtime output hashes for each step so cache mode changes do not invalidate stored fingerprints.
- `shouldSkip` now compares against hash values keyed by mode, preventing mismatches when switching between content and mtime hashing.
- Reworked the file-tree dev-ui test to spin up the server lazily and record API calls via `sessionStorage`, eliminating orphaned watchers when filtering test runs.
- Re-ran the previously failing runner tests and the dev-ui file-tree scenario to confirm caching and watcher behaviour are both green.
