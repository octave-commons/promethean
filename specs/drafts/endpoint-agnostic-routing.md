# Spec Draft: Endpoint-Agnostic Provider Routing for /v1/responses

## Summary
Enable /v1/responses to route to providers that serve the requested model even when they require provider-specific OpenAI-compatible endpoints (e.g., Factory.ai). The proxy should choose the provider route based on model availability and then use the correct provider endpoint, without forcing the client to pick a different API path.

## Open Questions
- Does Factory.ai accept non-streaming Responses requests (stream=false) on `/api/llm/o/v1/responses`? If not, we may need to always stream and translate.
- Are there other providers (requesty/openrouter) that require chat-completions only for `/v1/responses` requests, and should we implement a general responses→chat fallback now?

## Risks
- Incorrect endpoint selection could break existing /v1/responses behavior for non-factory providers.
- Forcing stream=true could change client expectations (latency, memory usage).
- Adding provider-specific passthrough logic without tests could regress proxy routing.

## Priority
High — current /v1/responses flow fails to reach Factory.ai for GPT-5.4, causing model unavailability.

## Implementation Phases
1. **Investigation**
   - Confirm current /v1/responses uses generic `ResponsesPassthroughStrategy` for factory provider routes.
   - Identify required Factory endpoint + headers for responses passthrough.
2. **Implementation**
   - Add `FactoryResponsesPassthroughStrategy` that preserves responses payload, applies Factory headers, and targets `/api/llm/o/v1/responses`.
   - Ensure factory routes use this strategy in responses passthrough flows.
3. **Verification**
   - Add/extend tests to assert /v1/responses uses the Factory endpoint and headers when the provider is factory.
   - Run targeted tests for the new behavior.

## Affected Files
- `.env.example`
- `docker-compose.yml`
- `models.example.json`
- `src/lib/config.ts`
- `src/lib/provider-strategy.ts`
- `src/lib/request-log-store.ts`
- `src/lib/ui-routes.ts`
- `web/src/lib/api.ts`
- `web/src/pages/DashboardPage.tsx`
- `src/tests/factory-strategy.test.ts`
- `src/tests/policy.test.ts`
- `src/tests/proxy.test.ts`
- `receipts.log`
- `.ημ/*`

## Dependencies
- Factory compatibility helpers: `src/lib/factory-compat.ts`

## Existing Issues / PRs
- None referenced.

## Definition of Done
- /v1/responses routes to Factory.ai using `/api/llm/o/v1/responses` with Factory headers when factory is selected.
- Tests cover the factory /v1/responses routing path.
- Targeted tests pass.

## Progress
- [x] Investigation: confirmed responses passthrough skipped Factory endpoint logic.
- [x] Implementation: added Factory responses passthrough strategy + routing order.
- [x] Verification: `pnpm run build`, `node --test dist/tests/factory-strategy.test.js`, `pnpm test`.
- [x] Validation: live proxy `/v1/responses` call returned 200 via Factory endpoint.
