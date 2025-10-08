---
uuid: "5799446a-4f26-4273-8728-7d640572636a"
title: "codex-cloud-workflow-7"
slug: "codex-cloud-workflow-7"
status: "todo"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-08T20:10:46.021Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/codex-cloud-workflow-7.md

## 📝 Context Summary

---
uuid: d2a84e9d-3382-4c65-a3f2-cfd7612b9aec
created_at: '2025-09-19T20:41:26Z'
title: 2025.09.19.20.41.26
filename: Codex Cloud Workflow
description: >-
  A structured workflow for managing Codex Cloud sessions with strict artifact
  guarantees, task-first principles, and resource checks. Ensures every session
  produces a minimum task update without empty sessions. Includes planning
  before coding, immutable board discipline, and clear session lifecycle
  management.
tags:
  - codex
  - workflow
  - task-first
  - artifact-guarantee
  - immutable
  - board-discipline
  - resource-checks
  - planning
---
## Codex Cloud — Boot (immutable)
- Open **docs/agents/codex-cloud.md** before anything else.
- Read **docs/reports/codex_cloud/latest/{INDEX.md,summary.tsv,eslint.json}** as the baseline.

## Codex Cloud — Task-first, every session
- Do nothing off-board. Every session must be attached to exactly one task.
- If no fitting task exists, create one in `docs/agile/tasks/` append-only.
- Use a single, canonical status hashtag per task; do not edit the board file.

## Codex Cloud — Artifact guarantee (no empty sessions)
- **At session start (within 1 minute)**: append a `### Session

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
