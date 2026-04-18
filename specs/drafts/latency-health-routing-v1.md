# Latency-first routing + deep performance telemetry (v1)

## Mission
Optimize routing and observability for **lowest possible latency** while preserving cost-awareness:

Priority order:
1. **TTFT** (time to first token)
2. **Cost** (prefer free plan if TTFT is within a configurable grace window)
3. **TPS** (tokens/sec)

Also provide guarantees/visibility:
- Every token counted in dashboard stats (no silent drops).
- Prompt-cache read/write stats and prompt-affinity hit/miss stats.
- Health scoring incorporates availability + speed + transient concurrency debuffs.
- Dashboard defaults to ordering accounts by health/perf, but can sort by current fields.

## Current state (observed)
- Usage totals come from `RequestLogStore` (file-backed ring buffer). Tokens can be lost if entries rotate before dashboard aggregation.
- Usage extraction relies on `response.clone().text()` for SSE streams (works but allocates full stream text).
- `AccountHealthStore` tracks only success/failure counts; no latency/TPS.
- UI overview sorts accounts by totalTokens/requestCount.

## Design
### 1) Metrics model
Introduce a lightweight perf+cache stats store keyed by:
- providerId
- accountId
- routedModel
- upstreamMode
- stream (bool)

Per key we track:
- requestCount, okCount, errorCount
- EWMA: ttftMs, tps
- reservoir sample for percentiles (optional v2)
- inFlight estimate + concurrency penalty (transient)
- cache:
  - promptCacheKeyUsedCount
  - cacheHitCount (cached_tokens > 0)
  - cachedPromptTokensTotal

Also track aggregated token totals in hour buckets (24h / 7d) so dashboard totals are stable even if per-request logs truncate.

### 2) Streaming instrumentation (no full-buffer clone)
For streamed upstream responses, tap the byte stream while piping to the client:
- measure first chunk arrival (TTFT proxy)
- incrementally parse SSE events to extract usage / cached_tokens from final events
- compute duration and TPS

Additionally, force `stream_options.include_usage=true` when safe to ensure usage is present.

### 3) Routing algorithm
Add a dynamic ordering step before attempting accounts:
- Comparator is lexicographic with grace windows:
  - lower effectiveTTFT wins
  - if within TTFT_GRACE_MS, prefer cheaper plan
  - if cost equal (or within grace), prefer higher TPS
- Apply transient debuff based on:
  - current in-flight streams for that (provider, account, model)
  - recent degradation vs EWMA baseline

### 4) Dashboard + API
- Extend `/api/ui/dashboard/overview`:
  - add perf fields (ttftMs/tps) and cache fields
  - default sort = health/perf
  - allow sort query `?sort=tokens|requests|health|ttft|tps|errors`
- Add `/api/ui/dashboard/cache` and `/api/ui/dashboard/perf` for detailed breakdown.

## Phases
1. **Durable token totals**: add rolling bucket aggregates to RequestLogStore and expose in overview.
2. **Perf tap**: compute TTFT/TPS per attempt; persist into RequestLogStore + new PerfStore.
3. **Routing**: integrate perf-aware ordering with cost grace.
4. **Dashboard sorting + drilldowns**.
5. **Transient debuffs**: concurrency + degradation half-life.

## Definition of done
- Token totals in overview match sum of request log tokens even under high load + entry truncation.
- Cache hit/miss and cached_tokens appear in dashboard.
- Per-account/provider/model TTFT and TPS visible.
- Default dashboard ordering = health/perf; old sort still available.
- Routing prefers lower TTFT, then free-within-grace, then TPS.
