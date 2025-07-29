## 🛠️ Task: Define permission schema in AGENTS.md

Create a concise section in the root `AGENTS.md` explaining how agents declare
allowed actions and resource access. The schema will be consumed by the future
"permission gating" middleware to enforce boundaries.

---

## 🎯 Goals

- Specify a human-readable schema for permission rules
- Ensure the schema can be parsed by the permission gating layer
- Provide examples for different agent roles

---

## 📦 Requirements

- [ ] Outline required fields (action, scope, default behavior)
- [ ] Document YAML and JSON examples
- [ ] Provide one sample per agent in `agents/*/config/permissions.yaml`
- [ ] Link to any mathematical reasoning notes

---

## 📋 Subtasks

- [ ] Draft schema description inside `AGENTS.md`
- [ ] Add example snippet under `agents/duck/config/`
- [ ] Review with team for completeness
- [ ] Update any affected tasks

---

## 🔗 Related Epics

#framework-core

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

- [Create permission gating layer](Create%20permission%20gating%20layer.md)

---

## 🔍 Relevant Links

- [kanban](../boards/kanban.md)

## ❓ Questions

- Should permissions support wildcards for actions or be explicit only?
