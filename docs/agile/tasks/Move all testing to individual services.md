## 🛠️ Task: Move all testing to individual services

Testing should run within each service directory to better reflect microservice boundaries and speed CI. The design plan favors modular pipelines.

---

## 🎯 Goals
- Place test suites next to service code
- Remove root-level test runners

---

## 📦 Requirements
- [ ] Relocate existing tests into their corresponding service folders
- [ ] Update import paths and fixtures

---

## 📋 Subtasks
- [ ] Migrate Python tests
- [ ] Migrate Node tests
- [ ] Verify `pytest` and `ava` configs per service

---

## 🔗 Related Epics
#cicd #framework-core

---

## ⛓️ Blocked By
- seperate all testing pipelines in GitHub Actions

## ⛓️ Blocks
Nothing

---

## 🔍 Relevant Links
- [kanban](../boards/kanban.md)
#prompt-refinement
