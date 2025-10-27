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
