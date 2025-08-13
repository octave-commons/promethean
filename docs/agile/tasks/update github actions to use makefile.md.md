## 🛠️ Task: update GitHub Actions to use Makefile

CI workflows should call standardized Makefile targets rather than duplicating commands. This keeps automation consistent with the design docs.
Testing should run within each service directory to better reflect microservice boundaries and speed CI. The design plan favors modular pipelines.

---

## 🎯 Goals
- Invoke `make test` and `make build` from workflows
- Reduce script duplication across jobs
- Place test suites next to service code
- Remove root-level test runners

---

## 📦 Requirements
- [ ] Modify existing workflow files to call Makefile targets
- [ ] Ensure the Makefile covers setup for all services
- [ ] Relocate existing tests into their corresponding service folders
- [ ] Update import paths and fixtures

---

## 📋 Subtasks
- [ ] Audit current workflow steps
- [ ] Add `make lint` and `make test` usage
- [ ] Verify environment variables for PM2
- [ ] Migrate Python tests
- [ ] Migrate Node tests
- [ ] Verify `pytest` and `ava` configs per service

---

## 🔗 Related Epics
#cicd #devops #framework-core

---

## ⛓️ Blocked By
- Clearly seperate service dependency files
- seperate all testing pipelines in GitHub Actions

## ⛓️ Blocks
- Update Makefile to have commands specific for agents

---

## 🔍 Relevant Links
- [[kanban.md]]
- [[Process.md]]
#in-review
