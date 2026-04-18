# Spec Draft: Ollama Thinking Mapping and models.dev Pricing

## Summary
Implement `think: false|true` mapping for Ollama-family requests, replace hand-maintained token pricing guesses with a models.dev-backed pricing source, and make Ollama token accounting explicit and regression-tested in request logs.

## Open Questions
- For local Ollama models with no hosted per-token bill, should cost remain `0` while still tracking token counts and energy/water estimates? Current proposal: yes.
- For router/providers with no direct models.dev price but a known underlying vendor family, should pricing fall back to the canonical vendor entry from models.dev? Current proposal: yes, with explicit provider-family mapping.

## Risks
- Provider-specific pricing differs across routers, so provider-aware lookup is required; model-only lookup will misprice traffic.
- Some models.dev entries omit price for a specific router provider, so fallback rules must be deterministic and non-hallucinatory.
- Adding Ollama `think` mapping must not override explicit caller-provided Ollama controls.

## Priority
High — the user explicitly wants Ollama thinking control, models.dev-backed pricing, and reliable Ollama token tracking.

## Implementation Phases
1. **Investigation**
   - Inspect current Ollama request translation and token accounting paths.
   - Inspect current pricing heuristics and all cost call sites.
2. **Implementation**
   - Add `think` mapping in `src/lib/ollama-compat.ts`.
   - Add provider-aware models.dev pricing lookup in `src/lib/model-pricing.ts`.
   - Update call sites to use provider-aware pricing.
   - Add explicit Ollama token-tracking regression coverage.
3. **Verification**
   - Run focused tests, then full package tests.

## Affected Files
- `src/lib/ollama-compat.ts`
- `src/lib/ollama-native.ts`
- `src/lib/model-pricing.ts`
- `src/lib/data/models-dev-pricing.json`
- `src/lib/data/models-dev-pricing-data.ts`
- `src/lib/provider-strategy/shared.ts`
- `src/lib/request-log-store.ts`
- `scripts/update-models-dev-pricing.mjs`
- `src/tests/proxy.test.ts`
- `src/tests/request-log-store.test.ts`
- `src/tests/model-pricing.test.ts`
- `specs/drafts/ollama-thinking-modelsdev-pricing.md`
- `receipts.log`

## Dependencies
- models.dev `api.json` snapshot/data
- Existing request-log usage extraction for Ollama

## Definition of Done
- Ollama-family requests map normalized reasoning intent to `think: false|true` safely.
- Pricing comes from models.dev-derived data instead of manual guessed price tables.
- Request log accounting for Ollama token usage is covered by regression tests.
- Tests pass.

## Progress
- [x] Investigation started.
- [x] Implementation: added Ollama `think` mapping and `thinking` -> `reasoning_content` translation, switched pricing lookup to provider-aware models.dev snapshot data with vendor fallbacks for router gaps, and added explicit regression coverage for Ollama token logging plus pricing lookups.
- [x] Verification: `pnpm test` passed after Ollama think/token-tracking coverage and models.dev-backed pricing changes.
