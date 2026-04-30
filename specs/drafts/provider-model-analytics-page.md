# Provider / Model Analytics Page

## Status
Draft

## Summary
Add a new analytics page focused on routing intelligence and observed suitability signals. Keep the existing dashboard as-is; create a separate page for deeper breakdowns.

Primary views:
1. **Global Model Stats**
   - How a model performs across all providers that can serve it.
   - Example metrics: requests, tokens, avg TTFT, avg TPS, error rate, estimated cost, cache hit rate, provider coverage count.
2. **Global Provider Stats**
   - How a provider performs across all models it serves.
   - Example metrics: requests, tokens, avg TTFT, avg TPS, error rate, estimated cost, model coverage count.
3. **Model Given Provider Stats**
   - How a specific provider performs for a specific model.
   - Example metrics: requests, tokens, avg TTFT, avg TPS, error rate, est. cost, cache hit rate, last seen, coverage.

## Why
The current dashboard gives account-level health and high-level traffic, but operators also need insight into the data the routing system should eventually rely on more heavily:
- per-model observed quality across providers
- per-provider observed quality across models
- provider+model pair suitability signals

This is aligned with existing roadmap/spec intent around:
- latency-first routing
- EWMA TTFT/TPS
- durable token totals
- suitability / health-oriented ordering

## Existing signals in the system
Already tracked:
- request logs with providerId, accountId, model, status, token counts, cost/env estimates
- perf summaries keyed by providerId + accountId + model + upstreamMode (EWMA TTFT/TPS)
- account health scores
- durable daily provider+model aggregates
- durable daily provider+account aggregates

Missing for this page:
- first-class API shape for provider/model rollups
- combined provider-level and model-level summary views
- provider+model drilldown UX

## Open Questions
- Should global model/provider views aggregate by request-weighted averages? Proposed: yes.
- Should provider+model views include per-account rows later? Proposed: yes, but not required for v1.
- Should suitability score be exposed directly in v1 or derived from visible primitives only? Proposed: expose a best-effort score plus raw components.

## Risks
- Metrics can be misleading if coverage is partial; the API should expose coverage flags similar to the dashboard overview.
- Provider-wide averages can hide bimodal per-model behavior; the drilldown must stay easy to reach.
- Suitability scoring must be labeled as heuristic, not ground truth.

## Implementation Phases

### Phase 1: Backend analytics API
- [x] Add analytics endpoint `/api/ui/analytics/provider-model` that returns:
  - coverage metadata
  - global model rows
  - global provider rows
  - provider+model pair rows
  - optional sort/window query params
- [x] Include metrics per row:
  - requests
  - tokens
  - prompt/completion/cached tokens
  - avg TTFT
  - avg TPS
  - error rate
  - cache hit rate
  - est cost
  - energy / water
  - firstSeen / lastSeen
  - coverageStart
  - heuristic suitability + confidence score

### Phase 2: Analytics page UI
- [x] Create a new page in the web app with:
  - top summary cards and coverage warning
  - sections for:
    - Models
    - Providers
    - Provider × Model detail table
  - sorting and filtering controls
  - search box for model/provider
  - provider/model focus controls for pair-level exploration

### Phase 3: Suitability view
- [x] Define and expose a best-effort suitability score for routing insight using visible components such as:
  - normalized TTFT
  - normalized TPS
  - error rate penalty
  - sample size confidence
  - cache behavior component
- [x] Label suitability as heuristic rather than ground-truth routing authority.

### Phase 4: Verification
- [x] Add tests proving:
  - aggregation works with partial coverage
  - provider/global/model rows are computed from durable aggregates
  - provider+model pair rows are returned correctly
- [x] Verify the package still builds/tests cleanly and local compose serves the new page/assets.

## Affected files
- `specs/drafts/provider-model-analytics-page.md`
- `src/lib/request-log-store.ts` (reuse / possibly extend helper queries)
- `src/lib/ui-routes.ts`
- `src/tests/proxy.test.ts`
- `web/src/lib/api.ts`
- `web/src/App.tsx`
- new `web/src/pages/AnalyticsPage.tsx`
- `web/src/styles.css`

## Definition of done
- Existing dashboard unchanged.
- New analytics page available in nav.
- Operators can inspect:
  - global model stats
  - global provider stats
  - model-given-provider stats
- Coverage partiality is explicit.
- Tests and builds pass.
