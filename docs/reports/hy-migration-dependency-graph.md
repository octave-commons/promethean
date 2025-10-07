---
project: Promethean
hashtags: $#migration, #hy, #python-ban, #graph$
---

# 🔗 Hy Migration Dependency Graph

This diagram shows the dependency state for the Hy migration.

---

## ❌ Before Migration (Legacy State)
```mermaid
graph TD
    PythonServices[Python-based Services] --> CoreSystem
    PythonLibs[Python Libraries] --> CoreSystem
    Cephalon --> PythonServices
    SmartGPTBridge --> PythonServices
    DiscordEmbedder --> PythonLibs
    KanbanProcessor --> PythonLibs
    MarkdownGraph --> PythonLibs
```

---

## ✅ After Migration (Target State)
```mermaid
graph TD
    HyServices[Hy-based Services] --> DistPython[Compiled ./dist Python]
    HyLibs[Hy Libraries] --> DistPython

    Cephalon --> HyServices
    SmartGPTBridge --> HyServices
    DiscordEmbedder --> HyLibs
    KanbanProcessor --> HyLibs
    MarkdownGraph --> HyLibs

    DistPython --> CoreSystem
```

---

## 📊 Progress Heatmap
```mermaid
gantt
    title Hy Migration Progress
    dateFormat  YYYY-MM-DD
    section Services
    Cephalon            :active,  des1, 2025-08-20, 15d
    SmartGPT Bridge     :active,  des2, 2025-08-20, 15d
    Discord-embedder    :crit,    des3, 2025-08-21, 20d
    Kanban Processor    :crit,    des4, 2025-08-21, 20d
    Markdown Graph      :crit,    des5, 2025-08-22, 20d
```

Legend:
- ✅ done = migrated to Hy
- 🔄 active = partial migration
- ⚠️ crit = still in Python

---

> 🌍 Goal: *zero raw Python source* — everything in Hy, compiled into `./dist` for runtime compatibility.