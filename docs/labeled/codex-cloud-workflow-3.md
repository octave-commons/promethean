---
$$
uuid: 605201b7-c16d-4d35-833e-1f2560bd9113
$$
$$
created_at: '2025-09-19T20:41:26Z'
$$
title: 2025.09.19.20.41.26
filename: Codex Cloud Workflow
$$
description: >-
$$
  A structured workflow for managing Codex Cloud sessions with strict artifact
  guarantees, task-first principles, and resource checks. Ensures every session
  produces a minimum task update without empty sessions. Includes planning
  before coding, time-based estimation, and board discipline.
tags:
  - codex
  - workflow
  - task-first
  - artifact-guarantee
  - planning
  - resource-checks
  - board-discipline
  - immutable
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---
## Codex Cloud — Boot (immutable)
- Open **docs/agents/codex-cloud.md** before anything else.
- Read **docs/reports/codex_cloud/latest/{INDEX.md,summary.tsv,eslint.json}** as the baseline.

## Codex Cloud — Task-first, every session
- Do nothing off-board. Every session must be attached to exactly one task.
- If no fitting task exists, create one in `docs/agile/tasks/` $append-only$.
- Use a single, canonical status hashtag per task; do not edit the board file.

## Codex Cloud — Artifact guarantee (no empty sessions)
- **At session start (within 1 minute)**: append a `### Session Start` block to the task:
  - `session_id`, `start_time`, `goal`, `links` (board card, baseline INDEX.md), and the **current time remaining** if available.
- **During the session**: add short bullets under `### Attempts` (what you tried; key observations).
- **On exit / time low**: append `### Session End`:
  - `end_time`, `outcome: completed | partial | blocked`
  - `blockers` (with evidence), `next_actions`, `handoff_notes`
  - `artifacts`: PR/branch or explicit “no code this session”; always include at least this task update.
- Result: every session produces at minimum an append-only task update. Never end with nothing.

## Codex Cloud — Planning before coding
- Prioritize estimation, documentation, breakdown, and scoping **before** writing code.
- Normalize estimates using Fibonacci; for Cloud, treat **time** as `time_sessions` (1,2,3,5,8,13).
- **Only code if** all are true:
  1) task is well-scoped (acceptance criteria, subtasks),
  2) WIP rules allow `#InProgress`,
  3) **time remaining** is sufficient for a coherent coding slice + handoff (keep a buffer),
  4) resources required are present/healthy.
- If any condition fails, stay in process-mode: refine, estimate, document, and exit with a strong handoff.

## Codex Cloud — Resource checks
- If an expected resource $db/app/SDK/deps$ is missing/failing:
  1) check baseline + run logs in `docs/reports/codex_cloud/`,
  2) capture findings in the task $`### Attempts` / `### Session End`$,
  3) if long-wait/compute-heavy is required, create/link a small **unblocker** task and stop cleanly.

## Codex Cloud — Board discipline (always)
- Never edit the board directly; tasks drive the board.
- Keep changes append-only inside the task file; one status hashtag; respect WIP/flow.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
