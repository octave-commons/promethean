## 🛠️ Task: Set up Makefile for Python + JS build test dev

A unified Makefile (or equivalent script) will streamline development. It should bootstrap dependencies, start services, run tests and clean artifacts.

---

## 🎯 Goals
- Provide a quick `setup` target for all services
- Allow starting and stopping each service individually
- Offer a single command to run tests across languages
- Keep the workflow cross platform when possible

---

## 📦 Requirements
- [ ] `setup` installs dependencies for all services
- [ ] `start` and `stop` manage processes via PM2
- [ ] `start:<service>` and `stop:<service>` for granular control
- [ ] `test` aggregates Python and JS test suites
- [ ] `clean` removes build artifacts

---

## 📋 Subtasks
- [ ] Inventory current service start commands
- [ ] Draft initial Makefile structure
- [ ] Integrate PM2 ecosystem config
- [ ] Document usage in the root `README.md`

---

## 🔗 Related Epics
#cicd #buildtools #devtools #devops

---

## ⛓️ Blocked By
Nothing

## ⛓️ Blocks
- Future CI automation

---

## 🔍 Relevant Links
- [kanban](../boards/kanban.md)
