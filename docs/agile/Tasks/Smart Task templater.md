## 🛠️ Task: Smart Task templater

<<<<<<< HEAD
Automate creation of task files using the Obsidian **Templater** plugin or a
small CLI script. The goal is to ensure every new board item has a properly
formatted markdown stub without manual copying.
=======
Automate the creation of new task files using a command-line script. The tool
should take a task title and optional tags, generate a markdown file based on
`agile/templates/task.stub.template.md`, and place it in `docs/agile/tasks/`.
This reduces manual copying when adding cards to the kanban board.
>>>>>>> main

---

## 🎯 Goals

<<<<<<< HEAD
- Reduce friction when adding tasks to the Kanban board
- Enforce consistent headings and metadata across all task docs
- Optionally support command-line generation outside of Obsidian
=======
- Speed up creation of structured task files.
- Ensure all new tasks include the standard headers and checklists.
- Allow optional tags to be inserted automatically.
>>>>>>> main

---

## 📦 Requirements
<<<<<<< HEAD

- [ ] Use `docs/agile/templates/task.stub.template.md` as the base
- [ ] Support variable substitution for task name and tags
- [ ] Output files to `docs/agile/tasks/`
- [ ] Document usage in `docs/agile/templates/README.md`
=======
- [ ] Accept task title as a required argument.
- [ ] Optional `--tags` flag appends tag lines to the new file.
- [ ] Use the stub template from `agile/templates/task.stub.template.md`.
- [ ] Generate filenames with spaces replaced by `%20` for board linking.
- [ ] Provide usage instructions in `docs/agile/AGENTS.md`.
>>>>>>> main

---

## 📋 Subtasks
<<<<<<< HEAD

- [ ] Write Templater script `templates/new-task.js`
- [ ] Or create equivalent Python script `scripts/new_task.py`
- [ ] Update board manager doc with instructions to run the templater
=======
- [ ] Write script `scripts/new_task.py` implementing the template logic.
- [ ] Update `Makefile` with a convenience target `make new-task`.
- [ ] Document the workflow in `docs/board_sync.md`.
>>>>>>> main

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
#blocked
