---
project: Promethean
hashtags: $#knowledge-graph, #compiler, #lisp, #defun$
---

# 🧩 Knowledge Graph — Lisp `defun`

This graph connects the artifacts related to implementing `defun` in the Lisp compiler.

---

## 🔗 Obsidian Graph View
```mermaid
graph TD
    KanbanBoard[[docs/agile/boards/kanban.md]] --> TaskFile[[docs/agile/tasks/implement defun in compiler lisp incoming.md]]
    TaskFile --> Checklist[[docs/reports/compiler-defun-checklist.md]]
    TaskFile --> DependencyGraph[[docs/reports/compiler-defun-dependency-graph.md]]

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