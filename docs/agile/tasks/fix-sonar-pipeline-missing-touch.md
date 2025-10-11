---
uuid: "cd28d98a-1e9a-427d-8fa3-3768d944840e"
title: "fix sonar pipeline missing touch marker"
slug: "fix-sonar-pipeline-missing-touch"
status: "done"
priority: "P2"
labels: ["pipeline", "sonar", "buildfix"]
created_at: "2025-10-11T01:03:32.223Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🛠️ Description
Ensure the top-level `sonar` pipeline writes the `.cache/sonar/scan.touch` marker so downstream steps succeed on clean runs.

## 🧠 Pseudocode
```pseudo
parse pipelines.json
find sonar pipeline -> sonar-scan step
if shell command lacks "touch .cache/sonar/scan.touch"
  append "&& mkdir -p .cache/sonar && touch .cache/sonar/scan.touch"
write updated JSON preserving formatting
run pnpm --filter @promethean/sonarflow sonar:plan locally to verify marker usage
```

## 📦 Requirements
- Update `pipelines.json` so `sonar-scan` both runs `sonar-scanner` and creates the expected marker file.
- Keep command portable; handle missing `.cache/sonar` directory gracefully.
- Align behaviour with `packages/sonarflow/pipeline.json`.

## ✅ Acceptance Criteria
- Running the pipeline produces `.cache/sonar/scan.touch` on a clean workspace.
- No regressions in downstream `sonar-fetch`/`plan`/`write` steps.
- Tests or smoke checks demonstrate the marker exists after the step.

## Tasks

- [ ] Update pipeline command to create marker file.
- [ ] Add verification covering the marker creation.
- [ ] Run targeted pipeline or unit tests.

## Relevent resources
- `pipelines.json`
- `packages/sonarflow/pipeline.json`
- `.cache/sonar`

## Comments
Useful for agents to coordinate on implementation details and testing.

## Story Points

- Estimate: 2
- Assumptions: Sonar CLI available locally or in CI.
- Dependencies: Access to Sonar credentials or mocks for verification.

























