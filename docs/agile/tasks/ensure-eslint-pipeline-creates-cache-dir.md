$$
uuid: e502a45a-eb4b-4cd9-92c0-6d1e86b532d4
$$
title: ensure eslint pipeline creates cache dir
status: todo
priority: P2
labels: ["pipeline", "eslint", "devex"]
$$
created_at: '2025-10-07T01:00:44Z'
$$
---
## 🛠️ Description
Guard the `eslint-tasks` pipeline against failures on fresh clones by ensuring the `.cache/eslint` directory exists before redirecting lint output.

## 🧠 Pseudocode
```pseudo
edit pipelines.json
locate eslint-report step
wrap existing command with "mkdir -p .cache/eslint &&"
verify command still runs under pnpm exec
add lightweight unit test or script asserting cache dir exists pre-run
```

## 📦 Requirements
- Update `pipelines.json` so the ESLint report step creates `.cache/eslint` when missing.
- Maintain compatibility with existing formatting and tooling.
- Provide regression coverage (test or lint rule) to keep directory creation.

## ✅ Acceptance Criteria
- Running the pipeline on a clean checkout no longer fails due to missing `.cache/eslint`.
- ESLint report file still lands at `.cache/eslint/report.json`.
- Regression guard surfaces if directory creation is removed.

## Tasks

- [ ] Prefix ESLint pipeline command with directory bootstrap.
- [ ] Add regression guard (unit test, lint, or smoke script).
- [ ] Execute ESLint pipeline locally to confirm behaviour.

## Relevent resources
- `pipelines.json`
- `.cache/eslint`
- `scripts/piper-eslint-tasks.mjs`

## Comments
Coordinate on verify steps; pipeline runs can be long, so share test artifacts if possible.

## Story Points

- Estimate: 2
- Assumptions: ESLint CLI available via pnpm workspace.
- Dependencies: None beyond existing lint tooling.
