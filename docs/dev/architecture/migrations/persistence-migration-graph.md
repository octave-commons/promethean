---
tags:
  - knowledge-graph 
  - dualstore 
  - migration 
  - persistence
---

# 🧩 Knowledge Graph — DualStore Migration High-Level

This graph provides a high-level overview of the persistence migration initiative.

---

## 🔗 Obsidian Graph View
```mermaid
graph TD
    KanbanBoard[[docs/agile/boards/kanban.md]] --> TaskFile[[docs/agile/tasks/Agent Tasks Persistence Migration to DualStore.md]]

    TaskFile --> Checklist[[docs/reports/persistence-migration-checklist.md]]
    TaskFile --> DependencyGraph[[docs/reports/persistence-dependency-graph.md]]

    Checklist --> Cephalon[Cephalon]
    Checklist --> Bridge[SmartGPT Bridge]
    Checklist --> DiscordEmbedder[Discord-embedder]
    Checklist --> KanbanProcessor[Kanban Processor]
    Checklist --> MarkdownGraph[Markdown Graph]
    Checklist --> CodexContext[Codex Context]
    Checklist --> MigrationScripts[Migration Scripts]
```

---

## 📝 Notes
- **Kanban → Task → Checklist/Graph** flow captured.
- Tracks all services migrating away from raw Mongo.
- Everything converges on `DualStore` + `ContextStore`.

---

> 🌐 Use this file in Obsidian to view the **DualStore migration cluster** at a glance.