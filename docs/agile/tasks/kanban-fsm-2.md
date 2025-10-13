---
uuid: "3db9844d-0805-40e4-b16c-9834b9cc639a"
title: "kanban-fsm-2"
slug: "kanban-fsm-2"
status: "superseded"
priority: "P3"
labels: ["docops", "labeled", "superseded"]
created_at: "2025-10-11T19:23:08.664Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




















## 🗂 Source

- Path: docs/labeled/kanban-fsm-2.md

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

## references: []

got it—here’s the cleaned-up **Kanban FSM** mermaid, with your tweaks:

- “New” → **Incoming**
- Incoming can go to **Accepted**, **Rejected**, or **Ice Box**
- **Blocked** reachable from **any** state (explicit edges shown), and returns to **Breakdown**
- Ice-boxing may occur in **Brainstorm** or **Planning** (not Execution)
- Kept `InReview → Done` and `Done → Ice Box`

if this matches your intent, next micro-step: I’ll list each column’s **allowed outbound transitions** (one concise line per state) so we have a human-readable rules table to pair with the diagram.

<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->

## Related content

- _None_

## Sources

- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

## ⚠️ Task Superseded

This task has been **superseded** and consolidated into:

- **New Task**: [Process Governance Cluster - Quality Gates & Workflow Enforcement](2025.10.09.22.15.00-process-governance-cluster.md)
- **UUID**: process-governance-cluster-001
- **Reason**: Consolidated into strategic cluster for better focus and coordination

### Migration Details

- All work and context transferred to new cluster
- Current status and progress preserved
- Assignees notified of change
- Dependencies updated accordingly

### Next Steps

- Please refer to the new cluster task for continued work
- Update any bookmarks or references
- Contact cluster lead for questions

## 📋 Original Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs



















