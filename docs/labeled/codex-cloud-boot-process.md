---
uuid: b578b578-3092-41fa-af7f-6d80f6c37ea7
created_at: '2025-09-19T20:21:00Z'
title: 2025.09.19.20.21.00
filename: Codex Cloud Boot Process
description: >-
  Immutable boot procedures for Codex Cloud, including baseline checks,
  maintenance scripts, session timeboxing, and resource awareness. Ensures
  consistent state through append-only logs and strict handoffs.
tags:
  - immutable
  - boot
  - codex-cloud
  - timeboxing
  - resource-aware
  - append-only
  - handoffs
  - maintenance
related_to_uuid: []
related_to_title: []
references: []
---
## Boot — Codex Cloud (immutable)

- Open **docs/agents/codex-cloud.md** and load all rules there before doing anything else.
- Read **docs/reports/codex_cloud/latest/{INDEX.md,summary.tsv,eslint.json}** as the build/test **BASELINE**.
- If **latest/** is missing or older than ~8h, you MAY run:
  `TIMEOUT_SECS=${TIMEOUT_SECS:-90} STRICT=0 bash run/codex_maintenance.sh`
  (Never run `run/setup_codex_dev_env.sh`.)
- While working, if an expected resource (db, app instance, SDK, system deps) is missing or failing:
  1) consult the **latest baseline + run logs** in `docs/reports/codex_cloud/`,
  2) append findings to the current task’s log,
  3) if still blocked, create/link a small unblocker task and stop.

## Codex Cloud — Boot (immutable)

- Open **docs/agents/codex-cloud.md** and load its rules before anything else. :contentReference[oaicite:0]{index=0}
- Read **docs/reports/codex_cloud/latest/{INDEX.md,summary.tsv,eslint.json}** as the baseline for build/test/lint state. :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}
- If `latest/` is missing or stale (~8h+), you MAY run the maintenance script to refresh current artifacts, which also updates `latest/`. :contentReference[oaicite:3]{index=3}

## Codex Cloud — Session timebox & handoffs

- Treat **Time** as the number of **Codex Cloud sessions** (`time_sessions`). Use Fibonacci (1,2,3,5,8,13). Score = ceil(max(complexity, scale, time_sessions)).  
- Plan work in **session-sized slices**. Every few minutes, checkpoint: append a brief log to the task and commit minimal, reversible progress.  
- At **T−3 min** (soft limit approaching): finalize a **handoff** in the task (append-only): summary, next actions, links (PR/commit, `docs/reports/codex_cloud/latest/INDEX.md`), estimate deltas, and current status. Then stop cleanly. :contentReference[oaicite:4]{index=4}

## Codex Cloud — Resource/compute awareness

- If an expected resource (live DB, app instance, SDK, system deps) is missing or failing:  
  1) Inspect the **baseline + run logs** under `docs/reports/codex_cloud/`. :contentReference[oaicite:5]{index=5}  
  2) Append findings to the task (append-only).  
  3) If the task is **long-wait/compute-heavy**, prefer delegation: create/link a small **unblocker** task for the CLI agent (tag with `#agent-specific` and note “CLI”), then pause Cloud work. :contentReference[oaicite:6]{index=6}

## Codex Cloud — Board discipline (always)

- Never edit the board directly; tasks drive the board. Work only on tasks on the board. :contentReference[oaicite:7]{index=7}
- Respect WIP and status flow exactly as defined in `process.md`; keep changes append-only in the task.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
