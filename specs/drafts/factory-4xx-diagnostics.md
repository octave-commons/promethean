# Spec Draft: Factory 4xx Diagnostics Instrumentation

## Summary
Capture actionable, sanitized diagnostics when Factory.ai returns 4xx responses so prompt-related rejections can be investigated after the fact without storing raw prompts or secrets.

## Open Questions
- Should the sanitized Factory diagnostic shape later be generalized beyond Factory 4xx responses?

## Risks
- Logging too much request detail could leak sensitive prompt content.
- Logging too little detail would fail to explain future Factory prompt rejections.
- Schema changes in request logs must remain backward-compatible with existing persisted JSON.

## Priority
High — recent Factory `403` prompt rejections are not diagnosable from current logs.

## Implementation Phases
1. **Investigation**
   - Inspect current request-log schema and where upstream 4xx bodies are summarized.
   - Identify a minimal sanitized diagnostic shape for Factory 4xx failures.
2. **Implementation**
   - Extend request-log records with optional upstream error summary fields and sanitized Factory diagnostics.
   - Populate upstream error summaries for failed attempts and attach detailed request-shape diagnostics only to Factory 4xx attempts.
3. **Verification**
   - Add regression coverage asserting Factory 4xx attempts persist the new diagnostics.
   - Run targeted tests and full suite verification.

## Affected Files
- `specs/drafts/factory-4xx-diagnostics.md`
- `receipts.log`
- `src/lib/provider-strategy.ts`
- `src/lib/request-log-store.ts`
- `src/tests/factory-strategy.test.ts`
- `src/tests/request-log-store.test.ts`

## Dependencies
- Request log persistence in `src/lib/request-log-store.ts`
- Upstream error parsing in `src/lib/provider-utils.ts`
- Factory routing/attempt execution in `src/lib/provider-strategy.ts`

## Existing Issues / PRs
- None referenced.

## Definition of Done
- Factory 4xx attempts persist upstream error summary fields.
- Factory 4xx attempts persist sanitized request-shape diagnostics useful for prompt-rejection triage.
- Existing request-log data remains readable.
- `pnpm run build` and `pnpm test` pass.

## Progress
- [x] Investigation: current request logs store status/tokens but not raw upstream 4xx bodies or request-shape diagnostics.
- [x] Implementation: request logs now persist upstream error summaries for failed attempts and attach sanitized Factory 4xx diagnostics with hashed prompt/text fingerprints and prompt-shape markers.
- [x] Verification: added regression coverage in `src/tests/factory-strategy.test.ts` and `src/tests/request-log-store.test.ts`; `pnpm run build`, targeted tests, and `pnpm test` all pass.
