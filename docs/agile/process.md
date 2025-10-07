# Overview
```
1. **Intake & Associate**
```
   Find or create the task; never work off-board; do not edit the board file directly—tasks drive the board. &#x20;
```
2. **Clarify & Scope**
```
   Anchor on the kanban card as the single source of truth and, before advancing, do the solo pass:
   * Confirm the desired outcomes so the card reflects the slice you intend to deliver.
   * Capture acceptance criteria or explicit exit signals on the task so "done" is unambiguous.
   * Note any uncertainties, risks, or open questions directly on the task to surface follow-ups early.
   * Record the scoped plan and supporting notes on the linked task before moving to step 3.
```
3. **Breakdown & Estimate**
```
   Break into small, testable slices; estimate **complexity, scale, time (in cloud sessions)** and assign a Fibonacci score from **1, 2, 3, 5, 8, 13** on the task card. Scores of **13+ ⇒ must split**; **8 ⇒ continue refinement before implementation**; **≤5 ⇒ eligible to implement**. Any score **>5** must cycle back through clarification/breakdown until the slice is small enough to implement, capturing the updated score on the task card.&#x20;

4. **Ready Gate** *(hard stop before code)*
   Only proceed if:

   * A matching task is **In Progress** (or you move it there), and WIP rules aren’t violated.&#x20;
   * The slice is scored **≤5** and fits the session after planning; otherwise continue refinement/splitting.&#x20;
```
5. **Implement Slice**
```
   Do the smallest cohesive change that can clear gates defined in agent docs (e.g., no new ESLint errors; touched packages build; tests pass).&#x20;
   When the scope is larger than the available session, carve off a reviewable subset and explicitly document what remains (e.g.,
   inventory lingering files, capture blockers, link references).&#x20;
```
6. **Review → Document**
```
   Move through *In Review* and *Document* then *Done* per board flow, recording evidence and summaries.&#x20;
# Kanban as a Finite State Machine (FSM)

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

* START STATE = Incoming
  * All new tasks start as incoming

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

* **In Progress → Todo** *session-end handoff; no PR required*
  Time/compute limit reached without a reviewable change. Record artifacts/notes + next step; move to **Todo** if WIP allows; else remain **In Progress** and mark a minor blocker.
  Artifacts must include partial outputs (e.g., audit logs, findings lists, reproduction steps) so a follow-on slice can resume immediately.

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
  Fires when any linked blocker advances e.g., to In Review/Done or evidence shows dependency removed; return to Breakdown to re-plan.

### Blocking policy

* **Minor blockers**: record briefly on the task; continue with other eligible work; resolve asynchronously.
  * Uncertainty over a single aspect of an assignment which does not prevent completion of other aspects of the assignment
* **Major blockers**: halt work on that task; capture evidence + attempt remediation
  * A triggered transition rule would result in a column begin over it's WIP limit
  * An agent's current task has only blocked sub tasks
