# Dynamic provider model discovery + preference-aware routing (v1)

## Mission
Move model availability to **dynamic discovery** via provider `/v1/models` (or provider-specific catalogs), while keeping `models.json` as a **preference/priority/disable** layer — not the source of truth.

Key goals:
- **Any model discovered from providers is routable.**
- `models.json` can **prioritize**, **alias**, or **disable** models, but discovery remains canonical (preferences do **not** add undiscovered models).
- Routing uses **provider suitability scoring** instead of rigid upstream/fallback.

## Problem statement
Current behavior treats `models.json` (or `DEFAULT_MODELS`) as the model list and uses upstream/fallback routing. This blocks discovered models (e.g., `factory/claude-opus-4-6`) unless explicitly listed and forces brittle provider selection.

## Requirements
### Functional
1. **Dynamic discovery**:
   - Poll provider `/v1/models` endpoints (and known alternates when required) to build a live model catalog.
   - Models returned from providers **must be eligible for routing** even if missing from `models.json`.
2. **Preference overlay**:
   - `models.json` can prioritize models, add aliases, or disable models.
   - Preference layer **does not remove** discovered models unless explicitly disabled, and does **not** add undiscovered models.
3. **Provider suitability**:
   - For each request, compute a **suitability score** per provider based on:
     - provider overall health
     - provider ability to serve the **specific model** consistently (model-specific non-200 rate)
     - time to first token (TTFT) for that model+provider
     - tokens per second (TPS) for that model+provider
   - Route to the **highest-scoring provider**; fallback becomes a tie-breaker rather than a top-level concept.
4. **Strategy reuse**:
   - Strategies are reusable across providers (OpenAI chat, OpenAI responses, Anthropic messages, Factory compat, etc.).
   - Provider-specific details live in provider adapters (base URL, headers, API quirks).

### Non-functional
- Cache discovery results with a reasonable TTL.
- Avoid blocking requests on slow discovery; use cached results when needed.
- Preserve current API compatibility (`/v1/models`, `/v1/chat/completions`, `/v1/responses`).

## Current state (observed)
- `models.json` is loaded by `loadModels()` and used as the model catalog source.
- Dynamic catalog is only used for Ollama `api/tags` → aliases.
- Routing uses upstream/fallback lists with special-case Factory prefixing.

## Proposed design
### 1) Provider registry + model discovery
Introduce a **ProviderCatalogStore** that periodically fetches model lists for each provider.

Inputs per provider:
- `providerId`
- `baseUrl`
- `authType` (api_key / oauth / none)
- `catalogEndpoints`: list of endpoints to probe (default `['/v1/models']`)
- `parseStrategy`: how to extract model IDs

Discovery behavior:
- Poll every `MODEL_CATALOG_REFRESH_MS` (default 30s–2m).
- On failure, keep last known catalog and mark provider as stale.
- Store catalog with metadata: `modelIds`, `fetchedAt`, `stale`, `sourceEndpoints`.

### 2) Preference overlay (`models.json`)
Redefine `models.json` as **preferences**, not canonical list.

Suggested shape:
```json
{
  "preferred": ["factory/claude-opus-4-6", "gpt-5.4"],
  "disabled": ["gemini-1.0-pro"],
  "aliases": { "qwen3.5": "qwen3.5:397b" }
}
```

Behavior:
- If a model is in `disabled`, exclude it even if discovered.
- If a model is in `preferred`, boost its routing priority.
- Preferred models only reorder discovered listings; they do not add undiscovered models.
- Aliases apply **after discovery**.

### 3) Suitability scoring
Compute a composite score per provider for the requested model.

Inputs (v1):
- **Availability** (hard gate): model present in provider catalog.
- **Provider overall health**: provider-level success/error health score.
- **Model-specific health**: per-(provider, model) success/error score (non-200 rate).
- **TTFT**: EWMA time-to-first-token for (provider, model).
- **TPS**: EWMA tokens/sec for (provider, model).

Scoring (v1):
- Start at 0.
- If model is unavailable: score = -∞.
- Add provider health bonus.
- Add model-specific health bonus.
- Add TTFT bonus (lower is better) with configurable weight.
- Add TPS bonus (higher is better) with configurable weight.
- Apply a small preference bonus if model is in `preferred` (from `models.json`).

### 4) Routing selection flow
1. Gather provider candidates with credentials.
2. For each provider, check catalog availability for the model.
3. Compute suitability score and sort.
4. Attempt providers in score order.

### 5) API exposure
- `/v1/models` should return:
  - **discovered models**, ordered with **preferred** models first
  - exclude **disabled** models
- Add `/api/ui/models/catalog` with:
  - per-provider catalogs + stale flags
  - preference overlays + alias mapping

## Migration plan
- Phase 1: add discovery store + expose union catalog in `/v1/models`.
- Phase 2: implement preference overlay and disabled filtering.
- Phase 3: integrate suitability scoring into routing.
- Phase 4: remove upstream/fallback semantics from config (keep compatibility flag).

## Risks
- Provider model catalogs can be incomplete or slow.
- Discovery adds latency if uncached.
- Preference overlay ambiguity (model names across providers).

## Open questions
- Default polling interval and stale threshold?
- How to resolve provider-specific model name normalization (e.g., `anthropic/` vs `claude-`)?
- Should preference entries support provider scoping (e.g., `factory/claude-opus-4-6` vs `claude-opus-4-6`)?

## Definition of done
- `/v1/models` lists all discovered models and preferred models.
- Requests can route to any discovered model without manual `models.json` entries.
- Routing uses suitability scoring; upstream/fallback is no longer required.
- Disabled models are excluded from routing and listing.


## References / related work
- **Research summary (1–2 sentences each)**
  - *The Tail at Scale* frames why tail latency dominates distributed request fan‑out and motivates hedging and smarter replica selection; it’s the conceptual basis for prioritizing TTFT and consistency in routing.
  - **C3** introduces adaptive replica selection using feedback on latency and queueing to rank replicas; this maps directly to per‑provider/per‑model scoring with dynamic feedback.
  - **Tars** improves on C3 by addressing stale feedback, reinforcing the need for fresh, EWMA‑style metrics (TTFT/TPS) in suitability scoring.
  - **L3** applies latency‑aware routing in multi‑cluster service meshes, aligning with scoring‑based selection over static upstream/fallback ordering.
  - **Morpheus** focuses on RTT prediction for performance‑aware load balancing; it supports using lightweight predictive metrics for routing when direct measurements are sparse.

- *The Tail at Scale* (Dean & Barroso) — tail-latency mitigation and hedged requests: https://www.andrew.cmu.edu/user/gaurij/18-847F-Readings/tail_at_scale.pdf
- **C3: Cutting Tail Latency in Cloud Data Stores via Adaptive Replica Selection** (NSDI ’15): https://www.usenix.org/system/files/conference/nsdi15/nsdi15-paper-suresh.pdf
- **Tars: Timeliness-aware Adaptive Replica Selection for Key-Value Stores** (arXiv): https://arxiv.org/abs/1702.08172
- **L3: Latency-aware Load Balancing in Multi-Cluster Service Mesh** (paper PDF): https://schmiste.github.io/mw24.pdf
- **Morpheus: Lightweight RTT Prediction for Performance-Aware Load Balancing** (arXiv): https://arxiv.org/abs/2510.20506
