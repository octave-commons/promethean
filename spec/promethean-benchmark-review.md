# Promethean Benchmark Package Review Spec

## Context
- **Request**: Audit `promethean/packages/benchmark` for code smells and overlap with other packages.
- **Focus**: runtime monitoring, provider wrappers, BuildFix integration, and benchmark orchestration.

## Key Code References
- `packages/benchmark/src/metrics/performance-monitor.ts:126-211` – snapshot creation stores `Promise` objects for event-loop lag and compares them to numeric thresholds.
- `packages/benchmark/src/benchmark-optimized.ts:48-63` & `packages/benchmark/src/benchmark-optimized.ts:437-452` – memory monitoring interval started in the constructor but never cleared, even after `disconnectAll`.
- `packages/benchmark/src/providers/path-utils.ts:1-34` vs `packages/pipelines/buildfix/src/path-resolution.ts:20-109` – duplicated repo-root discovery and directory helpers for BuildFix assets.
- `packages/benchmark/src/providers/buildfix.ts:245-343` plus `:476-1013` – provider reimplements BuildFix benchmarking, caching, process pools, and circuit-breakers.
- `packages/pipelines/buildfix/src/benchmark/memoized-benchmark.ts:41-260` & `packages/pipelines/buildfix/src/benchmark/run-memoized.ts:292-369` – existing BuildFix benchmark orchestration already handles the same temp/cache directories and CLI capabilities.
- `packages/benchmark/src/providers/ollama.ts:5-90` & `packages/benchmark/src/providers/openai.ts:5-88` – bespoke wrappers for Ollama/OpenAI APIs.
- `packages/pantheon/workflow/src/providers/ollama.ts:34-172` & `packages/pantheon/workflow/src/providers/openai.ts:5-17` – existing shared providers that already encapsulate model selection, streaming, and tool wiring.
- `packages/benchmark/src/benchmark.ts:13-132` vs `packages/benchmark/src/benchmark-optimized.ts:173-343` – two independent benchmark-suite implementations with diverging behavior.

## Existing Issues / PRs
- None located referencing the benchmark package or BuildFix duplication at the time of this review.

## Requirements
1. Enumerate code smells with concrete reproduction details (file + line) and explain operational impact.
2. Highlight duplication between `packages/benchmark` and other packages (notably `packages/pipelines/buildfix` and `packages/pantheon/workflow`).
3. Recommend remediation paths (e.g., reuse shared helpers, fix async handling, clean up intervals).

## Definition of Done
- Review notes cite every identified issue with precise file references.
- Duplication findings clearly map to the source package already providing that behavior.
- Recommended actions are actionable (reuse module X, await promise Y, store interval handle, etc.).
- Findings shared back to the user in a concise summary plus detailed bullet list.
