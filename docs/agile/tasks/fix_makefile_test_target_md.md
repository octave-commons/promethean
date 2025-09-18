---
uuid: 452f1408-fe8c-41fb-87ab-761e8dcee2d6
title: fix makefile test target md
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.513Z'
---
## 🛠️ Task: Fix Makefile test target

The `test-python` target originally pointed to `tests/python/` but tests live in `tests/`.
Update the path so that `pytest` runs against `tests/`.

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
- [[kanban]]
#done

