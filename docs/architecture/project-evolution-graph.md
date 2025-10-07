---
project: Promethean
hashtags: $#knowledge-graph, #evolution, #hy, #dualstore, #compiler$
---

# 🧩 Master Knowledge Graph — Project Evolution

This graph connects the three major Promethean initiatives: **Hy Migration**, **DualStore Migration**, and **Lisp Compiler Evolution**.

---

## 🔗 Obsidian Graph View
```mermaid
graph TD
    KanbanBoard[[docs/agile/boards/kanban.md]] --> HyMigration[[docs/architecture/hy-migration-graph.md]]
    KanbanBoard --> DualStoreMigration[[docs/architecture/persistence-migration-graph.md]]
    KanbanBoard --> CompilerEvolution[[docs/architecture/compiler-evolution-graph.md]]

    HyMigration --> HyChecklist[[docs/reports/hy-migration-checklist.md]]
    HyMigration --> HyGraph[[docs/reports/hy-migration-dependency-graph.md]]

    DualStoreMigration --> PersistenceChecklist[[docs/reports/persistence-migration-checklist.md]]
    DualStoreMigration --> PersistenceGraph[[docs/reports/persistence-dependency-graph.md]]

    CompilerEvolution --> DefunChecklist[[docs/reports/compiler-defun-checklist.md]]
    CompilerEvolution --> ClassesChecklist[[docs/reports/compiler-classes-checklist.md]]
    CompilerEvolution --> DefunGraph[[docs/reports/compiler-defun-dependency-graph.md]]
    CompilerEvolution --> ClassesGraph[[docs/reports/compiler-classes-dependency-graph.md]]
```

---

## 📝 Notes
- This meta-graph shows **all three strategic migrations/evolutions**.
- Each major initiative links to its own subgraph cluster.
- Use this view to track Promethean’s **long-term architectural direction**.

---

> 🌐 In Obsidian, this file becomes the *strategic overview map* for Promethean’s roadmap.