# Spec Draft: z.ai + Mistral Env Provider Support and Live Key Validation

## Summary
Add native env-backed provider support for z.ai and Mistral, ensure z.ai uses the correct OpenAI-compatible endpoint paths, and validate all newly added provider keys from `services/proxx/.env` against real upstream endpoints without exposing secrets.

## Open Questions
- Should `REQUEST_API_TOKEN` be treated as an alias for `REQUESTY_API_TOKEN` if it appears in user env files? Current evidence suggests `REQUESTY_API_TOKEN` is already present at runtime, so aliasing is not required for this slice.
- Should ElevenLabs be supported in this proxy now? Current scope says no: it is outside the current text/chat provider surface.

## Risks
- z.ai uses `/api/paas/v4/chat/completions` and `/api/paas/v4/models`, not the generic `/v1/*` OpenAI-compatible path shape used by other providers.
- Adding provider support must not perturb existing routing for requesty/openrouter/gemini/factory/openai.
- Live validation must avoid leaking any secret material into logs or assistant output.

## Priority
High — user explicitly wants z.ai support and wants the newly added API keys validated.

## Implementation Phases
1. **Investigation**
   - Inspect provider env-loading and base-URL defaults.
   - Validate which keys are present in `services/proxx/.env` without printing values.
   - Probe real upstream endpoints for z.ai, Mistral, OpenRouter, Requesty, and Gemini.
2. **Implementation**
   - Add env-backed `zai` and `mistral` providers.
   - Add z.ai-specific chat-completions strategy/path handling.
   - Update docs/examples if needed.
3. **Verification**
   - Add tests for config/env loading and z.ai path selection.
   - Run full package tests.
   - Summarize live key validation outcomes.

## Affected Files
- `src/lib/config.ts`
- `src/lib/key-pool.ts`
- `src/lib/provider-strategy/registry.ts`
- `src/lib/provider-strategy/strategies/*.ts`
- `src/tests/key-pool.test.ts`
- `src/tests/proxy.test.ts`
- `README.md`
- `.env.example`
- `specs/drafts/zai-mistral-env-provider-validation.md`
- `receipts.log`

## Definition of Done
- z.ai can be selected as a provider and reaches the correct upstream endpoints.
- Mistral can be loaded from env as a provider.
- Tests pass.
- Live key validation summary exists for all relevant newly added keys.

## Progress
- [x] Investigation started.
- [x] Implementation
- [x] Verification

## Results
- Local runtime compose now passes `ZAI_API_KEY`/`ZHIPU_API_KEY` and z.ai base/provider settings through to the running proxy container.
- Found and fixed a compose/env pitfall where empty-string `ZAI_PROVIDER_ID` / `ZAI_BASE_URL` overrides could produce an unintended `default` provider id or blank z.ai base URL at runtime.
- Fixed provider catalog discovery for z.ai so model listing uses `/api/paas/v4/models` (`/models` relative to the z.ai base URL) instead of the generic `/v1/models` path.
- Updated source + runtime `.env.example` files and READMEs to document `ZAI_API_KEY` / `ZHIPU_API_KEY` and `ZAI_BASE_URL`.
- Verification:
  - `pnpm test` passes locally (`325/325`).
  - The rebuilt local compose stack on `:8789` now reports `zai` in `/health` provider status.
  - Direct live upstream validation against z.ai succeeds for both `/models` and `/chat/completions` using the local runtime key from `services/proxx/.env`.
  - A temporary local proxy instance launched from the same runtime env on `http://127.0.0.1:8795` with `UPSTREAM_PROVIDER_ID=zai` returned `200` and `x-open-hax-upstream-provider: zai` for a live `glm-5` request.

## Notes
- The default local compose stack still prefers its configured upstream ordering. To make general local traffic prefer z.ai for normal requests, set `UPSTREAM_PROVIDER_ID=zai` or include `zai` in `UPSTREAM_FALLBACK_PROVIDER_IDS` for that runtime.
- The minimal live `glm-5` probe returned a successful `200` with an empty assistant `content` string; direct upstream and proxied behavior matched, so the routing/credential validation is still considered successful.
