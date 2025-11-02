---
```
uuid: fbdf68ce-c07a-4944-9099-b3fa74bb3de1
```
```
created_at: '2025-09-19T22:37:16Z'
```
title: 2025.09.19.22.37.16
filename: Concise Transition Specification
```
description: >-
```
  A minimal, agent-agnostic state transition specification for managing task
  workflows using a finite state machine (FSM) approach. Defines allowed
  transitions between states with clear triggers and failure conditions based on
  work-in-progress (WIP) caps.
tags:
  - state machine
  - workflow
  - transition rules
  - agent-agnostic
  - WIP cap
  - finite state machine
  - task management
  - minimal transitions
```
related_to_uuid: []
```
```
related_to_title: []
```
references: []
---
awesome—here’s the **concise transition spec** to pair with the mermaid FSM you just approved. it’s strictly procedural, agent-agnostic, and keeps rules minimal.

# Allowed outbound transitions by column C → …

> General rule: a transition to a target **fails** if that target’s WIP cap is reached. Each task has **one** status at a time.

## 🧊 Ice Box
```
**C →** Incoming
```
**Trigger:** revisited/prioritized now worth re-intake.

## 💭 Incoming
```
**C →** Accepted, Rejected, Ice Box
```
```
**Trigger:**
```
* → Accepted: clear project relevance; worth exploring.
* → Rejected: out of scope / duplicate / not actionable.
* → Ice Box: deferrable; valuable later.

## ✅ Accepted
```
**C →** Breakdown, Ice Box
```
```
**Trigger:**
```
* → Breakdown: ready to analyze/shape.
* → Ice Box: deferrable after quick review not urgent/connected.

## 🧩 Breakdown

**C →** Ready, Rejected, Ice Box, Blocked
```
**Trigger:**
```
* → Ready: scoped, traceable acceptance notes, basic feasibility OK.
* → Rejected: becomes non-viable / dup / obsolete.
* → Ice Box: valid but lower priority; defer consciously.
* → Blocked: dependency/constraint discovered that stops analysis.

## 🛠 Ready
```
**C →** To Do, Blocked
```
```
**Trigger:**
```
* → To Do: prioritized into the execution queue.
* → Blocked: prerequisite missing (env, dependency, policy).

## 🟢 To Do
```
**C →** In Progress, Blocked
```
```
**Trigger:**
```
* → In Progress: pulled by a worker (WIP allows).
* → Blocked: ready item becomes temporarily infeasible.

## 🟡 In Progress
```
**C →** In Review, Blocked
```
```
**Trigger:**
```
* → In Review: a coherent slice is implemented and submitted.
* → Blocked: discovered issue prevents meaningful forward motion.

## 🔍 In Review
```
**C →** Document, Done, Blocked
```
```
**Trigger:**
```
* → Document: changes accepted; docs still needed.
* → Done: small/self-documenting; doc not required or already present.
* → Blocked: review reveals blocker (policy, security, failing checks).

## 📚 Document
```
**C →** Done, Blocked
```
```
**Trigger:**
```
* → Done: docs/evidence added; acceptance satisfied.
* → Blocked: missing info owner/reviewer/assets.

## ✅ Done
```
**C →** Ice Box
```
**Trigger:** archival/defer for future revisit e.g., follow-ups, exemplars.

## ❌ Rejected
```
**C →** Ice Box
```
**Trigger:** archive kept for history/traceability.

## 🚧 Blocked
```
**C →** Breakdown
```
**Trigger:** unblock or re-shape: record evidence, create/link unblockers, then return to Breakdown to re-plan.

---

## Minimal blocking policy

* **Minor** blockers: record on the task; continue with other eligible work; resolve asynchronously.
* **Major** blockers: halt this task; capture evidence/next steps; create/link a focused unblocker task.

## Notes aligning with your intent

* **Ice Box** is reachable from **Incoming**, **Accepted**, **Breakdown**, and via archival from **Done**/**Rejected**.
* **Blocked** is reachable from **any** state; its only outbound is back to **Breakdown**.
* Nothing here encodes agent-specific phases or time—this is pure FSM over columns.
* Prompts/docs are treated exactly like code: they follow the same transitions.

If this matches, next micro-step: I’ll add **per-column “Entry / Work / Exit” bulletlets** (one line each) to make R(Tₙ, t) explicit but still tiny—so agents stop guessing and the board remains the one true machine.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
