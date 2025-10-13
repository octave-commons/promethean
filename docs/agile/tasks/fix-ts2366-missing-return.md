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
