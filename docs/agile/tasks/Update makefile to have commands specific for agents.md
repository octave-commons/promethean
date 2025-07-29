## 🛠️ Task: Update makefile to have commands specific for agents

Extend the project Makefile with helper commands for managing individual
agents. Each agent should have shortcuts for install, run and clean steps so
contributors can work on them without affecting the rest of the repo.

---

## 🎯 Goals

- Provide `make agent-<name>` style commands to start a specific agent.
- Simplify setup with `make install-<name>` for agent dependencies.
- Keep the Makefile readable and documented.

---

## 📦 Requirements

- [ ] Discover all agent entry points in `agents/`.
- [ ] Add `install`, `start` and `clean` targets per agent.
- [ ] Document the commands in `agents/README.md`.

---

## 📋 Subtasks

- [ ] Audit current Makefile and identify common patterns.
- [ ] Create templated rules for agent actions.
- [ ] Test commands against at least one agent (Duck).
- [ ] Update CI scripts if necessary.

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
