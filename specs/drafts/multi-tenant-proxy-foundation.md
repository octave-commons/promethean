# Multi-Tenant Proxy Foundation

## Status
Draft

## Summary
Introduce first-class tenant scoping across auth, credentials, settings, telemetry, and UI so one deployed proxy can safely serve multiple tenants/workspaces without shared-state leakage.

This is a focused companion to `specs/drafts/open-hax-openai-proxy-multitenancy-user-model.md`, which is now the canonical tenant + delegated-key + federation-identity draft.

## Why now
Current architecture is effectively single-tenant:
- DB tables such as `providers`, `accounts`, `account_health`, `account_cooldown`, and `config` have no `tenant_id`.
- `ProxySettingsStore` persists one global `proxy_settings` record.
- `PROXY_AUTH_TOKEN` is global.
- request logs and session history are global files/data structures.
- GitHub allowlist/admin auth is global.

That is acceptable for local/dev and single-operator use, but it blocks safe shared deployments and makes federation ambiguous because there is no tenant boundary to propagate.

## Existing foundations
Relevant existing specs/features:
- `specs/drafts/latency-health-routing-v1.md` — routing/perf telemetry goals
- `specs/drafts/provider-model-analytics-page.md` — provider/model suitability visibility
- `specs/drafts/weekly-cost-water-validation.md` — durable usage aggregation and coverage metadata
- SQL-backed credentials/config already exist and are preferable to file-only runtime state for multi-tenant work.

## Core requirements
- Tenant-scoped credentials, models, and cooldown state.
- Tenant-scoped request logs, sessions, analytics, and settings.
- Tenant-scoped auth/admin surface.
- Explicit tenant identity in API requests and UI context.
- No cross-tenant visibility by default.

## Open questions
- What is the tenancy unit: tenant, workspace, organization, project, or all of the above? Proposed v1: `tenant` with optional display metadata.
- How is tenant selected/authenticated? Proposed v1: bearer token/session resolves exactly one tenant; optional admin can switch among authorized tenants.
- Are providers shared globally with per-tenant credentials, or entirely tenant-owned? Proposed v1: providers are shared identifiers; credentials are tenant-owned.
- Should model catalogs/policies be tenant-overridable? Proposed v1: yes, but with global defaults.

## Risks
- Schema changes touch every persistence path.
- UI and API assumptions currently expect one global state surface.
- Tenant scoping mistakes are security bugs, not just product bugs.

## Implementation phases

### Phase 1: Tenant domain model
- Add `tenants` table and canonical `tenant_id`.
- Add `tenant_id` to accounts, cooldowns, account health, config, sessions/tokens, and any relevant telemetry stores.
- Define migration/backfill rules for existing single-tenant data.

### Phase 2: Auth and settings isolation
- Replace/augment global `PROXY_AUTH_TOKEN` behavior with tenant-aware auth.
- Scope GitHub allowlist/admin/session flows to authorized tenants.
- Make `ProxySettingsStore` tenant-scoped.

### Phase 3: Runtime and telemetry isolation
- Make credential store, key pool, request logs, session history, analytics, and suitability views tenant-scoped.
- Ensure coverage/rollups are computed within tenant boundaries only.

### Phase 4: UI tenancy
- Add tenant context/selector for authorized operators.
- Show current tenant clearly in the console.
- Ensure all UI requests carry tenant context consistently.

### Phase 5: Verification
- Add tests proving cross-tenant isolation for credentials, logs, analytics, and settings.
- Verify migrations preserve existing single-tenant data under a default tenant.

## Affected areas
- `src/lib/db/schema.ts`
- `src/lib/db/sql-credential-store.ts`
- `src/lib/proxy-settings-store.ts`
- `src/lib/request-log-store.ts`
- `src/lib/ui-routes.ts`
- `src/lib/oauth-routes.ts`
- `src/app.ts`
- web console pages + API client

## Definition of done
- A tenant is an explicit first-class runtime concept.
- No credential/log/analytics/settings data leaks across tenants.
- Existing single-tenant installs migrate into a default tenant cleanly.
