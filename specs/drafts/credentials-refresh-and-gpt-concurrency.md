# Spec Draft: Credentials Refresh Controls and GPT Concurrency Stability

## Summary
Harden day-to-day proxy operations by keeping work on the dedicated dev instance, adding operator controls for OpenAI OAuth refresh, compacting the credentials page into a fixed-height internal-scroll layout, and tightening GPT routing so OpenAI accounts are preferred even when VivGrid has historically lower TTFT.

## Open Questions
- None.

## Risks
- Increasing refresh concurrency too aggressively could spike token refresh traffic against the OpenAI auth service.
- Tightening GPT provider preference must not break intentional fallback once OpenAI accounts are actually unavailable.
- Credentials-page layout changes must preserve usability on smaller screens.
- Dev-instance changes must not disturb the stable containerized proxy while Shibboleth is running.

## Priority
High — current operator workflow is painful with hundreds of OpenAI accounts, expired tokens are hard to recover in bulk, and GPT traffic can drift onto VivGrid when provider health heuristics get noisy.

## Implementation Phases
1. **Investigation**
   - Confirm existing dev-instance path and whether it already shares the SQL database.
   - Trace OpenAI OAuth refresh paths used by request handling, quota refresh, and the credentials UI.
   - Confirm why GPT requests can still prefer VivGrid when latency history looks better.
2. **Backend controls + routing hardening**
   - Add a manual OpenAI OAuth refresh UI endpoint for one account or all accounts.
   - Make token refresh throughput configurable and raise the default concurrency for large-account fleets.
   - Persist refreshed OpenAI plan metadata during app-level token refresh.
   - Prevent GPT cross-provider latency overrides from leapfrogging OpenAI preference with VivGrid.
3. **Credentials-page UX**
   - Add toolbar controls to refresh credentials data and trigger OpenAI OAuth refresh.
   - Make the credentials page fixed-height with no body/root overflow; only panel-level scroll regions should scroll.
   - Compact account cards and collapse lower-priority admin sections so more accounts fit on screen.
   - Ensure the dev web instance can talk to the dev API instance.
4. **Verification**
   - Add regression coverage for manual refresh and GPT provider ordering stability.
   - Run targeted tests, then `pnpm run build`, `pnpm run web:build`, and `pnpm test`.

## Affected Files
- `specs/drafts/credentials-refresh-and-gpt-concurrency.md`
- `receipts.log`
- `src/app.ts`
- `src/lib/config.ts`
- `src/lib/provider-strategy.ts`
- `src/lib/ui-routes.ts`
- `src/tests/proxy.test.ts`
- `web/src/App.tsx`
- `web/src/lib/api.ts`
- `web/src/pages/CredentialsPage.tsx`
- `web/src/styles.css`
- `scripts/dev-watch.sh`
- `README.md`
- `.env.example`

## Dependencies
- `TokenRefreshManager` in `src/lib/token-refresh-manager.ts`
- OpenAI OAuth refresh logic in `src/lib/openai-oauth.ts`
- Provider fallback execution in `src/lib/provider-strategy.ts`
- Credentials UI data from `src/lib/ui-routes.ts` and `web/src/lib/api.ts`
- Existing host PM2 dev-instance scripts/config (`ecosystem.dev.config.cjs`, `scripts/dev-start.sh`)

## Existing Issues / PRs
- Live operator report: OpenAI accounts do not appear to refresh reliably enough for large fleets.
- Live operator report: credentials page is too tall and body-level scrolling makes it cumbersome to manage many accounts.
- Live operator report: VivGrid minute-rate behavior can disturb GPT traffic when provider health heuristics get noisy.
- Existing dev instance already exists on `127.0.0.1:8795` / `127.0.0.1:5175`, but its web API base mapping needs verification.

## Definition of Done
- A dedicated button on the credentials page can trigger OpenAI OAuth refresh across stored accounts.
- The credentials page has no body/root overflow at desktop sizes; scrolling happens inside page panels only.
- The credentials page is visibly denser, allowing more accounts per screen.
- GPT traffic honors provider preference for OpenAI over VivGrid despite historical TTFT differences.
- Refresh throughput is materially improved for large OpenAI account fleets.
- Dev web/API instance works on the dev ports while sharing the same database configuration.
- `pnpm run build`, `pnpm run web:build`, and `pnpm test` pass.

## Progress
- [x] Investigation: confirmed an existing PM2 dev instance on `8795/5175`; it reuses `.env` and therefore the same `DATABASE_URL` when configured. Confirmed credentials UI lacks a manual OpenAI refresh control, the page shell is not fixed-height on `/credentials`, refresh concurrency is hardcoded to `5`, and GPT cross-provider sorting can override policy order using TTFT history.
- [ ] Implementation
- [ ] Verification
