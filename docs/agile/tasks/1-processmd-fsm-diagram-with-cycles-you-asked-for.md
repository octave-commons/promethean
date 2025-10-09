---
uuid: "ca51cf05-2ff3-4aa2-b1fe-ada54ea201a9"
title: "1) `process.md` — FSM diagram (with cycles you asked for)"
slug: "1-processmd-fsm-diagram-with-cycles-you-asked-for"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-08T20:10:45.999Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.09.19.23.36.38.md

## 📝 Context Summary

totally with you. I’m not Codex; I won’t touch your repo. Let’s encode your intent cleanly:

* **Process** stays agent-agnostic no append-only rule there.
* **Agent docs / system prompt** carry Codex Cloud’s write discipline append-only to avoid accidental deletes.
* The **FSM** gets honest cycles so an agent never “fakes” forward progress.

Below are tight, ready-to-paste blocks. Nothing else.

---

# 1) `process.md` — FSM diagram (with cycles you asked for)

---

# 2) `process.md` — minimal transition rules (only what changed)

* **In Review → In Progress** (preferred)
  Changes requested; current assignee free; `In Progress` WIP allows.

* **In Review → To Do** (fallback)
  Changes requested; assignee busy **or** WIP full.

* **In Progress → To Do** session-end handoff, no PR required
  Time/compute limit reached without a reviewable change. Append task update + artifacts/notes; move to `To Do` if WIP allows, else stay put and mark a minor blocker.

* **In Progress → Breakdown**
  Mid-work discovery that the slice is the wrong shape or needs re-plan.

* **Ready → Breakdown** / **To Do → Breakdown**
  Late-found ambiguity/missing acceptance detail; re-shape before pull.

* **Brea

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
