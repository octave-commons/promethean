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
    KanbanBoard[kanban](docs/agile/boards/kanban.md) --> LambdasTask[redefine all existing lambdas with high order functions incoming](docs/agile/tasks/redefine%20all%20existing%20lambdas%20with%20high%20order%20functions%20incoming.md)
    KanbanBoard --> DefunTask[implement defun in compiler lisp incoming](docs/agile/tasks/implement%20defun%20in%20compiler%20lisp%20incoming.md)
    KanbanBoard --> ClassesTask[implement classes in compiler lisp incoming](docs/agile/tasks/implement%20classes%20in%20compiler%20lisp%20incoming.md)

    LambdasTask --> DefunTask
    DefunTask --> ClassesTask
    ClassesTask --> Ecosystem[Lisp Ecosystem Files]
    ClassesTask --> Packages[Lisp Package Files]

    DefunTask --> ChecklistDefun[compiler-defun-checklist](docs/reports/compiler-defun-checklist.md)
    DefunTask --> GraphDefun[compiler-defun-dependency-graph](docs/reports/compiler-defun-dependency-graph.md)

    ClassesTask --> ChecklistClasses[compiler-classes-checklist](docs/reports/compiler-classes-checklist.md)
    ClassesTask --> GraphClasses[compiler-classes-dependency-graph](docs/reports/compiler-classes-dependency-graph.md)
```

---

## 📝 Notes
- **Lambda redefinition** underpins `defun`.
- **Defun** enables named functions + recursion.
- **Classes** build on `defun` and unlock OO.
- **Ecosystem + packages** depend on classes for modularity.

---

> 🌐 Use this file in Obsidian to see the **full roadmap of Lisp compiler evolution**.