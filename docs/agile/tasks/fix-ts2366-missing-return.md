---
uuid: 'ts2366-fix-0001-0000-0000-000000000001'
title: 'Fix TS2366 missing return'
slug: 'fix-ts2366-missing-return'
status: 'todo'
priority: 'P2'
labels: ['typescript', 'compiler', 'bugs', 'ts2366']
created_at: '2025-10-23T00:00:00.000Z'
estimates:
  complexity: ''
  scale: ''
  time_to_completion: ''
---

## 🛠️ Description

One or more functions in `packages/compiler` trigger TS2366 because they lack an ending return statement or have an incorrect return type.

## 📦 Requirements

- Review functions flagged by TS2366.
- Add appropriate return statements or adjust return types to include `undefined` where valid.
- Ensure updated functions pass type checking.

## ✅ Acceptance Criteria

- `pnpm -r test` runs without TS2366 errors in `packages/compiler`.

## Tasks

- [ ] Locate functions missing return statements or with incorrect return types.
- [ ] Implement returns or adjust type signatures.
- [ ] Run tests to verify errors are resolved.

#typescript #tests
