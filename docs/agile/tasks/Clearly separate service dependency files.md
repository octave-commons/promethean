## 🛠️ Task: Clearly separate service dependency files

Create isolated dependency manifests for each service so they can be installed
independently. Currently some packages are shared in the root `package.json`
and `Pipfile`, which complicates per-service deployment.

---

## 🎯 Goals

- Each service should declare its own Python and Node dependencies
  (`requirements.txt` or `package.json`).
- Reduce cross‑service coupling in the root manifests.
- Document how to install dependencies for an individual service.

---

## 📦 Requirements

- [ ] Audit existing packages in the root manifests.
- [ ] Move service‑specific libraries into the corresponding service folder.
- [ ] Keep shared dev tooling (lint, test runners) at the repository root.
- [ ] Update documentation to describe per‑service setup.

---

## 📋 Subtasks

- [ ] List all current dependencies by service.
- [ ] Create `requirements.txt` or `package.json` as needed.
- [ ] Update the Makefile to install dependencies per service.
- [ ] Clean up obsolete references in the root manifests.

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
