## 🛠️ Task: Smart Task templater

Automate creation of task files using the Obsidian **Templater** plugin or a
small CLI script. The goal is to ensure every new board item has a properly
formatted markdown stub without manual copying.

---

## 🎯 Goals

- Reduce friction when adding tasks to the Kanban board
- Enforce consistent headings and metadata across all task docs
- Optionally support command-line generation outside of Obsidian

---

## 📦 Requirements

- [ ] Use `docs/agile/templates/task.stub.template.md` as the base
- [ ] Support variable substitution for task name and tags
- [ ] Output files to `docs/agile/Tasks/`
- [ ] Document usage in `docs/agile/templates/README.md`

---

## 📋 Subtasks

- [ ] Write Templater script `templates/new-task.js`
- [ ] Or create equivalent Python script `scripts/new_task.py`
- [ ] Update board manager doc with instructions to run the templater

---

## 🔗 Related Epics

#framework-core

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [kanban](../boards/kanban.md)
