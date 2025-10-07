---
$$
uuid: 496d8f5e-9a29-4a18-96db-b5fcdfd8896a
$$
$$
created_at: '2025-09-19T21:18:57Z'
$$
title: 2025.09.19.21.18.57
$$
filename: process-minimal-additions
$$
$$
description: >-
$$
  Minimal additions to the process documentation that define a session cadence
  with clear phases, artifact requirements, and ready-to-code gates without
  introducing agent-specific phases or timeboxing.
tags:
  - process
  - session
  - cadence
  - artifact
  - ready-to
  - code
  - gate
  - stop
  - conditions
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---
totally. process stays agent-agnostic and simple. here’s a **tiny, additive patch** for `process.md` that encodes exactly what you described—no special “agent phases,” no prompt-refine stage, no timeboxing. just: init → working → wrap-up, artifact every session, code only when the process allows, and clear stop conditions.

---

# `process.md` — minimal additions (append verbatim)

```md
## Session Cadence (agent-agnostic, immutable)

All work—code, docs, prompts—is handled the same way and must flow by the board. Every session follows three phases:

1) **Init**
   - Read AGENTS.md (generic rules) and the relevant agent doc for the current runner (for environment limits only).
   - Locate or create the related task; never work off-board.
   - Ensure the task has exactly one status hashtag consistent with the board.

2) **Working**
   - Follow the board’s states and their move conditions. Make only small, intentional steps that keep the task eligible to move.
   - Do **not** start coding until the task meets this process’s “ready to code” gate (below).

3) **Wrap-up**
   - Finalize the session: update the task (append-only log), summarize what changed, and list artifacts/links.
   - If the task moved states, record why. If blocked, record evidence and next steps.

### Artifact-Every-Session (no empty sessions)
Each session MUST append a structured update to the task (even if no code was written):

```

## Session Update — YYYY-MM-DD HH\:MM

Phase: init | working | wrap-up
Board: \$task created/linked$, status: <#State>, moves: \[...]
Actions: short bullets of what was attempted/verified
Evidence: links to logs/docs/diffs or “none”
Artifacts: paths or PR/branch, or “none this session”
Next: the very next small step; blockers (if any)

### Ready-to-Code Gate (applies to all work)
The task must satisfy **all**:
- On the board with exactly one status hashtag; WIP rules not violated.
- Clear acceptance criteria and scope; small enough to complete or meaningfully advance within a normal session.
- Dependencies present/healthy (or an explicit blocker task exists).

If any condition fails, continue refining, splitting, estimating, or documenting—do not code.

### Stop Conditions
End the working phase and proceed to wrap-up when:
1) A time or capacity limit is approaching; or
2) A process stop condition is hit (e.g., hard blocker, WIP conflict, unmet dependency, state rule prevents movement).

### Giant Inputs Must Be Split
If an input implies multiple packages/modules or a large cross-cutting change, treat it as an epic: create/split into smaller tasks **before** coding. $Documentation/prompts receive the same treatment as code.$
```

---

If this matches your intent, say “apply Step 1” and I’ll insert this text into `process.md` $append-only$. Then we can take the next single step: define the **ready/move** conditions per column $succinct acceptance criteria + DoD snippets$ so the system prompt can treat the process as scripture and everything else as interpretable canon.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
