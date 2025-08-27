## 🛠️ Task: Start Eidolon

Bootstrap the **Eidolon** service that manages emotion-state tracking and
reward calculations. This task sets up a minimal Python package under
`services/eidolon/` with a command-line entry point and README so future tasks
can iterate on the underlying field mechanics.

---

## 🎯 Goals

- Provide a runnable service skeleton in `services/eidolon/`
- Mirror patterns used by `services/cephalon` for configuration and logging
- Enable future integration with emotional metrics collection
- Include placeholder classes mirroring `pseudo/eidolon-field-scratchpad.lisp`
- Ensure the service can log basic state information to the console

---

## 📦 Requirements

- [ ] Create package structure `services/eidolon/` with `__init__.py` and `main.py`
- [ ] Implement a minimal `EidolonState` class with a simple update loop that prints "Eidolon running"
- [ ] Add a placeholder config file `services/eidolon/config.json`
- [ ] Expose a CLI entry point: `python -m services.eidolon`
- [ ] Include a `README.md` describing the service and how to run it

---

## 📋 Subtasks

- [ ] Copy patterns from `services/stt/` for CLI entry point
- [ ] Wire up a simple logging setup using `shared/py/utils`
- [ ] Add an npm script or Makefile target to start Eidolon
- [ ] Translate key pseudocode structures from `pseudo/eidolon-field-scratchpad.lisp`.
- [ ] Write a basic unit test ensuring the service starts and updates.
- [ ] Document next steps for expanding the field model.

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


#done
