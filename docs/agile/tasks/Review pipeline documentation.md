---
uuid: 9f621ec3-91d2-42cf-a8af-b1eafe7c4041
title: review pipeline documentation in README
status: document
priority: P3
labels: []
created_at: '2025-09-18T19:28:54Z'
---
## 🛠️ Task: Review pipeline documentation in README

### Context
- The root README now lists every pipeline defined in `pipelines.json` with step summaries.
- Future changes to `pipelines.json` need manual confirmation so the README stays accurate.

### Definition of Done
- [ ] Compare the README pipeline section against the current `pipelines.json` contents.
- [ ] Update descriptions, environment notes, or step listings if the pipeline config changes.
- [ ] Record any follow-up issues that arise from mismatches.

### Suggested Plan
1. Diff `pipelines.json` against the last documented state.
2. Regenerate or adjust the README summaries as needed.
3. Flag large behavioural changes to the automation owner.

### References
- `README.md` (Automation pipelines section)
- `pipelines.json`
