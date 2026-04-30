# Weekly Cost/Water Validation and Backfill

## Status
Draft

## Problem
Weekly dashboard `est cost` and `water consumption` are not currently trustworthy for a full 7-day window.

Observed issues:
- Raw request log retention is capped at 5000 entries, which currently covers only ~2 hours of live traffic.
- Persisted daily buckets currently cover only ~3 days in the local dataset, not 7.
- Historical buckets exist with `totalTokens > 0` but `costUsd = energyJoules = waterEvaporatedMl = 0`, indicating the environmental/cost estimates were introduced after some token history had already been recorded.
- Weekly top-model/top-provider stats are computed from recent raw logs instead of durable window aggregates, so they are also incomplete when raw entry retention is shorter than the selected window.
- Account rows use long-lived account accumulators rather than window-scoped aggregates, so weekly account stats are not truly weekly.

## Facts gathered
- `src/app.ts` constructs `RequestLogStore(config.requestLogsFilePath, 5000)`.
- `RequestLogEntry` includes `providerId`, `accountId`, `model`, `promptTokens`, `completionTokens`, `totalTokens`, `costUsd`, `energyJoules`, `waterEvaporatedMl`.
- `recordAttempt()` computes cost/env estimates from `estimateRequestCost(model, promptTokens, completionTokens)` and persists them on the request log entry.
- `buildUsageOverview()` uses daily buckets for weekly/monthly summary totals but uses raw recent logs for top model/provider and account accumulators for account rows.

## Open questions
- Should we backfill historical zeroed env/cost values only when prompt/completion token counts are present, leaving non-token entries untouched? Proposed: yes.
- Do we want true provider+model window aggregates persisted in the request log DB JSON structure, or only reconstruct them from retained entries/buckets at warmup time? Proposed: persist them.
- Should the UI expose a completeness flag/warning when selected window exceeds trustworthy retention? Proposed: yes.

## Risks
- Changing persisted request-log schema must remain backward-compatible.
- Rebuild/backfill logic must not double-count costs when existing non-zero estimates are present.
- Weekly dashboard numbers may change significantly after backfill and windowed aggregation corrections.

## Implementation phases

### Phase 1: Durable aggregate model
- [x] Add persisted daily aggregates keyed by provider+model and provider+account scoped to a day.
- [x] Add metadata about retained/trustworthy coverage (earliest entry ts, earliest bucket ts, earliest env-estimate ts).
- [x] Keep backward compatibility for existing `request-logs.json` files during JSONL migration.

### Phase 2: Backfill + rebuild
- [x] During warmup, rebuild or repair aggregates from entries.
- [x] For entries with token counts but missing/zero env-cost fields where pricing can be estimated, compute and store derived values during migration/rebuild.
- [x] Ensure daily buckets and derived aggregates become correct after one warmup.

### Phase 3: Dashboard correctness
- [x] Make weekly/monthly summary/top-provider/top-model/account views use window-scoped durable aggregates instead of raw-entry retention or all-time accumulators.
- [x] Return completeness/trustworthiness metadata from `/api/ui/dashboard/overview`.
- [x] Show warning text in UI when the requested window is not fully covered.

### Phase 4: Verification
- [x] Add regression tests for:
  - backfilling zero-cost historical entries with token counts
  - weekly overview using full window aggregates independent of raw-entry truncation
  - top model/provider computed from durable aggregates
  - account rows reflecting selected window rather than all-time totals
  - completeness metadata when history is incomplete

## Affected files
- `src/lib/request-log-store.ts`
- `src/lib/ui-routes.ts`
- `src/lib/model-pricing.ts` (maybe reuse only, likely no change)
- `src/tests/request-log-store.test.ts`
- `src/tests/proxy.test.ts` or dashboard-focused tests if present
- `web/src/lib/api.ts`
- `web/src/pages/DashboardPage.tsx`

## Definition of done
- Weekly dashboard cost/water stats are computed from trustworthy 7-day aggregates when data exists.
- Historical estimable token entries are backfilled so older buckets are not silently zeroed.
- Dashboard response includes clear coverage metadata.
- Tests prove weekly stats remain correct even when raw request entries are truncated.
- Local compose stack serves the corrected UI/API.
