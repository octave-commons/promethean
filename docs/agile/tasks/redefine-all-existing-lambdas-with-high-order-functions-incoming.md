---
```
uuid: 9a9e9c97-fbaa-4580-90ac-2d1f17eebbec
```
title: redefine all existing lambdas with high order functions incoming
status: todo
priority: P3
labels: []
```
created_at: '2025-09-15T02:02:58.518Z'
```
---
## 🛠️ Description

Replace ad‑hoc anonymous lambdas with well‑named higher‑order functions to clarify intent and improve reuse.

---

## 🎯 Goals

- Reduce ambiguous inline lambdas throughout the codebase
- Establish reusable helpers that capture shared closure logic

---

## 📦 Requirements

- [ ] Each former lambda extracted into a named function or higher‑order wrapper
- [ ] Added tests cover behavior of new helpers

---

## 📋 Subtasks

- [ ] Audit modules for deeply nested lambdas
- [ ] Refactor candidate lambdas into named functions
- [ ] Create higher‑order utilities where closures are required
- [ ] Update references and run tests

---
## 🧮 Story Points

5

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
```
#framework-core #Ready
```

