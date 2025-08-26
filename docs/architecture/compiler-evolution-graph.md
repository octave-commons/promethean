---
project: Promethean
tags:
  - knowledge-graph
  - compiler
  - lisp
  - project-evolution
---

# 🧩 Knowledge Graph — Lisp Compiler Evolution

This graph connects all major tasks in the Lisp compiler evolution: lambdas, defun, classes, ecosystem, and packages.

---

## 🔗 Obsidian Graph View
```mermaid
graph TD
    KanbanBoard[[docs/agile/boards/kanban.md]] --> LambdasTask[[docs/agile/tasks/redefine all existing lambdas with high order functions incoming.md]]
    KanbanBoard --> DefunTask[[docs/agile/tasks/implement defun in compiler lisp incoming.md]]
    KanbanBoard --> ClassesTask[[docs/agile/tasks/implement classes in compiler lisp incoming.md]]

    LambdasTask --> DefunTask
    DefunTask --> ClassesTask
    ClassesTask --> Ecosystem[Lisp Ecosystem Files]
    ClassesTask --> Packages[Lisp Package Files]

    DefunTask --> ChecklistDefun[[docs/reports/compiler-defun-checklist.md]]
    DefunTask --> GraphDefun[[docs/reports/compiler-defun-dependency-graph.md]]

    ClassesTask --> ChecklistClasses[[docs/reports/compiler-classes-checklist.md]]
    ClassesTask --> GraphClasses[[docs/reports/compiler-classes-dependency-graph.md]]
```

---

## 📝 Notes
- **Lambda redefinition** underpins `defun`.
- **Defun** enables named functions + recursion.
- **Classes** build on `defun` and unlock OO.
- **Ecosystem + packages** depend on classes for modularity.

---

> 🌐 Use this file in Obsidian to see the **full roadmap of Lisp compiler evolution**.