---
uuid: "b4fe8ca1-a8d6-4c43-98c4-59035b7bfa95"
title: "Duck Revival Epic"
slug: "fix-ts7006-implicit-any-types"
status: "incoming"
priority: "P2"
labels: ["task"]
created_at: "2025-10-23T00:00:00.000Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Description

Tests for `packages/compiler` report TS7006 errors due to parameters implicitly having an `any` type.

## 📦 Requirements
- Provide explicit type annotations for parameters flagged by TS7006.
- Prefer stricter types over `any` where possible.
- Verify builds succeed after adding types.

## ✅ Acceptance Criteria
- `pnpm -r test` runs without TS7006 errors in `packages/compiler`.

## Tasks
- [ ] Find all parameters in `packages/compiler` with implicit `any` types.
- [ ] Add appropriate type annotations.
- [ ] Run tests to confirm errors are resolved.

#typescript #tests
