## 🛠️ Task: Update GitHub Actions to use makefile

Our CI scripts currently duplicate install and build logic. By invoking the
Makefile we can keep the workflow files minimal and ensure local and CI steps
stay in sync.

---

## 🎯 Goals

- Delegate build and test steps to `make` commands.
- Reduce maintenance overhead when build logic changes.
- Demonstrate usage of the Makefile in automation.

---

## 📦 Requirements

- [ ] Add `make ci` target that installs deps and runs tests.
- [ ] Modify existing workflow files to call `make ci`.
- [ ] Ensure matrix jobs still set up language runtimes properly.

---

## 📋 Subtasks

- [ ] Implement `make ci` in the Makefile.
- [ ] Update `.github/workflows/test.yml` (or equivalents) to use it.
- [ ] Remove redundant install commands from workflows.
- [ ] Verify workflows pass locally via `act` or remote run.

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
