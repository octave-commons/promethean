# Multi-Tenancy Phase 1: Default Tenant, Tenant API Keys, and Auth Resolution

## Status
Draft

## Summary
Implement the first safe, incremental multi-tenancy slice for `open-hax-openai-proxy`.

This phase does **not** implement full federation yet. It establishes:
- a first-class `tenant` domain
- tenant memberships and tenant API keys
- tenant-aware request auth resolution
- default-tenant migration for existing installs
- tenant-scoped settings and auth session context groundwork

This phase is designed to preserve current behavior for single-operator installs while making future federation and cloud deployment possible.

## Source drafts
- Canonical identity/federation draft:
  - `specs/drafts/open-hax-openai-proxy-multitenancy-user-model.md`
- Companion architecture/rollout drafts:
  - `specs/drafts/multi-tenant-proxy-foundation.md`
  - `specs/drafts/proxy-federation.md`
  - `specs/drafts/cloud-deployment.md`
  - `specs/drafts/tenant-federation-cloud-roadmap.md`

## Investigation findings
Current codebase is globally scoped in the following places:

### Global auth gate
- `src/app.ts`
  - request auth currently checks only:
    - `Authorization: Bearer <PROXY_AUTH_TOKEN>`
    - or cookie token equal to `PROXY_AUTH_TOKEN`
  - there is no tenant resolution step

### Global SQL credential ownership
- `src/lib/db/schema.ts`
  - `providers`, `accounts`, `account_health`, `account_cooldown`, `config` have no `tenant_id`
- `src/lib/db/sql-credential-store.ts`
  - provider/account lookup is global

### Global UI sessions/admin auth
- `src/lib/oauth-routes.ts`
  - GitHub OAuth produces `proxy_auth` / `proxy_refresh`
  - `subject` is just the GitHub login
  - no tenant membership or active tenant semantics yet
- `src/lib/auth/sql-persistence.ts`
  - `access_tokens` / `refresh_tokens` already have `extra JSONB`, which can carry active tenant context without redesigning token format immediately

### Global settings
- `src/lib/proxy-settings-store.ts`
  - stores a single `config.key = proxy_settings`
  - no tenant dimension

## Phase 1 goals
1. Preserve the default single-tenant path.
2. Add a durable `tenants` / `users` / `tenant_memberships` / `tenant_api_keys` schema.
3. Introduce explicit auth resolution that returns:
   - actor kind
   - tenant id
   - auth source
   - role/capabilities
4. Map legacy `PROXY_AUTH_TOKEN` to a default tenant/admin path.
5. Allow human UI sessions to carry an active tenant selection.
6. Avoid tenant-scoping provider credentials yet; keep provider pool global for this phase.

## Explicit non-goals for Phase 1
- No ATproto/DID federation implementation yet.
- No delegated/share keys yet.
- No trusted issuer store usage yet.
- No tenant-scoped provider credentials yet.
- No per-tenant quotas yet.
- No tenant selector UI beyond minimal session-context plumbing unless needed for verification.

## Key decisions

### Decision 1: shared provider pool first
Phase 1 keeps upstream provider credentials global.
Why:
- reduces migration risk
- avoids immediate key-pool explosion
- lets us establish tenant identity before tenant-specific provider ownership

Implication:
- tenant auth and policy are introduced before tenant credential isolation
- later phases can add tenant-scoped provider overlays or hard isolation

### Decision 2: implicit tenant selection for API keys, session-selected tenant for UI
- Machine/API requests derive tenant from the tenant API key.
- UI sessions derive tenant from token/session context (`extra.activeTenantId`).
- We do **not** require `X-Tenant-Id` for Phase 1.

### Decision 3: legacy compatibility via default tenant
- create default tenant `default`
- treat `PROXY_AUTH_TOKEN` as bootstrap admin for `default`
- existing installs keep working without tenant setup changes

## Schema changes
Bump schema version and add new tables.

### New tables
- `tenants`
- `users`
- `tenant_memberships`
- `tenant_api_keys`

Recommended minimum columns:

#### tenants
- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `status TEXT NOT NULL DEFAULT 'active'`
- `settings JSONB`
- `created_at`
- `updated_at`

#### users
- `id TEXT PRIMARY KEY`
- `provider TEXT NOT NULL`
- `subject TEXT NOT NULL UNIQUE`
- `login TEXT`
- `email TEXT`
- `name TEXT`
- `avatar_url TEXT`
- `created_at`
- `updated_at`
- `last_login_at`

