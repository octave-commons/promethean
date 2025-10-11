---
uuid: "b9a688c4-5860-42e5-bee4-874dfeeaa739"
title: "Fix simtasks pipeline orchestration"
slug: "Fix simtasks pipeline orchestration"
status: "ready"
priority: "P2"
labels: ["pipeline", "reliability"]
created_at: "2025-10-11T19:22:57.819Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🛠️ Task: Fix simtasks pipeline orchestration

### Context
- Piper reports show all `simtasks` executions failing or being skipped after early step errors.
- The JSON configuration already enumerates the full pipeline, but package-level implementations remain incomplete.
- Restoring `simtasks` unlocks automation for simulation task synthesis and ensures parity with DocOps stability.

### Definition of Done
- [ ] Reproduce the current failure locally and capture logs for each failing step.
- [ ] Implement the missing functionality or configuration needed for the pipeline to reach completion.
- [ ] Produce and commit a successful pipeline report in `docs/agile/pipelines/simtasks.md` documenting outputs and follow-ups.
- [ ] Add regression tests or smoke checks so the pipeline stays green in future runs.

### Suggested Plan
1. Execute `piper run simtasks` with debug logging to isolate the first failing step.
2. Inspect `packages/@promethean/simtasks` and its wrapper scripts for missing exports, schema mismatches, or environment requirements.
3. Patch the implementation, including AJV schemas or LevelDB cache usage, to satisfy the configured steps.
4. Confirm successful reruns and backfill the Markdown run report.

### References
- `pipelines.json` (`simtasks` definition)
- `packages/@promethean/simtasks`
- Piper cache at `.cache/piper.level`
- `docs/agile/pipelines/` for report examples



