---
uuid: "aeed625c-0cb1-490d-aa15-19b39d96fc3e"
title: "Restore symdocs pipeline execution in Piper"
slug: "Restore symdocs pipeline execution"
status: "ready"
priority: "P2"
labels: ["pipeline", "reliability"]
created_at: "2025-10-11T03:39:14.373Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Task: Restore symdocs pipeline execution in Piper

### Context
- Recent pipeline health review shows every `symdocs` run aborts while DocOps succeeds.
- Piper orchestrator already has `symdocs` wired in `pipelines.json`, so the failures stem from missing step implementations or misconfigured wrappers.
- Stabilising `symdocs` unblocks downstream doc intelligence flows and brings parity with the working DocOps run.

### Definition of Done
- [ ] Identify and document the failing `symdocs` step(s) with reproducible logs.
- [ ] Implement or repair the corresponding package runners so the pipeline completes end-to-end in Piper.
- [ ] Capture a successful pipeline report under `docs/agile/pipelines/symdocs.md` (or equivalent) with current artefacts.
- [ ] Update fingerprints or cache hints if needed so subsequent runs skip cleanly when inputs unchanged.

### Suggested Plan
1. Re-run `symdocs` via Piper with verbose logging and inspect `.cache/piper.level` entries for error signatures.
2. Audit `scripts/piper-symdocs` (or package entrypoints) to confirm exported handlers match `pipelines.json` step schema.
3. Patch missing implementations or configuration (AJV schemas, env variables, concurrency guards) and add regression tests where practical.
4. Re-run the pipeline to confirm success, then publish the Markdown report.

### References
- `pipelines.json` (`symdocs` definition)
- `packages/@promethean/symdocs` sources and README
- `scripts/` Piper bridge scripts for symdocs
- `docs/agile/pipelines/` for existing report format
