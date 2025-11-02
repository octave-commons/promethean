---
project: Promethean
hashtags: [#migration, #persistence, #dualstore, #graph]
---

# 🔗 Persistence Dependency Graph

This diagram shows the evolution of persistence dependencies in Promethean services.

---

## ❌ Before Migration (Legacy State)
```mermaid
graph TD
    Cephalon --> CollectionManager
    Cephalon --> ContextManager
    SmartGPTBridge --> DualSink
    SmartGPTBridge --> mongo.js
    DiscordEmbedder --> MongoClient
    KanbanProcessor --> MongoClient
    MarkdownGraph --> MongoClient
    CodexContext --> MongoClient
    Migrations --> MongoClient
```

---

## ✅ After Migration (Target State)
```mermaid
graph TD
    subgraph SharedPersistence[Shared Persistence Module]
        DualStore
        ContextStore
    end

    Cephalon --> DualStore
    Cephalon --> ContextStore
    SmartGPTBridge --> DualStore
    DiscordEmbedder --> DualStore
    KanbanProcessor --> DualStore
    MarkdownGraph --> DualStore
    CodexContext --> DualStore
    Migrations --> DualStore
```

---

## 📊 Progress Heatmap
```mermaid
gantt
    title Persistence Migration Progress
    dateFormat  YYYY-MM-DD
    section Services
    Cephalon            :done,    des1, 2025-08-01, 5d
    SmartGPT Bridge     :active,  des2, 2025-08-01, 15d
    Discord-embedder    :active,  des3, 2025-08-05, 15d
    Kanban Processor    :active,  des4, 2025-08-05, 15d
    Markdown Graph      :active,  des5, 2025-08-07, 10d
    Codex Context       :crit,    des6, 2025-08-10, 20d
    Migration Scripts   :crit,    des7, 2025-08-10, 20d
```

Legend:
- ✅ **done** = fully migrated (Cephalon)
- 🔄 **active** = partially migrated (Bridge, Embedder, Kanban, Markdown Graph)
- ⚠️ **crit** = untouched/raw Mongo (Codex, Migrations)

---

> 🌍 Once migration is complete, *all services converge on a single shared persistence layer*, simplifying maintenance and ensuring consistent behavior across Promethean.