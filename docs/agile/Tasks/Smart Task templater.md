## 🛠️ Task: Smart Task templater

Automate the creation of new task files using either the Obsidian **Templater** plugin or a small command-line script. The tool should take a task title and optional tags, generate a markdown file based on `agile/templates/task.stub.template.md`, and place it in `docs/agile/tasks/`. This ensures every new board item has a properly formatted markdown stub and reduces manual copying.

---

## 🎯 Goals

- Reduce friction when adding tasks to the Kanban board
- Enforce consistent headings and metadata across all task docs
- Allow optional tags to be inserted automatically
- Optionally support command-line generation outside of Obsidian

---

## 📦 Requirements

- [ ] Use `docs/agile/templates/task.stub.template.md` as the base
- [ ] Accept task title as a required argument
- [ ] Support variable substitution for task name and tags
- [ ] Optional `--tags` flag appends tag lines to the new file
- [ ] Generate filenames with spaces replaced by `%20` for board linking
- [ ] Output files to `docs/agile/tasks/`
- [ ] Provide usage instructions in `docs/agile/templates/README.md` and `docs/agile/AGENTS.md`

---

## 📋 Subtasks

- [ ] Write script `scripts/new_task.py` implementing the template logic or a Templater script `templates/new-task.js`
- [ ] Update the `Makefile` with a convenience target `make new-task`
- [ ] Document the workflow and templater instructions in `docs/board_sync.md`

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
#incoming
