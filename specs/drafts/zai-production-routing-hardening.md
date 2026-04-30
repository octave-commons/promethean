# Spec Draft: z.ai Production Rollout and GLM Routing Hardening

## Summary
Add the official z.ai provider to the production proxx instance at `ussy.promethean.rest`, verify which z.ai usage/token/cache metrics are surfaced through the API and captured by proxx, and improve default GLM routing so Ollama is preferred over z.ai while retaining z.ai as a fallback.

## User-Observed Failure Modes
- Tool-calling death loops.
- Repeated reasoning traces.
- Random language switching.
- General hit-or-miss reliability on z.ai compared with stable Ollama GLM service.

## Open Questions
- Should z.ai be used only as a fallback for plain `glm-*`, or should some request shapes hard-exclude z.ai entirely?
- Do we want to add semantic failure detectors now, or first ship routing + production rollout and document the current metric gap?
- Is production currently driven by `orgs/open-hax/proxx/docker-compose.yml` with host-local `.env`, `keys.json`, and `models.json` under `~/devel/services/proxx`? Initial evidence says yes.

## Risks
- Production compose currently may not pass z.ai env vars through even if the host `.env` contains them.
- Suitability metrics today appear focused on speed/error/cache and may miss semantic model failures.
- Production rollout must not leak secrets while copying the z.ai key into the remote runtime.
- Reordering GLM routes must preserve existing fallback behavior when Ollama or z.ai is absent.

## Priority
High — explicit user request covering production rollout and routing quality.

## Implementation Phases
1. Investigation
   - Confirm what metrics z.ai exposes directly.
   - Confirm what proxx currently records and what it does not.
   - Inspect current production runtime state on `ussy.promethean.rest`.
2. Local hardening
   - Ensure production compose passes z.ai env vars.
   - Add deterministic GLM provider ordering that prefers Ollama first and z.ai second.
   - Add/update tests.
3. Production rollout
   - Add the z.ai key to the remote runtime `.env`.
   - Deploy the updated runtime to `ussy.promethean.rest`.
   - Verify `/health`, `/v1/models`, and a live GLM request through production.
4. Metric-gap assessment
   - Document whether current suitability metrics capture the reported GLM semantic failures.
   - Recommend the next instrumentation slice if the gap remains.

## Affected Files
- `docker-compose.yml`
- `src/lib/policy/defaults/gpt.ts`
- `src/tests/policy.test.ts`
- `specs/drafts/zai-production-routing-hardening.md`
- `receipts.log`

## Definition of Done
- Production `ussy.promethean.rest` shows provider `zai` in `/health`.
- Production runtime can reach z.ai-backed GLM models.
- Default GLM ordering prefers Ollama over z.ai when both are available.
- Test coverage exists for the new GLM provider ordering.
- We have a clear answer on which z.ai usage/cache/token metrics are surfaced and which semantic failures are still invisible to suitability scoring.

## Progress
- [x] Investigation
- [x] Local hardening
- [x] Production rollout
- [x] Metric-gap assessment

## Results
- Direct z.ai API responses expose OpenAI-style `usage` with:
  - `prompt_tokens`
  - `completion_tokens`
  - `total_tokens`
  - `prompt_tokens_details.cached_tokens`
  - `completion_tokens_details.reasoning_tokens`
- The proxy response surface preserves that `usage` object for z.ai-backed chat completions, and request-log persistence now records the z.ai prompt/completion/total/cached-token counts after the chat-completions usage-extraction fix.
- Production compose did not previously pass z.ai env vars through; this is now fixed in `docker-compose.yml`.
- Production host `ussy.promethean.rest` already had `ZAI_API_KEY` in its runtime `.env`; only the compose passthrough and fallback ordering were missing.
- Production runtime `.env` now sets `UPSTREAM_FALLBACK_PROVIDER_IDS=ollama-cloud,zai,requesty`.
- After deploy, both local and public production health checks report provider `zai`.
- Production `/v1/models` now includes z.ai-only GLM variants such as `glm-5-turbo` and `glm-4.5-air` in addition to the existing Ollama-backed GLM models.
- Live production verification:
  - `glm-5` routed to `ollama-cloud`
  - `glm-5-turbo` routed to `zai`
- A new default policy rule now prefers providers for `glm-*` in this order:
  1. `ollama-cloud`
  2. `zai`
  3. `requesty`
  4. `factory`
  5. `openrouter`
  6. `openai`
  7. `vivgrid`

## Metric Gap Assessment
- Current provider-model suitability scoring is mostly operational, not semantic.
- Today it is driven by:
  - request count / confidence
  - error rate
  - TTFT
  - TPS
  - cache hit rate
- It does **not** currently detect or score:
  - tool-calling death loops
  - repeated reasoning traces
  - random language switching
  - other semantically broken but HTTP-200-successful generations
- The remaining gap is therefore semantic, not basic operational telemetry: the system now records z.ai token/cache counts, but it still cannot distinguish a semantically healthy answer from a 200-successful tool loop or language drift event.
