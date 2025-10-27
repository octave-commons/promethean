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
    KanbanBoard[kanban](docs/agile/boards/kanban.md) --> TaskFile[Replace all python properly with hy incoming](docs/agile/tasks/Replace%20all%20python%20properly%20with%20hy%20incoming.md)

    TaskFile --> Checklist[hy-migration-checklist](docs/reports/hy-migration-checklist.md)
    TaskFile --> DependencyGraph[hy-migration-dependency-graph](docs/reports/hy-migration-dependency-graph.md)

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