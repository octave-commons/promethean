---
uuid: "45f9afbe-773a-4a31-baea-99aa5955171a"
title: "1) Updated Mermaid (adds reverse paths from Review; narrows Blocked)"
slug: "1-updated-mermaid-adds-reverse-paths-from-review-narrows-blocked"
status: "icebox"
priority: "P3"
tags: ["docops", "labeled"]
created_at: "2025-10-10T03:23:55.968Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







## 🗂 Source

- Path: docs/labeled/2025.09.19.22.52.43.md

## 📝 Context Summary

perfect—let’s tighten the FSM to reflect your review + blocked semantics and keep it procedural, minimal, and agent-agnostic.

# 1) Updated Mermaid (adds reverse paths from Review; narrows Blocked)

* Reverse moves from **In Review** go to **In Progress** (preferred) or **To Do** when WIP/assignment prevents immediate pickup.
* **Blocked** is entered **only from Breakdown** (where dependencies are surfaced and recorded), and returns to **Breakdown** when unblocked.

---

# 2) Tiny transition rules (only what changes matters)

## 🔍 In Review → 🟡 In Progress  (preferred)

* Review fails or changes requested.
* The **current assignee** is free to resume (has not started another task), **and** `In Progress` WIP allows.
  **Else** try `In Review → To Do`.

## 🔍 In Review → 🟢 To Do

* Review fails or changes requested.
* Either the assignee already picked up another task **or** `In Progress` WIP is full.
* Task remains prioritized in `To Do`; can be re-pulled when WIP permits.

> Note: a failed review is **not blocking**. It reopens work unless WIP prevents re-entry to `In Progress`.

## 🧩 Breakdown → 🚧 Blocked  (narrow, explicit)

* A **hard dependency** on another task `b` is dis

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs






