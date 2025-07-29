## 🛠️ Task: Separate all testing pipelines in GitHub Actions

Currently a single workflow runs all tests together, which slows feedback and
makes failures hard to trace. Split the CI configuration so each service has
its own test job.

---

## 🎯 Goals

- Allow independent failure reporting per service.
- Speed up CI by running jobs in parallel.
- Provide a clear pattern for adding new services in the future.

---

## 📦 Requirements

- [ ] Create one workflow file per service under `.github/workflows`.
- [ ] Share common setup steps via a reusable action or composite script.
- [ ] Trigger the appropriate workflow only when files under that service change.

---

## 📋 Subtasks

- [ ] Audit existing `test.yml` workflow.
- [ ] Duplicate and modify jobs for `cephalon`, `stt`, `tts`, etc.
- [ ] Configure path filters for each workflow.
- [ ] Update documentation on CI usage.

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
