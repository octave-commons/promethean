---
uuid: "d171ea74-54d5-4862-8c04-46ede30ea3ec"
title: "`process.md` — minimal additions (append verbatim)"
slug: "processmd-minimal-additions-append-verbatim"
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

- Path: docs/labeled/2025.09.19.21.18.57.md

## 📝 Context Summary

totally. process stays agent-agnostic and simple. here’s a **tiny, additive patch** for `process.md` that encodes exactly what you described—no special “agent phases,” no prompt-refine stage, no timeboxing. just: init → working → wrap-up, artifact every session, code only when the process allows, and clear stop conditions.

---

# `process.md` — minimal additions (append verbatim)

## Session Update — YYYY-MM-DD HH\:MM

Phase: init | working | wrap-up
Board: \task created/linked, status: <#State>, moves: \[...]
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
End the working phase and proceed

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs






