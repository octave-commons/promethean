## 🛠️ Task: Start Eidolon

Bootstrap the **Eidolon** service that will manage emotion-state tracking and
reward calculations. This task creates the initial folder structure and minimal
code required to run a placeholder event loop.

---

## 🎯 Goals

- Provide a runnable service skeleton in `services/eidolon/`
- Mirror patterns used by `services/cephalon` for configuration and logging
- Enable future integration with emotional metrics collection

---

## 📦 Requirements

- [ ] Create package structure `services/eidolon/` with `__init__.py` and `main.py`
- [ ] Implement a basic event loop that prints "Eidolon running" when executed
- [ ] Add a placeholder config file `services/eidolon/config.json`
- [ ] Include a README describing the service purpose

---

## 📋 Subtasks

- [ ] Copy patterns from `services/stt/` for CLI entry point
- [ ] Wire up a simple logging setup using `shared/py/utils`
- [ ] Add an npm script or Makefile target to start Eidolon

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
