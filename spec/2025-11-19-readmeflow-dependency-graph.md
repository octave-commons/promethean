# readmeflow dependency graph scope (2025-11-19)

## Context & References

- `pipelines/readmeflow/src/03-write.ts:110` mixes every README's generated content with the same `scan.graphMermaid`, so even leaf packages get the entire workspace graph.
- `pipelines/readmeflow/src/01-scan.ts:86`-`pipelines/readmeflow/src/01-scan.ts:104` builds a single Mermaid `flowchart` for all packages, storing it on `ScanOut.graphMermaid`.
- `pipelines/readmeflow/src/tests/outline.test.ts:24` seeds `graphMermaid` for fixtures, which currently assumes one graph shared by all README targets.

## Existing Issues / PRs

- No existing issue or open PR was observed for this change after reviewing the repo metadata locally.

## Requirements

1. Each README's "Package graph" should only show the package, its direct internal dependencies, and its direct internal dependents.
2. If a package has no internal dependency edges, omit the Mermaid block entirely instead of embedding a useless single-node diagram.
3. Do not regress the rest of the readmeflow pipeline; outline generation and remote README link injection must continue to work unchanged.

## Definition of Done

- readmeflow writes README files whose Mermaid block (when requested) is limited to dependents/ dependencies only.
- Automated tests covering readmeflow scanning/writing are updated to reflect the new per-package graph behavior.
- The pipeline continues to run end-to-end locally (at least through unit tests) without lint/type errors on touched files.

## Plan (Phases)

1. **Model Updates**: introduce a helper to derive per-package local graphs using existing `scan.packages` metadata; prefer to avoid schema churn but ensure helper can express both dependency directions.
2. **Writer Changes**: have `writeReadmes` request the helper per package (passing the scanned list) and skip Mermaid injection when the package has no edges; add a visual cue (class/style) around the focal node if feasible without complicating Mermaid.
3. **Validation**: extend the relevant tests (likely `pipelines/readmeflow/src/tests/cache.test.ts` or similar) to assert the helper behavior and ensure diagrams are contextual; run targeted test suites for readmeflow.

## Complications & Updates

- 2025-11-19: `pipelines/readmeflow/src/tests/outline.test.ts` surfaced a failing expectation for the fallback License section, so `pipelines/readmeflow/src/02-outline.ts:117` gained an explicit `'License'` entry to keep tests deterministic when no LLM is available.

## Change Log

- 2025-11-19: Initial analysis, requirements capture, and per-package graph plan recorded.
- 2025-11-19: Updated outline fallback to include static GPL license text for offline test coverage.
