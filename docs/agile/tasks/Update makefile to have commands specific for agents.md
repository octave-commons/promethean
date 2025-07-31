## 🛠️ Task: Update Makefile to have commands specific for agents

The monorepo hosts multiple agents. The Makefile should expose targets to launch or test each agent individually as referenced in the migration plan.

---

## 🎯 Goals
- `make start:duck` or similar commands
- Reusable patterns for any future agent

---

## 📦 Requirements
- [ ] Define agent-specific PM2 targets
- [ ] Document usage in the root README

---

## 📋 Subtasks
- [ ] Extend current Makefile with per-agent start/stop
- [ ] Provide example for Duck
- [ ] Add placeholder for new agents

---

## 🔗 Related Epics
#devops

---

## ⛓️ Blocked By
- update GitHub Actions to use makefile

## ⛓️ Blocks
Nothing

---

## 🔍 Relevant Links
- [kanban](../boards/kanban.md)
- [MIGRATION_PLAN](../MIGRATION_PLAN.md)
#breakdown
