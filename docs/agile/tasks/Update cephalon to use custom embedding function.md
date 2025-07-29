## 🛠️ Task: Update cephalon to use custom embedding function

Cephalon currently relies on standard sentence-transformer embeddings. We want
to experiment with a custom embedding function tailored to the agent's memory
model. This requires wiring the new function into the existing embedding
pipeline and providing a fallback to the default implementation.

---

## 🎯 Goals

- Improve retrieval quality for Cephalon's long-term memory store.
- Allow plug‑and‑play embedding functions via configuration.
- Provide benchmarks comparing the custom function to the baseline.

---

## 📦 Requirements

- [ ] Implement pluggable embedding interface in `cephalon/src`.
- [ ] Add a config option to select the custom function.
- [ ] Document how to enable or disable the feature.

---

## 📋 Subtasks

- [ ] Draft TypeScript interface for embedding providers.
- [ ] Implement wrapper around the custom embedding library.
- [ ] Update tests to validate new embeddings are generated.
- [ ] Provide migration notes in the README.

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
