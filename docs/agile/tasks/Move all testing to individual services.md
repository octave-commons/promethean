## 🛠️ Task: Move all testing to individual services

Testing currently runs from the repo root which makes it hard to target a
single service. Move test suites so they live alongside their respective
service code and can be executed independently.

---

## 🎯 Goals

- Each service should provide its own `tests/` directory.
- Running `npm test` or `pytest` within a service runs only that service's
  suite.
- CI jobs can trigger tests selectively based on touched code.

---

## 📦 Requirements

- [ ] Split existing consolidated tests by service.
- [ ] Ensure shared utilities still import correctly.
- [ ] Provide a convenience command in the Makefile for running all tests.

---

## 📋 Subtasks

- [ ] Identify current test locations and map to target services.
- [ ] Move or copy files to `services/<name>/tests`.
- [ ] Update import paths and fixtures as needed.
- [ ] Adjust CI configuration to run tests per service.

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
