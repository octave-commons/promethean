---
uuid: "80cfa8ff-15d5-4d34-ba07-5676dfba7202"
title: "Step 1 — minimal patch for `process.md` (append verbatim)"
slug: "step-1-minimal-patch-for-processmd-append-verbatim"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.819Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.09.19.22.12.01.md

## 📝 Context Summary

love the clarity. let’s codify exactly what you described, agent-agnostic, as a **Kanban-as-FSM** kernel for `process.md`. no special phases, no timeboxing, minimal rules, procedural, board-driven.

# Step 1 — minimal patch for `process.md` (append verbatim)

mermaid
flowchart LR
  IceBox --> Accepted --> Breakdown --> Ready --> Todo --> InProgress --> InReview --> Document --> Done
  classDef st fill:none,stroke:#999,stroke-width:1px;
  class IceBox,Accepted,Breakdown,Ready,Todo,InProgress,InReview,Document,Done st;

---

If that matches your intent, say **“apply Step 1”** and I’ll slot it into `process.md` as an append-only block.  
**Next step after that** still process-first: add the tiny per-column “Entry / Work / Exit” rule stubs so the FSM is runnable—still minimal, still procedural. Then we’ll craft the Codex Cloud prompt to treat this doc as scripture and keep its own 3-phase rhythm init/working/wrap-up **in `codex-cloud.md`, not in the process.**

```

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
