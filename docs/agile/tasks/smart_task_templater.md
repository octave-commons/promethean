## 🛠️ Task: Smart Task templater

Automate the creation of new task files using a command-line script. The tool
should take a task title and optional tags, generate a markdown file based on
`agile/templates/task.stub.template.md`, and place it in `docs/agile/tasks/`.
This reduces manual copying when adding cards to the kanban board.

---

## 🎯 Goals

- Speed up creation of structured task files.
- Ensure all new tasks include the standard headers and checklists.
- Allow optional tags to be inserted automatically.

---

## 📦 Requirements

- [ ] Accept task title as a required argument.
- [ ] Optional `--tags` flag appends tag lines to the new file.
- [ ] Use the stub template from `agile/templates/task.stub.template.md`.
- [ ] Generate filenames with spaces replaced by `%20` for board linking.
- [ ] Provide usage instructions in `docs/agile/AGENTS.md`.

---

## 📋 Subtasks

- [ ] Write script `scripts/new_task.py` implementing the template logic.
- [ ] Update `Makefile` with a convenience target `make new-task`.
- [ ] Document the workflow in `docs/board_sync.md`.

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
#agent-thinking
