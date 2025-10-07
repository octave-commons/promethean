---
uuid: 961704a0-53ca-4aae-8c87-5b1f681a25be
created_at: '2025-09-19T23:48:50Z'
title: 2025.09.19.23.48.50
filename: Kanban as a Finite State Machine
description: >-
  Models a Kanban board as a finite state machine where tasks transition between
  predefined states based on specific rules. The system enforces a single source
  of truth for task status and includes WIP limits to prevent overloading.
  Transition rules ensure tasks move through the workflow with clear conditions
  for blocking or rework.
tags:
  - Kanban
  - Finite State Machine
  - Workflow Automation
related_to_uuid: []
related_to_title: []
references: []
---
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

```mermaid
flowchart TD

  %% ====== Lanes ======
  subgraph Brainstorm
    IceBox["🧊 Ice Box"]
    Incoming["💭 Incoming"]
  end

  subgraph Planning
    Accepted["✅ Accepted"]
    Breakdown["🧩 Breakdown"]
    Blocked["🚧 Blocked"]
  end

  subgraph Execution
    Ready["🛠 Ready"]
    Todo["🟢 To Do"]
    InProgress["🟡 In Progress"]
    InReview["🔍 In Review"]
    Document["📚 Document"]
    Done["✅ Done"]
  end

  subgraph Abandoned
    Rejected["❌ Rejected"]
  end

  %% ====== Forward flow ======
  IceBox --> Incoming
  Incoming --> Accepted
  Incoming --> Rejected
  Incoming --> IceBox
  Accepted --> Breakdown
  Breakdown --> Ready
  Ready --> Todo
  Todo --> InProgress
  InProgress --> InReview
  InReview --> Document
  InReview --> Done
  Document --> Done

  %% ====== Cycles back to Planning / queue ======
  Ready --> Breakdown
  Todo --> Breakdown
  InProgress --> Breakdown

  %% ====== Session-end, no-PR handoff ======
  InProgress --> Todo
  Document --> InReview

  %% ====== Review crossroads (re-open work) ======
  InReview --> InProgress
  InReview --> Todo

  %% ====== Defer / archive loops ======
  Accepted --> IceBox
  Breakdown --> IceBox
  Rejected --> IceBox

  %% ====== Blocked (narrow, explicit dependency) ======
  Breakdown --> Blocked
  Blocked --> Breakdown
````

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

* **In Progress → In Review**
  Coherent, reviewable change exists.

* **In Progress → Todo** *(session-end handoff; no PR required)*
  Time/compute limit reached without a reviewable change. Record artifacts/notes + next step; move to **Todo** if WIP allows; else remain **In Progress** and mark a minor blocker.

* **In Progress → Breakdown**
  Slice needs re-plan or is wrong shape.

* **In Review → In Progress** *(preferred)*
  Changes requested; current assignee free; **In Progress** WIP allows.

* **In Review → Todo** *(fallback)*
  Changes requested; assignee busy **or** **In Progress** WIP full.

* **Document → Done | In Review**
  Docs/evidence complete → Done; otherwise → In Review for another pass.

* **Done → (no mandatory back edge)**
  Follow-ups are modeled as new tasks (optionally seeded from Done).

* **Blocked → Breakdown** *(unblock event)*
  Fires when any linked blocker advances (e.g., to In Review/Done) or evidence shows dependency removed; return to Breakdown to re-plan.

### Blocking policy

* **Minor blockers**: record briefly on the task; continue with other eligible work; resolve asynchronously.
* **Major blockers**: halt work on that task; capture evidence + next steps; create/link an explicit unblocker task.

### Write discipline (agent-agnostic)

The process is agent-agnostic. Agent-specific safety rules (e.g., Codex Cloud’s file **append-only** discipline to avoid accidental deletion) live in **agent docs / system prompts**, not here.


---

# 2) `docs/agents/codex-cloud.md` — safety snippet (append in its “Editing discipline” section)

```md
### Edit discipline (immutable for Codex Cloud)
- Treat task files as **append-only** during a session.
- Never delete or rewrite large sections; prefer new headers/sections.
- If a path is missing or a file isn’t yet committed, do **not** rm/mv; write a new note under `docs/` and link it from the task.
- At session end, if no PR is ready, produce a **task update + artifacts** and use one of the safe transitions:
  - InProgress → Todo  (coherent next step; WIP allows)
  - InProgress → Breakdown  (slice needs re-plan)
  - Stay in InProgress with a minor blocker if WIP prevents movement.
````

---

# 3) `system_prompt.md` — one-liner (place near “Board is law”)

```md
- Treat `process.md` as scripture. Follow the FSM transitions and WIP; use Codex Cloud edit discipline from `docs/agents/codex-cloud.md`.
```

---

If you want, I can also generate a tiny per-column **Entry / Work / Exit** table next (one line each)—machine-readable but still minimal.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
