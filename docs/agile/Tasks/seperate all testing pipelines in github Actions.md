## 🛠️ Task: seperate all testing pipelines in GitHub Actions

Design docs suggest isolating service tests. Each service should have its own workflow file so failures don't block unrelated code.

---

## 🎯 Goals
- Independent CI jobs per service
- Faster feedback on failing components

---

## 📦 Requirements
- [ ] Create a workflow file under `.github/workflows` for each service
- [ ] Ensure shared setup steps use the Makefile

---

## 📋 Subtasks
- [ ] Draft workflow template
- [ ] Apply to Python services
- [ ] Apply to Node services

---

## 🔗 Related Epics
#cicd

---

## ⛓️ Blocked By
Nothing

## ⛓️ Blocks
- Move all testing to individual services

---

## 🔍 Relevant Links
- [kanban](../boards/kanban.md)
- [ci](../ci.md)
