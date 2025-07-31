Q## 🛠️ Task: Clearly seperate service dependency files

Each service should maintain its own dependency declarations so deployments remain isolated. Refer to the design notes in `file-structure.md` and the migration plan for guidance.

Create isolated dependency manifests for each service so they can be installed
independently. Currently some packages are shared in the root `package.json`
and `Pipfile`, which complicates per-service deployment.

---

## 🎯 Goals
- Distinct `requirements.txt` or `package.json` for every service
- Document dependency layout in `/docs/file-structure.md`

---

## 📦 Requirements
- [ ] Audit current shared dependency usage
- [ ] Create per-service files and update CI accordingly

---

## 📋 Subtasks
- [ ] Split Python requirements by service
- [ ] Split Node dependencies by service
- [ ] Update documentation with examples

---

## 🔗 Related Epics
#devops #cicd

---

## ⛓️ Blocked By
Nothing

## ⛓️ Blocks
- Update GitHub Actions to use makefile

---

## 🔍 Relevant Links
- [kanban](../boards/kanban.md)
- [file-structure](../file-structure.md)
- [MIGRATION_PLAN](../MIGRATION_PLAN.md)
