---
uuid: "b157052a-5bc8-409b-b763-b4efb3e764df"
title: "kanban-fsm"
slug: "kanban-fsm"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-08T20:10:46.037Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/kanban-fsm.md

## 📝 Context Summary

---

title: 2025.09.19.22.32.47
filename: Kanban FSM

  A cleaned-up Kanban state machine diagram with explicit transitions for
  incoming items, acceptance, rejection, and ice-boxing. Includes blocked states
  and unblock paths for workflow management.
tags:
  - kanban
  - state machine
  - workflow
  - transitions
  - blocked
  - ice box
  - incoming
  - accepted
  - rejected

references: []
---
got it—here’s the cleaned-up **Kanban FSM** mermaid, with your tweaks:

* “New” → **Incoming**
* Incoming can go to **Accepted**, **Rejected**, or **Ice Box**
* **Blocked** reachable from **any** state (explicit edges shown), and returns to **Breakdown**
* Ice-boxing may occur in **Brainstorm** or **Planning** (not Execution)
* Kept `InReview → Done` and `Done → Ice Box`

if this matches your intent, next micro-step: I’ll list each column’s **allowed outbound transitions** (one concise line per state) so we have a human-readable rules table to pair with the diagram.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
