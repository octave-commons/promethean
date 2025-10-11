---
uuid: "2690e363-4489-4828-bc07-88063262db13"
title: "Publish missing pipeline run reports"
slug: "Publish missing pipeline run reports"
status: "todo"
priority: "P3"
labels: ["documentation", "pipeline"]
created_at: "2025-10-11T19:22:57.821Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🛠️ Task: Publish missing pipeline run reports

### Context
- Only four Markdown reports exist under `docs/agile/pipelines/`, leaving most automation flows undocumented.
- Operators currently lack visibility into failure modes for codemods, semver-guard, board-review, sonar, buildfix, test-gap, and eslint-tasks.
- Publishing reports supports triage and knowledge sharing without rerunning pipelines locally.

### Definition of Done
- [ ] Execute or replay Piper runs for each undocumented pipeline (codemods, semver-guard, board-review, sonar, buildfix, test-gap, eslint-tasks).
- [ ] Generate Markdown reports summarising step outcomes, artefacts, and follow-ups in `docs/agile/pipelines/`.
- [ ] Highlight persistent failures and link to corresponding remediation tasks.

### Suggested Plan
1. Use Piper `status` or cached run data to gather results for each pipeline.
2. If no cached results exist, run pipelines in dry-run or targeted mode to collect failure traces.
3. Leverage the existing report renderer or manual templates to produce Markdown files for each pipeline.
4. Cross-reference newly created tasks to ensure blockers are tracked.

### References
- `docs/agile/pipelines/`
- `pipelines.json`
- Piper report generation scripts



