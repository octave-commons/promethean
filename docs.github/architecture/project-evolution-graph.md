---
project: Promethean
hashtags: #knowledge-graph, #evolution, #hy, #dualstore, #compiler
---

# 🧩 Master Knowledge Graph — Project Evolution

This graph connects the three major Promethean initiatives: **Hy Migration**, **DualStore Migration**, and **Lisp Compiler Evolution**.

---

## 🔗 Obsidian Graph View
```mermaid
graph TD
    KanbanBoard[kanban](docs/agile/boards/kanban.md) --> HyMigration[hy-migration-graph](docs/architecture/hy-migration-graph.md)
    KanbanBoard --> DualStoreMigration[persistence-migration-graph](docs/architecture/persistence-migration-graph.md)
    KanbanBoard --> CompilerEvolution[compiler-evolution-graph](docs/architecture/compiler-evolution-graph.md)

    HyMigration --> HyChecklist[hy-migration-checklist](docs/reports/hy-migration-checklist.md)
    HyMigration --> HyGraph[hy-migration-dependency-graph](docs/reports/hy-migration-dependency-graph.md)

    DualStoreMigration --> PersistenceChecklist[persistence-migration-checklist](docs/reports/persistence-migration-checklist.md)
    DualStoreMigration --> PersistenceGraph[persistence-dependency-graph](docs/reports/persistence-dependency-graph.md)

    CompilerEvolution --> DefunChecklist[compiler-defun-checklist](docs/reports/compiler-defun-checklist.md)
    CompilerEvolution --> ClassesChecklist[compiler-classes-checklist](docs/reports/compiler-classes-checklist.md)
    CompilerEvolution --> DefunGraph[compiler-defun-dependency-graph](docs/reports/compiler-defun-dependency-graph.md)
    CompilerEvolution --> ClassesGraph[compiler-classes-dependency-graph](docs/reports/compiler-classes-dependency-graph.md)
```

---

## 📝 Notes
- This meta-graph shows **all three strategic migrations/evolutions**.
- Each major initiative links to its own subgraph cluster.
- Use this view to track Promethean’s **long-term architectural direction**.

---

> 🌐 In Obsidian, this file becomes the *strategic overview map* for Promethean’s roadmap.