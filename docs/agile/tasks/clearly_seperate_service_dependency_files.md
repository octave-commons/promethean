---
uuid: "35c0a7d2-a172-4cfd-8521-b3faee0417ca"
title: "clearly seperate service dependency files md"
slug: "clearly_seperate_service_dependency_files"
status: "done"
priority: "P3"
labels: ["clearly", "dependency", "seperate", "service"]
created_at: "2025-10-11T03:39:14.375Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Q## 🛠️ Task: Clearly seperate service dependency files

Each service should maintain its own dependency declarations so deployments remain isolated. Refer to the design notes in `file-structure.md` and the migration plan for guidance.

Create isolated dependency manifests for each service so they can be installed
independently. Currently some packages are shared in the root `package.json`
and `Pipfile`, which complicates per-service deployment.

---

## 🎯 Goals
- Distinct `requirements.txt` or `package.json` for every service
- Document dependency layout in `/docs/file-structure.md`
- Each service should declare its own Python and Node dependencies
(`requirements.txt` or `package.json`).
- Reduce cross‑service coupling in the root manifests.
- Document how to install dependencies for an individual service.

---

## 📦 Requirements
- [ ] Audit current shared dependency usage
- [ ] Create per-service files and update CI accordingly

- [ ] Audit existing packages in the root manifests.
- [ ] Move service‑specific libraries into the corresponding service folder.
- [ ] Keep shared dev tooling (lint, test runners) at the repository root.
- [ ] Update documentation to describe per‑service setup.

---

## 📋 Subtasks
- [ ] Split Python requirements by service
- [ ] Split Node dependencies by service
- [ ] Update documentation with examples
- [ ] List all current dependencies by service.
- [ ] Create `requirements.txt` or `package.json` as needed.
- [ ] Update the Makefile to install dependencies per service.
- [ ] Clean up obsolete references in the root manifests.

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
- [[kanban]]
- file-structure$../file-structure.md
- MIGRATION_PLAN$../MIGRATION_PLAN.md
#done
