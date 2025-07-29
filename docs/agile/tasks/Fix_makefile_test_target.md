## 🛠️ Task: Fix Makefile test target

The `test-python` target points to `tests/python/` but tests live in `tests/`.

---

## 🎯 Goals
- Ensure `make test` runs all Python tests
- Prevent false confidence in CI results

---

## 📦 Requirements
- [ ] Update the Makefile target
- [ ] Document correct usage in `readme.md`

---

## 📋 Subtasks
- [ ] Modify `test-python` path
- [ ] Run `make test` locally to confirm

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
- [kanban](../boards/kanban.md)
