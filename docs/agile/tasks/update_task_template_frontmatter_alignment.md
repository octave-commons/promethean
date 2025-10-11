---
uuid: "f5553298-1c51-41c2-acb5-df4d9f518c89"
title: "Align task template frontmatter with canonical schema"
slug: "update_task_template_frontmatter_alignment"
status: "done"
priority: "P2"
labels: ["automation", "docs"]
created_at: "2025-10-11T03:39:14.524Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

#InProgress

## 🛠️ Description

Update the shared task stub template so that new notes start with the canonical task metadata, generate the metadata automatically via Templater, and make sure the downstream kanban regeneration still works with the new structure.

---

## 🎯 Goals

- [x] Replace the legacy template frontmatter with the canonical task schema
- [x] Populate required fields with Templater helpers and emit the matching status hashtag
- [x] Demonstrate that board regeneration recognizes a note created from the updated template

---

## 📦 Requirements

- [x] Mirror the schema shown in `docs/agile/tasks/task-generator-system.md`
- [x] Leverage `tp.user.uuidv4()` and `tp.date.now(...)` to prefill identifiers and timestamps
- [x] Capture verification evidence after regenerating the board

---

## 📋 Subtasks

- [x] Draft and review the new template content
- [x] Create a fresh task note using the new template for validation
- [x] Run the board regeneration workflow and confirm the task appears

---

## 🧮 Story Points

2

---

## 🔗 Related Epics

- [[kanban]]

---

## ⛓️ Blocked By

- None

## ⛓️ Blocks

- None

---

## 🔍 Relevant Links

- `docs/agile/templates/task.stub.template.md`
- `docs/agile/tasks/task-generator-system.md`
- `node packages/kanban/dist/index.js regenerate`
