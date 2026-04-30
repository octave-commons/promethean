# Spec Draft: Dashboard usage window modes (daily/weekly/monthly)

## Goal
Add a **weekly usage graph** to the Open Hax proxy dashboard by making the existing usage counters/trends switchable between **daily / weekly / monthly** windows.

Concretely:
- Dashboard metrics (Requests, Tokens, Images, Error Rate, etc.) reflect the selected window.
- The existing sparkbar trends also reflect the selected window.

## Non-goals
- Per-account / per-model historical breakdown beyond what is already available.
- Replacing the sparkbar UI with a full axis/legend chart (keep current style).

## Current state (evidence)
- `/api/ui/dashboard/overview` returns `summary.*24h` and hourly `trends.*` covering the last 24 hours.
- Backend source: `src/lib/ui-routes.ts` uses `RequestLogStore.snapshotHourlyBuckets()` and keeps ~8 days of hourly buckets.
- `RequestLogStore` currently does **not** retain month-scale aggregates.

## Design
### API
Extend `/api/ui/dashboard/overview` with a query parameter:
- `window=daily|weekly|monthly` (default: `daily`)

Response additions (backwards-compatible fields kept):
- `window: "daily" | "weekly" | "monthly"`
- Existing `summary.*24h` fields will represent the selected window values (field names remain for now).

### Storage
Extend `RequestLogStore` persistence with **daily buckets**:
- Maintain `dailyBuckets: Map<dayStartMs, DailyBucket>`.
- Retain ~45 days of daily buckets.
- Keep existing hourly buckets retention (~8 days) for the `daily` window.

### Trend resolution
- `daily`: 24 points @ 1h resolution (existing)
- `weekly`: 7 points @ 1d resolution
- `monthly`: 30 points @ 1d resolution

### UI
Add a small `Window` selector on the Dashboard page:
- Daily (24h)
- Weekly (7d)
- Monthly (30d)

Update the metric card labels to match the selected window.

## Risks
- Existing `summary.*24h` naming becomes semantically inaccurate for weekly/monthly (kept for minimal surface area).
- `topModel`/`topProvider` remain best-effort (derived from capped entries) until we add model/provider aggregates.

## Affected files
- `src/lib/request-log-store.ts`
- `src/lib/ui-routes.ts`
- `web/src/lib/api.ts`
- `web/src/pages/DashboardPage.tsx`
- `src/tests/request-log-store.test.ts`

## Definition of done
- Dashboard offers daily/weekly/monthly window selector.
- Switching windows updates summary counters and trend bars.
- Daily window unchanged from current behavior.
- `pnpm test` passes.
