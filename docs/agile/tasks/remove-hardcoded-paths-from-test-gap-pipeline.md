```
uuid: 289210ba-0f7e-471f-88f1-703528a116ea
```
title: remove hardcoded paths from test-gap pipeline
status: todo
priority: P1
labels: ["pipeline", "test-gap", "portability"]
```
created_at: '2025-10-07T01:00:44Z'
```
---
## 🛠️ Description
Restore portability of the `test-gap` pipeline by replacing hard-coded absolute paths with repo-relative references that work in any workspace.

## 🧠 Pseudocode
```pseudo
open pipelines.json
for each test-gap step
  identify arguments containing "/home/err/devel/promethean"
  replace absolute roots with relative equivalents (e.g. packages, .cache/testgap)
ensure resulting commands mirror packages/testgap/pipelines.json
save file without altering unrelated sections
optionally add regression test that rejects absolute paths in pipeline definitions
```

## 📦 Requirements
- Update every `test-gap` step in `pipelines.json` to use relative paths.
- Keep argument quoting intact for glob patterns.
- Prevent future regressions (lint, test, or schema update).

## ✅ Acceptance Criteria
- `pnpm --filter @promethean/testgap tg:all` succeeds from any repo checkout location.
- No occurrences of `/home/err/devel/promethean` remain in pipeline configs.
- Added safeguard fails when new absolute paths are introduced.

## Tasks

- [ ] Refactor pipeline commands to use relative paths.
- [ ] Add regression guard (lint, unit test, or schema constraint).
- [ ] Run relevant pipeline commands to validate behaviour.

## Relevent resources
- `pipelines.json`
- `packages/testgap/pipelines.json`
- `packages/testgap/src/` utilities for path handling

## Comments
Document decisions about path handling so future contributors avoid reintroducing absolutes.

## Story Points

- Estimate: 3
- Assumptions: Commands remain compatible with existing scripts.
- Dependencies: Access to coverage artifacts when running the pipeline.
