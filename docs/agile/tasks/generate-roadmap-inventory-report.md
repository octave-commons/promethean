---
uuid: c8651504-523e-434c-987c-ac19fd9a67f2
title: Extend roadmap generator to emit inventory report
status: in_progress
priority: P3
labels: ["scripts", "documentation"]
created_at: "2025-10-07T04:56:16+00:00"
---
## 🛠️ Task: Extend roadmap generator to emit inventory report

Add an initial consolidation step to the roadmap site generator that builds an inventory report from the existing mermaid blocks. Capture the report alongside current outputs so downstream tooling can use it.

---

## 🎯 Goals

- Enumerate roadmap nodes discovered while scraping mermaid blocks.
- Record the inventory in a structured artifact the build can reuse.
- Keep the inventory generation isolated behind the existing consolidation pipeline.

---

## 📦 Requirements

- [ ] Parse mermaid blocks and aggregate node metadata into an inventory list.
- [ ] Write the inventory to disk in JSON with deterministic ordering.
- [ ] Document the new artifact inside the script for future contributors.

---

## 📋 Subtasks

- [x] Inspect current mermaid scraping logic. ✅ 2025-10-07
- [ ] Add inventory aggregation and emit JSON artifact.
- [ ] Confirm output structure and note follow-up needs.

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

- [[process]]
- [[kanban]]
