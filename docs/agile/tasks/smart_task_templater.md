---
uuid: "58e246ed-a8e3-4942-bf8d-73532959156e"
title: "smart task templater md"
slug: "smart_task_templater"
status: "breakdown"
priority: "P3"
labels: ["templater", "smart", "command", "line"]
created_at: "2025-10-11T01:03:32.221Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🛠️ Description
```
**Status:** blocked
```
Automate the creation of new task files using a command-line script or Obsidian Templater so every Kanban card has a properly formatted markdown stub.

---

## 🎯 Goals

- Reduce friction when adding tasks to the Kanban board.
- Ensure consistent headings and metadata across all task docs.
- Optionally support command-line generation outside of Obsidian.

---

## 📦 Requirements

- [ ] Use `docs/agile/templates/task.stub.template.md` as the base.
- [ ] Accept task title as a required argument.
- [ ] Optional `--tags` flag appends tag lines to the new file.
- [ ] Output files to `docs/agile/tasks/` with spaces encoded for board links.
- [ ] Document usage in `docs/agile/AGENTS.md`.

---

## 📋 Subtasks

- [ ] Implement script `scripts/new_task.py` performing template substitution.
- [ ] Add `make new-task` target for convenience.
- [ ] Update `docs/board_sync.md` with workflow instructions.

---

## 🔗 Related Epics
```
#framework-core
```
---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[kanban]]

#breakdown

## Blockers
- No active owner or unclear scope

























