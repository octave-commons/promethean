---
uuid: "6ce60757-44eb-40e8-9d33-2f755b275ebd"
title: "2) `docs/agents/codex-cloud.md` — safety snippet (append in its “Editing discipline” section)"
slug: "2-docsagentscodex-cloudmd-safety-snippet-append-in-its-editing-discipline-section"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-12T02:22:05.423Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































## 🗂 Source

- Path: docs/labeled/2025.09.19.23.48.50.md

## 📝 Context Summary

## Kanban as a Finite State Machine (FSM)

We treat the board as an FSM over tasks.

- **States (C)**: the board’s columns.
- **Initial state (S)**: **Incoming** (new tasks land here).
- **Transitions (T)**: moves between columns.
- **Rules R(Tₙ, t)**: predicates over task `t` that permit or block transition `Tₙ`.
- **Single source of status**: each task has exactly one column/status at a time.
- **Board is law**: never edit the board file directly; tasks drive board generation.
- **WIP**: a transition fails if the target state’s WIP cap is full.

### FSM diagram

`

### Minimal transition rules (only what matters)

* **Incoming → Accepted | Rejected | Ice Box**
  Relevance/priority triage; allow defer to Ice Box.

* **Accepted → Breakdown | Ice Box**
  Ready to analyze, or consciously deferred.

* **Breakdown → Ready | Rejected | Ice Box | Blocked**
  Scoped & feasible → Ready; non-viable → Rejected; defer → Ice Box;
  **→ Blocked** only for a true inter-task dependency with **bidirectional links** (Blocking ⇄ Blocked By).

* **Ready → Todo**
  Prioritized into the execution queue (respect WIP).

* **Todo → In Progress**
  Pulled by a worker (respect WIP).

* **In Progress → In Re

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs








































































































