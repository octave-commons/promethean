---
uuid: "c39b94ff-9e97-4fba-99d9-5cc713e09e5d"
title: "file explorer"
slug: "file-explorer"
status: "done"
priority: "P3"
labels: ["explorer", "file", "permission", "search"]
created_at: "2025-10-11T03:39:14.375Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Description

Provide a lightweight file explorer for navigating repository contents through the agent interface.

---

## 🎯 Goals

- Browse directories and open file previews.
- Search for files by name within allowed scope.

---

## 📦 Requirements

- [x] Read-only navigation respecting permission rules.
- [x] Search functionality with fuzzy matching.
- [x] Clear error messages for restricted paths.

---

## 📋 Subtasks

- [ ] Outline UX and permission constraints.
- [x] Implement backend API for listing and reading files.
- [x] Add UI component or chat command for navigation. ✅ 2025-09-13
- [x] Include tests covering permission and search cases.
- [x] Document usage with examples.

---

## 🔗 Related Epics
```
#framework-core
```
---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[kanban]]
- [c39b94ff-file-explorer|Review findings 2025-09-30]


## Notes
- Tests or documentation are missing; acceptance criteria not fully met.
- Story Points: 5

#ready
