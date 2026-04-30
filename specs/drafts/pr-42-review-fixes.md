# PR-42 review fixes

Context: Address CodeRabbit review comments on open-hax/proxx#42 (branch `feat/health-scores`).

## Open questions
- None.

## Risks
- (世, p=0.6) SQL changes may affect migrations/production DB. Prefer backward-compatible query changes over schema constraints.
- (世, p=0.5) Changes to credential persistence / shutdown hooks could alter durability and process-exit behavior.
- (世, p=0.4) Provider-strategy changes touch critical routing; require test coverage.

## Priority
P0: correctness/security issues (token leakage in URLs, health scoring false positives, durable persistence, max_output_tokens passthrough)
P1: behavior hardening (port/env validation, case normalization, expiryBuffer validation)
P2: refactors/nits (readonly types, dedupe helpers, .env comments)

## Planned changes (by file)
### scripts/bulk-oauth-import.ts
- Remove hardcoded personal email defaults; require explicit IMAP account via env/CSV.
- Fix startup error text to require only PROXY_AUTH_TOKEN; IMAP creds optional.

### src/lib/db/account-health-store.ts / src/lib/db/sql-credential-store.ts
- Ensure AccountHealthStore upsert cannot recreate rows for deleted accounts (guard upsert by account existence).

### src/lib/db/json-seeder.ts
- Respect `skipExistingProviders` (DO NOTHING when true; UPSERT when false).

### src/lib/openai-oauth.ts
- Validate `OPENAI_OAUTH_CALLBACK_PORT` env value (1..65535); fall back to default 1455.

### src/lib/responses-compat.ts
- `extractTerminalResponseFromEventStream`: return last terminal response, not first.
- Only set `hasToolCalls=true` after validating and emitting a tool-call chunk.

### src/app.ts
- Redact incoming request-body logging (no full payload, no raw prompt cache keys).
- Pass prompt-affinity key into `executeProviderFallback` for /v1/responses.
- For factory-prefixed /v1/responses: use `context.factoryPrefixed` when building provider routes.
- Resolve model aliases before building responses passthrough context.
- Route proactive factory refresh through `TokenRefreshManager`.
- Shutdown: stop background refresh and drain inflight refreshes before closing DB.

### src/lib/credential-store.ts
- Add `dispose()` to unregister store instances and uninstall process hooks when last store disposed.
- SIGINT/SIGTERM handlers: avoid synchronous `process.exit()`; set `process.exitCode`.
- `flushToDisk`: await inflight flush, and clear dirty only after successful write.
- Ensure mutators await durability (flush) before returning.

### src/lib/key-pool.ts
- Guard `expiryBufferMs` against negative/non-finite values.

### src/lib/openai-quota.ts
- Normalize extracted quota error codes to lowercase before comparisons.

### src/lib/policy/types.ts
- Make `PAID_PLANS` readonly.

### src/lib/provider-routing.ts
- Consolidate duplicated provider-capability predicate logic (responses/images).

### src/lib/provider-strategy.ts
- Do not strip `max_output_tokens` in Responses passthrough.
- Fix gpt paid-plan heuristic for `gpt-5-mini` and similar non-numeric qualifiers.
- Fix prioritization so strongly-supported accounts do not drop team/other paid accounts.
- Prevent token leakage in upstream URL construction (move provider credential to headers).
- Handle new `UpstreamMode` variants in usage extraction.
- Health scoring: record success only for real upstream successes; record failures only for 5xx server failures and non-short-circuit outcomes.
- Refresh-retry handled branch: run post-attempt bookkeeping (prompt affinity, span end, health success) before returning.
- Refresh-retry: reapply strategy-specific headers.

### src/lib/ui-routes.ts
- Make `idle` reachable by using provider-scoped key availability (not global keyPoolStatus).

### .env.example
- Clarify `REQUESTY_API_TOKEN` vs `REQUESTY_API_KEY` (alias vs distinct usage).

## Implementation phases
1. Investigation + targeted edits (each fix guarded by existing tests).
2. Run formatting/lint/typecheck/tests.
3. Push fix commits to `feat/health-scores`.

## Affected files
- scripts/bulk-oauth-import.ts
- .env.example
- src/app.ts
- src/lib/credential-store.ts
- src/lib/key-pool.ts
- src/lib/openai-oauth.ts
- src/lib/openai-quota.ts
- src/lib/policy/types.ts
- src/lib/provider-routing.ts
- src/lib/provider-strategy.ts
- src/lib/responses-compat.ts
- src/lib/db/account-health-store.ts
- src/lib/db/json-seeder.ts
- src/lib/db/sql-credential-store.ts
- src/lib/ui-routes.ts

## Definition of done
- All listed review comments addressed with code changes or documented rationale.
- `pnpm test` (or project-equivalent) passes.
- Typecheck passes.
- Branch pushed with commits.
