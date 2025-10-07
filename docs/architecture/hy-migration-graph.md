---
project: Promethean
hashtags: #knowledge-graph, #hy, #migration, #python-ban
---

# 🧩 Knowledge Graph — Hy Migration High-Level

This graph provides a high-level overview of the Hy migration initiative.

---

## 🔗 Obsidian Graph View
```mermaid
graph TD
    KanbanBoard[[docs/agile/boards/kanban.md]] --> TaskFile[[docs/agile/tasks/Replace all python properly with hy incoming.md]]

    TaskFile --> Checklist[[docs/reports/hy-migration-checklist.md]]
    TaskFile --> DependencyGraph[[docs/reports/hy-migration-dependency-graph.md]]

    Checklist --> CoreRules[Core Rules]
    Checklist --> ServiceMigrations[Service Migrations]
    Checklist --> Tooling[Build + Tooling]
    Checklist --> Docs[Documentation]
```

---

## 📝 Notes
- **Kanban → Task → Checklist/Graph** flow captured.
- Tracks four main streams: core rules, service migrations, tooling, docs.
- Everything converges on banning Python and enforcing Hy.

---

> 🌐 Use this file in Obsidian to view the **Hy migration cluster** at a glance.