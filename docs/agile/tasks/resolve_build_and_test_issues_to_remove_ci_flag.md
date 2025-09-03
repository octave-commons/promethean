## 🛠️ Task: Resolve build and test issues to remove CI flag

Identify and fix TypeScript errors causing `pnpm -r test` to fail so the test workflow can run without `continue-on-error`.

---

## 🎯 Goals
- Remove `continue-on-error` from `.github/workflows/test.yml`
- Achieve passing `pnpm -r test` across all packages

---

## 📦 Requirements
- [ ] Fix missing file extensions in imports
- [ ] Provide proper TypeScript type annotations
- [ ] Ensure all tests pass locally

---

## 📋 Subtasks
- [ ] Address TypeScript errors in `packages/compiler`
- [ ] Run `pnpm -r test` and verify success
- [ ] Update CI workflow to remove `continue-on-error`

---

## 🔗 Related Epics
#codex-task #testing

---

## ⛓️ Blocked By
Nothing

## ⛓️ Blocks
Nothing

---

## 🔍 Relevant Links
- [test workflow](../../.github/workflows/test.yml)

#Todo
