## 🛠️ Description

TypeScript tests in `packages/compiler` fail because relative import paths lack explicit file extensions when using `node16`/`nodenext` module resolution.

## 📦 Requirements
- Identify all relative imports in `packages/compiler` missing explicit file extensions.
- Update imports to include `.js` extensions.
- Ensure build and tests run without TS2835 errors.

## ✅ Acceptance Criteria
- `pnpm -r test` runs without TS2835 errors in `packages/compiler`.

## Tasks
- [ ] Audit `packages/compiler` for bare relative imports.
- [ ] Add `.js` extensions to import paths.
- [ ] Run tests to verify errors are resolved.

#typescript #tests