#### tenant_memberships
- `tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`
- `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `role TEXT NOT NULL`
- `created_at`
- primary key `(tenant_id, user_id)`

#### tenant_api_keys
- `id TEXT PRIMARY KEY`
- `tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`
- `label TEXT NOT NULL`
- `prefix TEXT NOT NULL`
- `token_hash TEXT NOT NULL`
- `scopes JSONB NOT NULL DEFAULT '["proxy:use"]'`
- `created_at`
- `last_used_at`
- `revoked_at`

### Migration/bootstrap requirements
- On startup/migration, ensure tenant `default` exists.
- Existing GitHub-authenticated operators are not automatically tenant members until bootstrap/admin flow assigns them, unless we explicitly choose a one-user bootstrap shortcut.
- `PROXY_AUTH_TOKEN` remains out-of-band env auth, but resolves logically to tenant `default` with admin/owner bootstrap capability.

## Auth resolution model for Phase 1
Introduce a dedicated resolver used by request/auth middleware and UI/admin routes.

### Resolved auth shape
Example conceptual shape:
- `kind: "legacy_admin" | "tenant_api_key" | "ui_session" | "unauthenticated"`
- `tenantId?: string`
- `userId?: string`
- `subject?: string`
- `role?: "owner" | "admin" | "member" | "viewer"`
- `scopes?: string[]`
- `source: "bearer" | "cookie" | "none"`

### Resolution order
1. `PROXY_ALLOW_UNAUTHENTICATED=true`
   - keep current behavior for explicitly unauthenticated local mode
2. Bearer/cookie matches `PROXY_AUTH_TOKEN`
   - resolve as bootstrap admin on tenant `default`
3. Bearer matches `tenant_api_keys.token_hash`
   - resolve tenant from key row
4. `proxy_auth` UI cookie resolves to access token row
   - read active tenant from `access_tokens.extra.activeTenantId`
   - verify user has membership in that tenant

## UI session model changes
Use existing `extra JSONB` on access/refresh tokens.

### Add to session token extra
- `activeTenantId`
- optional cached membership summary later if useful

### New minimal UI/admin routes for Phase 1
- `GET /api/ui/me`
  - current user
  - memberships
  - active tenant
- `GET /api/ui/tenants`
  - list memberships
- `POST /api/ui/tenants/:tenantId/select`
  - set active tenant in access/refresh token `extra`
- `GET /api/ui/tenants/:tenantId/api-keys`
- `POST /api/ui/tenants/:tenantId/api-keys`
- `DELETE /api/ui/tenants/:tenantId/api-keys/:id`

Optional bootstrap route if needed:
- `POST /api/ui/tenants`

## Settings scoping decision
Phase 1 should make proxy settings tenant-aware or at least design-compatible.

Minimum acceptable approach:
- store config keys as `proxy_settings:<tenantId>` in `config`
- keep file fallback only for the default/single-tenant mode

This avoids future churn when fast mode and similar settings become tenant-specific.

## Affected files
- `src/lib/db/schema.ts`
- `src/lib/db/sql-credential-store.ts`
- `src/lib/auth/sql-persistence.ts`
- `src/lib/oauth-routes.ts`
- `src/lib/proxy-settings-store.ts`
- `src/app.ts`
- `src/lib/ui-routes.ts`
- tests covering auth, migrations, settings, and UI routes

## Phases

### Phase A: schema + bootstrap helpers
- add new schema objects and migration bump
- ensure default tenant exists
- add tenant API key hashing utilities

### Phase B: auth resolution service
- implement a reusable auth resolver
- wire legacy `PROXY_AUTH_TOKEN` to default tenant
- wire tenant API key lookup

### Phase C: UI session tenant context
- create/load `User` records for GitHub-authenticated humans
- add active tenant in token `extra`
- add minimal `/api/ui/me` + tenant select route

### Phase D: tenant API key management
- create/list/revoke tenant API keys
- enforce tenant role checks
- add tests for visibility and isolation

### Phase E: tenant-aware settings groundwork
- scope `proxy_settings` by tenant id
- default tenant behavior remains backward-compatible

## Risks
- Accidental partial tenantization could create confusing hybrid behavior.
- Using global provider credentials with tenant-scoped auth is safe only if usage/accounting and policy remain explicit.
- Bootstrap UX can become awkward if no initial tenant owner path exists.

## Open questions
1. Should GitHub login auto-create/bootstrap a local user row on first successful login? Proposed: yes.
2. Should first allowed GitHub user become owner of `default` automatically when no memberships exist? Proposed: yes, guarded and explicit.
3. Should tenant API keys support roles directly, or only scopes? Proposed v1: scopes only, tenant ownership remains membership-based for UI.
4. Do we scope settings in Phase 1 or Phase 1.5? Proposed: Phase 1, because `proxy_settings` is already obviously global.

## Implementation status
- ✅ Phase A landed: schema v4 tenant tables and default-tenant bootstrap are in place.
- ✅ Phase B landed: request auth now resolves legacy default-tenant admin access and tenant API key bearer tokens.
- ✅ Phase C landed: GitHub-authenticated UI sessions now upsert local user records, bootstrap the default-tenant membership, persist `activeTenantId` on access/refresh token `extra`, and expose/select tenant context through `/api/ui/me`, `/api/ui/tenants`, and `POST /api/ui/tenants/:tenantId/select`.
- 🚧 Phase D is partially landed: list/create/revoke tenant API key routes now exist with tenant-scoped authorization checks, and live `/v1/*` usage now updates `tenant_api_keys.last_used_at`.
- ✅ Phase E landed: proxy settings now persist under tenant-scoped config keys (`proxy_settings` for `default`, `proxy_settings:<tenantId>` otherwise), `/api/ui/settings` resolves against the active tenant, and request-time fast mode now follows the authenticated tenant context.

## Definition of done
- `default` tenant exists and preserves current single-operator behavior.
- Legacy `PROXY_AUTH_TOKEN` resolves to tenant `default` with bootstrap admin semantics.
- Tenant API keys exist and resolve to a tenant in request auth.
- UI sessions can select and persist an active tenant.
- No cross-tenant tenant-key visibility leaks.
- Tests cover migration/bootstrap/auth/session selection for the new tenant model.
