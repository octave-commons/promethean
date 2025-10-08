---
```
uuid: dcdb2ed7-78d0-495a-b2a4-4fadd871ae3a
```
title: separate all testing pipelines in github actions md
status: todo
priority: P3
labels: []
```
created_at: '2025-09-15T02:02:58.520Z'
```
---
## 🛠️ Task: seperate all testing pipelines in GitHub Actions

Design docs suggest isolating service tests. Each service should have its own workflow file so failures don't block unrelated code.

Currently a single workflow runs all tests together, which slows feedback and
makes failures hard to trace. Split the CI configuration so each service has
its own test job.

---

## 🎯 Goals
- Independent CI jobs per service
- Faster feedback on failing components
- Allow independent failure reporting per service.
- Speed up CI by running jobs in parallel.
- Provide a clear pattern for adding new services in the future.

---

## 📦 Requirements
- [ ] Create a workflow file under `.github/workflows` for each service
- [ ] Ensure shared setup steps use the Makefile
- [ ] Create a workflow file that runs actions from a matrix containing each service  under `.github/workflows`.
- [ ] Trigger the appropriate workflow only when files under that service change.

---

## 📋 Subtasks
- [ ] Draft workflow template
- [ ] Apply to Python services
- [ ] Apply to Node services
- [ ] Audit existing `test.yml` workflow.
- [ ] Configure path filters for each workflow.
- [ ] Update documentation on CI usage.

---

## 🔗 Related Epics
#cicd 
```
#framework-core
```
---

## ⛓️ Blocked By
Nothing

## ⛓️ Blocks
- Move all testing to individual services

---

## 🔍 Relevant Links
- [[kanban]]
- [ci]../ci.md
#done

