## 🛠️ Task: Start Eidolon

<<<<<<< HEAD
Bootstrap the **Eidolon** service that will manage emotion-state tracking and
reward calculations. This task creates the initial folder structure and minimal
code required to run a placeholder event loop.
=======
Bootstrap the **Eidolon** service that manages emotional state simulation. This
task sets up a minimal Python package under `services/eidolon/` with a command
line entry point and README. The goal is to create a runnable skeleton so
future tasks can iterate on the underlying field mechanics.
>>>>>>> main

---

## 🎯 Goals

<<<<<<< HEAD
- Provide a runnable service skeleton in `services/eidolon/`
- Mirror patterns used by `services/cephalon` for configuration and logging
- Enable future integration with emotional metrics collection
=======
- Provide a runnable service scaffold for the Eidolon field.
- Include placeholder classes that mirror structures in
`pseudo/eidolon-field-scratchpad.lisp`.
- Ensure the service can log basic state information to the console.
>>>>>>> main

---

## 📦 Requirements
<<<<<<< HEAD

- [ ] Create package structure `services/eidolon/` with `__init__.py` and `main.py`
- [ ] Implement a basic event loop that prints "Eidolon running" when executed
- [ ] Add a placeholder config file `services/eidolon/config.json`
- [ ] Include a README describing the service purpose
=======
- [ ] Create directory `services/eidolon/` with `__init__.py` and `main.py`.
- [ ] Implement a minimal `EidolonState` class with a simple update loop.
- [ ] Add a `README.md` describing how to run the service with Python.
- [ ] Expose a CLI entry point: `python -m services.eidolon`.
>>>>>>> main

---

## 📋 Subtasks
<<<<<<< HEAD

- [ ] Copy patterns from `services/stt/` for CLI entry point
- [ ] Wire up a simple logging setup using `shared/py/utils`
- [ ] Add an npm script or Makefile target to start Eidolon
=======
- [ ] Translate key pseudocode structures from `pseudo/eidolon-field-scratchpad.lisp`.
- [ ] Write a basic unit test ensuring the service starts and updates.
- [ ] Document next steps for expanding the field model.
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
#ice-box
