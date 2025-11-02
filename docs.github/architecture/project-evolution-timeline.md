---
project: Promethean
hashtags: [#timeline, #roadmap, #evolution]
---

# 🗓️ Project Evolution Timeline

A high-level timeline of Promethean’s three major initiatives: **Hy Migration**, **DualStore Migration**, and **Lisp Compiler Evolution**.

---

## 📊 Timeline View
```mermaid
gantt
    title Promethean Strategic Timeline
    dateFormat  YYYY-MM-DD
    section Hy Migration
    Core Rules + Tooling    :active,  des1, 2025-08-15, 15d
    Service Ports           :crit,    des2, 2025-08-20, 20d
    CI + Docs Enforcement   :crit,    des3, 2025-09-05, 10d

    section DualStore Migration
    Cephalon + MarkdownGraph:done,    des4, 2025-08-10, 10d
    Bridge + Embedder       :active,  des5, 2025-08-20, 15d
    Kanban Processor        :active,  des6, 2025-08-22, 15d
    Migration Scripts + Docs:crit,    des7, 2025-09-01, 20d

    section Lisp Compiler Evolution
    Redefine Lambdas        :active,  des8, 2025-08-15, 15d
    Implement Defun         :active,  des9, 2025-08-20, 15d
    Implement Classes       :crit,    des10, 2025-08-25, 20d
    Ecosystem + Packages    :crit,    des11, 2025-09-05, 25d
```

---

## 📝 Notes
- **Hy Migration**: rules + service ports must finish before Python ban is enforced.
- **DualStore**: Cephalon done, Bridge/Embedder/Kanban in progress, scripts last.
- **Compiler**: lambdas + defun unlock classes, which unlock ecosystem/packages.

---

> 🌍 Use this file in Obsidian for a timeline view of Promethean’s evolution roadmap.