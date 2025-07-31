## 🛠️ Task: update GitHub Actions to use Makefile

CI workflows should call standardized Makefile targets rather than duplicating commands. This keeps automation consistent with the design docs.

---

## 🎯 Goals
- Invoke `make test` and `make build` from workflows
- Reduce script duplication across jobs

---

## 📦 Requirements
- [ ] Modify existing workflow files to call Makefile targets
- [ ] Ensure the Makefile covers setup for all services

---

## 📋 Subtasks
- [ ] Audit current workflow steps
- [ ] Add `make lint` and `make test` usage
- [ ] Verify environment variables for PM2

---

## 🔗 Related Epics
#cicd #devops

---

## ⛓️ Blocked By
- Clearly seperate service dependency files

## ⛓️ Blocks
- Update Makefile to have commands specific for agents

---

## 🔍 Relevant Links
- [kanban](../boards/kanban.md)
- [Process](../Process.md)
