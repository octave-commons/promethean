---
uuid: fe5eb9d4-18ff-46e5-8a30-81dffe1f711f
title: refactor any python modules not currently for ml stuff discord etc 2 md
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.518Z'
---
## 🛠️ Description
**Status:** blocked

Minimize Python usage in the Promethean framework by **isolating and containing Python code** to only where it is unavoidable—primarily for machine learning model execution—while moving orchestration, glue code, and non-ML logic to faster, more maintainable languages (JavaScript/TypeScript, Sibilant, Hy, etc.).

The aim is to reduce Python’s footprint in the system, improve performance, and avoid Python-specific dependency and packaging complexity, without losing the ability to run ML models that are only available in Python ecosystems.

---

## 🎯 Goals

* Restrict Python usage to **model execution layers** only.
* Replace Python-based orchestration and processing code with preferred languages.
* Standardize **inter-language communication** (e.g., WebSockets, gRPC, shared memory).
* Make Python components **self-contained microservices** to avoid polluting the rest of the stack.
* Reduce deployment complexity by minimizing Python dependency chains.

---

## 📦 Requirements

* [ ] Audit current Python usage across services.
* [ ] Identify Python code that can be rewritten or moved to other languages.
* [ ] Define a standard **IPC or RPC mechanism** for connecting Python ML services to non-Python orchestration layers.
* [ ] Implement containerized or isolated Python ML runners.
* [ ] Document guidelines for when Python *is* acceptable.

---

## 📋 Subtasks

* [ ] Map all Python modules and their roles in the framework.
* [ ] Flag Python code that is not strictly ML-bound for migration.
* [ ] Build JS/TS wrappers for ML inference endpoints.
* [ ] Implement service contracts for Python-based ML microservices.
* [ ] Test latency and throughput impact of non-Python orchestration.
* [ ] Remove unused Python dependencies and slim Python environments.

---

## 🔗 Related Epics

#framework-core
#language-strategy
#performance-optimization

## Blockers
- No active owner or unclear scope

#breakdown

