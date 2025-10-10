---
uuid: "41338e32-2990-49c0-9329-723ff0f7577f"
title: "Kanban FSM with safe cycles + hand-off paths"
slug: "kanban-fsm-with-safe-cycles-hand-off-paths"
status: "incoming"
priority: "P3"
tags: ["docops", "labeled"]
created_at: "2025-10-10T03:23:55.969Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







## 🗂 Source

- Path: docs/labeled/2025.09.19.23.23.12.md

## 📝 Context Summary

you’re not overthinking it — you’re seeing the missing cycles. let’s add **explicit reverse paths** so the system never fakes forward progress, and give the cloud agent a safe “session-end hand-off” path that doesn’t require a PR.

here’s a tightened FSM with minimal, procedural cycles:

# Kanban FSM with safe cycles + hand-off paths

## Why these cycles

* **Execution → Planning**: allows honest backtracking when a slice was shaped wrong or new information appears (no fake “forward only”).
* **InProgress → Todo**: supports “session-end hand-off” without forcing a PR; you still get artifacts/logs and a queued next step.
* **Ready → Breakdown** and **Todo → Breakdown**: when a card is “almost ready” but a missing acceptance/detail appears, it can be re-shaped procedurally.
* **Document → InReview**: docs can fail review just like code.

---

# Tiny transition rules just the new/changed ones

* **Ready → Breakdown**
  Trigger: acceptance criteria or dependencies are insufficient/ambiguous; needs re-shape before prioritization.

* **Todo → Breakdown**
  Trigger: before pull, discover unclear scope or missing acceptance detail.

* **In Progress → Breakdown**
  Trigger: mid-work discove

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs






