---
uuid: af87b6ca-6f04-4380-9e5b-54adcf7bf254
title: update cephalon to use custom embedding function md md
status: rejected
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.523Z'
---
## 🛠️ Task: Update cephalon to use custom embedding function

Design notes point toward replacing the default Chroma embeddings with a lightweight Python service. Cephalon should call this service when generating context vectors.

Chroma was causing issues for our testing environments so we need to be able to decouple this service from it to do CI/CD efficiently. It seemed like a dependency of a dependency of it was requiring GPU drivers.

We won't necessarily be using this function unless it doesn't meaningfully impact performance.

At this time, we are just focused on reproducibility. Testability, and clarity.

Premature optimization is bad.


---

## 🎯 Goals
- Decouple embedding logic from ChromaDB
- Allow easy end to end testing in CI/CD
- Allow remote agents to run code when they don't have access to GPUs
- Allow experimentation with alternative models

---

## 📦 Requirements
- [ ] Implement a new embedding service with out low level dependencies
- [ ] Implement API calls from other services to the embedding service
- [ ] The option to use chroma remains
- [ ] There is a shared class that wraps the API call for easy use in other services.
- [ ] Decouple services from chroma

---

## 📋 Subtasks
- [ ] Define request/response schema in `bridge/protocols`
- [ ] Write tests for new embeddings service
- [ ] Unit tests
- [ ] e2e
- [ ] integration
- [ ] Write unit tests for the new helper
- [ ] Implement service
- [ ] implement wrapper class
- [ ] Update `cephalon/src` to fetch embeddings asynchronously using wrapper class from shared
- [ ] Update `discord-embedder/src` to fetch embeddings asynchronously using wrapper class from shared

---

## 🔗 Related Epics
#framework-core #cephalon #discord #embedding #typescript

---

## ⛓️ Blocked By
Nothing

## ⛓️ Blocks
Nothing

---

## 🔍 Relevant Links
- [[kanban]]
- pseudo/eidolon-field-scratchpad.lisp$../../pseudo/eidolon-field-scratchpad.lisp
```
#in-progress
```
## Blockers
- Embedding service implementation not linked.
- Unit and integration tests for wrapper and service missing.
- Documentation for the new embedding workflow is absent.

