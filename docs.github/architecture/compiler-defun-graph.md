---
project: Promethean
hashtags: #knowledge-graph, #compiler, #lisp, #defun
---

# 🧩 Knowledge Graph — Lisp `defun`

This graph connects the artifacts related to implementing `defun` in the Lisp compiler.

---

## 🔗 Obsidian Graph View
```mermaid
graph TD
    KanbanBoard[kanban](docs/agile/boards/kanban.md) --> TaskFile[implement defun in compiler lisp incoming](docs/agile/tasks/implement%20defun%20in%20compiler%20lisp%20incoming.md)
    TaskFile --> Checklist[compiler-defun-checklist](docs/reports/compiler-defun-checklist.md)
    TaskFile --> DependencyGraph[compiler-defun-dependency-graph](docs/reports/compiler-defun-dependency-graph.md)

    Checklist --> Lambdas[Redefine Lambdas]
    Checklist --> Classes[Implement Classes]
    Checklist --> Ecosystem[Lisp Ecosystem Files]
    Checklist --> Packages[Lisp Package Files]

    DependencyGraph --> Defun[Defun Implementation]
```

---

## 📝 Notes
- **Kanban board** links card → task → reports.
- **Task file** defines rationale + requirements.
- **Checklist** tracks substeps.
- **Dependency graph** shows relation to lambdas, classes, ecosystem, packages.

---

> 🌐 Use this file in Obsidian to visualize the `defun` initiative and its role in the Lisp compiler roadmap.