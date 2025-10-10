---
uuid: "05a6aec0-c595-44c8-8dba-49eac198344f"
title: "document board sync workflow md md"
slug: "document_board_sync_workflow"
status: "done"
priority: "P3"
tags: ["sync", "board", "document", "workflow"]
created_at: "2025-10-10T03:23:55.971Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







## 🛠️ Task: Document board sync workflow

After the sync script exists, we need clear instructions on how to use it and how the GitHub Projects board maps to our local kanban.

---

## 🎯 Goals

- Provide step-by-step usage instructions
- Explain column mappings and limitations
- Encourage contributors to keep both boards in sync

---

## 📦 Requirements

- [x] Add documentation under `docs/` describing setup
- [x] Include example command invocations
- [x] Mention required GitHub permissions

---

## 📋 Subtasks

- [x] Write README section or new doc
- [x] Describe expected workflow
- [x] Link to the sync script

---

## ✅ Completion Notes

Created comprehensive `docs/agile/board_sync.md` documentation covering:

- **Architecture overview** of bidirectional sync between local kanban and GitHub
- **Automated workflows** (daily sync, GitHub Issues sync)
- **Manual operations** with CLI commands and examples
- **Configuration** details for environment variables and process YAML
- **Column mappings** between kanban statuses and GitHub labels
- **Required permissions** and troubleshooting guide
- **Best practices** for maintaining sync integrity

The documentation provides complete setup instructions, usage examples, and troubleshooting guidance for contributors to effectively use the board sync system.

---

## 🔗 Related Epics

```
#framework-core
```

---

## ⛓️ Blocked By

- Write board sync script

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[kanban]]
- [Board Sync Workflow]../../board_sync.md

#archive






