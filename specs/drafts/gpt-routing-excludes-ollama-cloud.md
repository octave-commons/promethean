# Spec Draft: GPT Routing Excludes Ollama Cloud

## Summary
Fix a regression where GPT models such as `gpt-5.2` still reach `ollama-cloud` during provider fallback, despite policy intending to reserve `ollama-cloud` for `gpt-oss` only.

## Open Questions
- None.

## Risks
- Tightening provider exclusion must not break non-GPT shared-model fallback behavior.
- Provider-policy changes must preserve normal reordering while honoring explicit exclusions.
- Regression coverage should prove both policy ordering and end-to-end request routing behavior.

## Priority
High — the current fallback path sends unsupported GPT requests to `ollama-cloud`, producing repeated `404` noise and misleading dashboard health data.

## Implementation Phases
1. **Investigation**
   - Confirm current HEAD still attempts `ollama-cloud` for GPT requests.
   - Identify the introducing change and whether the issue is policy config, route ordering, or both.
2. **Implementation**
   - Encode explicit `ollama-cloud` exclusion for non-`gpt-oss` GPT routing rules.
   - Ensure provider-route ordering does not re-add policy-excluded providers.
   - Update regression coverage to assert GPT requests skip `ollama-cloud` entirely.
3. **Verification**
   - Run targeted routing/policy tests.
   - Run `pnpm run build`, `pnpm run web:build`, and `pnpm test`.

## Affected Files
- `specs/drafts/gpt-routing-excludes-ollama-cloud.md`
- `receipts.log`
- `src/lib/policy/types.ts`
- `src/lib/provider-policy.ts`
- `src/tests/policy.test.ts`
- `src/tests/proxy.test.ts`

## Dependencies
- Provider ordering in `src/lib/policy/*`
- Route ordering in `src/lib/provider-policy.ts`
- Proxy fallback integration tests in `src/tests/proxy.test.ts`

## Existing Issues / PRs
- Regression surfaced from live request logs showing `gpt-5.2` attempts against `ollama-cloud`.
- Suspected introducing commits:
  - `021ae86` (`fix: remove ollama-cloud from GPT provider order`) — intent was correct but implementation/tests remained incomplete.
  - `c3d6165` (`fix: restore SQL-backed codex routing and provider policy`) — route-order helper re-adds providers omitted by policy output.

## Definition of Done
- Non-`gpt-oss` GPT routing excludes `ollama-cloud` from provider candidates.
- GPT requests do not attempt `ollama-cloud` during fallback on current HEAD.
- Shared non-GPT model fallback behavior remains intact.
- Regression tests fail before the fix and pass after it.
- `pnpm run build`, `pnpm run web:build`, and `pnpm test` pass.

## Progress
- [x] Investigation: confirmed from persisted request logs that `gpt-5.2` attempts still hit `ollama-cloud`; policy/test intent and actual route filtering diverged.
- [x] Implementation: added explicit `excludedProviders: ["ollama-cloud"]` for non-`gpt-oss` GPT rules, removed route-helper behavior that re-added policy-excluded providers, and replaced the GPT fallback integration test with a regression test that asserts `ollama-cloud` is never attempted for GPT requests.
- [x] Verification: targeted policy/proxy regression coverage passed, followed by `pnpm run web:build` and `pnpm test`.
