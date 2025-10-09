---
uuid: "452f1408-fe8c-41fb-87ab-761e8dcee2d6"
title: "fix makefile test target md"
slug: "fix_makefile_test_target"
status: "done"
priority: "P3"
labels: ["test", "target", "makefile", "tests"]
created_at: "2025-10-07T20:25:05.644Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
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
```
#codex-task #testing
```
---

## ⛓️ Blocked By
Nothing

## ⛓️ Blocks
Nothing

---

## 🔍 Relevant Links
- [[kanban]]
#done
