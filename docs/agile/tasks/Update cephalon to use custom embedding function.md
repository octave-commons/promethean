## 🛠️ Task: Update cephalon to use custom embedding function

Design notes point toward replacing the default Chroma embeddings with a lightweight Python service. Cephalon should call this service when generating context vectors.

---

## 🎯 Goals
- Decouple embedding logic from Node code
- Allow experimentation with alternative models

---

## 📦 Requirements
- [ ] Implement API calls to the embedding service
- [ ] Remove old Chroma dependency

---

## 📋 Subtasks
- [ ] Define request/response schema in `bridge/protocols`
- [ ] Update `cephalon/src` to fetch embeddings asynchronously
- [ ] Write unit tests for the new helper

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
- [pseudo/eidolon-field-scratchpad.lisp](../../pseudo/eidolon-field-scratchpad.lisp)
#incoming
