---
uuid: "fa9f4bd8-6483-4fd5-ae2c-21cac022df31"
title: "Duck Revival Epic"
slug: "fix-ts2835-relative-import-paths"
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
