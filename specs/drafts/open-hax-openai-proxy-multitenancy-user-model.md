# Draft Spec: Multi-tenancy user model for `open-hax-openai-proxy`

## Status
Draft

## Summary
`open-hax-openai-proxy` is currently effectively **single-operator / single-tenant** by default:
- API access is guarded by a single shared `PROXY_AUTH_TOKEN` (or disabled via `PROXY_ALLOW_UNAUTHENTICATED=true`).
- UI login uses GitHub OAuth + a SQL allowlist and issues short-lived access/refresh cookies (`proxy_auth` / `proxy_refresh`).
- Provider credentials are managed locally.

This spec extends the system with an **opt-in** multi-tenant + federation model:
- **Default path (unchanged):** local proxy, one operator, managing their own providers/credentials.
- **Opt-in multi-tenancy:** tenants, memberships, tenant-scoped root API keys.
- **Opt-in federation:** delegated/share capability keys (proof-of-possession), revocation propagation, and explicit trust between proxies.

This is the promoted repo-local draft for the tenant/federation identity model. Focused companion drafts:
- `specs/drafts/multi-tenant-proxy-foundation.md`
- `specs/drafts/proxy-federation.md`
- `specs/drafts/cloud-deployment.md`
- `specs/drafts/tenant-federation-cloud-roadmap.md`

## Context (repo evidence)
- Request auth gate is currently a single shared secret: `PROXY_AUTH_TOKEN` checked in `src/app.ts` via Bearer token or cookie (`open_hax_proxy_auth_token`).
- GitHub OAuth is implemented in `src/lib/oauth-routes.ts` with:
  - SQL allowlist (`github_allowlist`)
  - access/refresh token persistence (`access_tokens`, `refresh_tokens`)
- SQL schema exists at `src/lib/db/schema.ts` and already has `schema_version` migrations.
- Provider credentials are stored globally in SQL tables `providers` + `accounts` and used by the runtime key pool.

## Goals
1. Preserve the **default local operator experience**:
   - one person can run the proxy to manage their own providers
   - no federation/multi-tenant complexity required
2. **Opt-in multi-tenancy**: multiple tenants can share one proxy instance.
3. **Opt-in key sharing**: each tenant can create **root API keys** and **delegated/share keys** with explicit limits:
   - time limits (expiry)
   - model/provider allowlists
   - rate / budget ceilings
4. Keys can be used across a **federated proxy network** (multiple proxy instances) with explicit trust.
5. The proxy can reliably derive `{tenant_id, key_id, issuer}` for routing/policy/usage/UI authz.
6. Backwards compatible bootstrap:
   - existing deployments with `PROXY_AUTH_TOKEN` continue to work as an **admin override** mapped to a default tenant.

## Non-goals (v1)
- Forcing federation/multi-tenancy on local installs (this is strictly opt-in).
- Full enterprise IAM (SAML, SCIM).
- Complex billing.
- Per-tenant custom domains.
- Perfect isolation of provider credentials on day 1 (we can stage this).

## Operating modes (opt-in)

### Mode 0 — Local (default)
- No federation.
- No multi-tenant UX required.
- One operator manages provider credentials locally.
- Auth can remain:
  - `PROXY_AUTH_TOKEN` (single shared secret), or
  - `PROXY_ALLOW_UNAUTHENTICATED=true` for fully local/dev.

### Mode 1 — Multi-tenant (single proxy)
- Tenants + memberships + root tenant API keys.
- Still no federation; keys only valid on this proxy.

### Mode 2 — Federated (proxy network)
- Delegated/share capability keys (proof-of-possession).
- ATproto/DID-backed issuer identity + revocation propagation.
- Explicit trust of remote issuers.

In all modes, provider credentials can remain locally managed by the operator. Federation shares **capability to use the proxy**, not raw upstream provider credentials.

## Core domain model

### Tenant
Represents a logical org/project that consumes the proxy.

Fields:
- `id` (string slug, primary key; ex: `ussyverse`, `open-hax`, `demo`)
- `name` (display)
- `created_at`, `updated_at`
- `status` (`active` | `suspended`)
- `settings` (JSON) – optional, for:
  - allowed providers
  - default policy preset
  - usage/quota settings

### User (identity)
Represents a human/operator.

Fields:
- `id` (uuid)
- `provider` (`github` | `local`)
- `subject` (string; ex: `github:riatzukiza`)
- `login` / `email` / `name` / `avatar_url`
- `created_at`, `updated_at`, `last_login_at`

### Tenant membership
Join table between tenants and users.

Fields:
- `tenant_id`
- `user_id`
- `role` (`owner` | `admin` | `member` | `viewer`)
- `created_at`

### Tenant API keys
Long-lived secrets used by automation and OpenAI-compatible clients.

Fields:
- `id` (uuid)
- `tenant_id`
- `label` (human name)
- `token_hash` (hash of secret; never store plaintext)
- `prefix` (first ~8 chars for UX)
- `scopes` (JSON array; default `["proxy:use"]`)
- `created_at`, `last_used_at`, `revoked_at`

Notes:
- The secret value is only shown once at creation.

### (Phase 2/3) Tenant-scoped provider credentials
Two viable approaches:

**A) Hard isolation (true multi-tenant):**
- Add `tenant_id` column to `providers`, `accounts`, `account_health`, `account_cooldown`.
- All key-pool selection becomes tenant-aware.

**B) Shared pool + tenant policy (lighter):**
- Keep provider accounts global.
- Tenant settings/policies restrict which providers/models are usable.

This spec recommends **B first**, then evolve to **A** if/when needed.

## Authentication & authorization model

### Actors
- **API client** (machine): authenticates with either:
  - local bearer token (`PROXY_AUTH_TOKEN` or local root tenant API key), or
  - federated proof-of-possession delegated key (Mode 2)
- **UI user** (human): authenticates with GitHub OAuth (or future ATproto login) and receives cookie tokens
- **Bootstrap admin**: legacy `PROXY_AUTH_TOKEN` (optional) to avoid locking yourself out

### How requests map to a tenant
Order of precedence:
1. If `PROXY_ALLOW_UNAUTHENTICATED=true`: treat as tenant `public` (or disable multi-tenant features).
2. If `Authorization: Bearer <token>` matches `PROXY_AUTH_TOKEN`: treat as `admin` in default tenant.
3. If `Authorization: Bearer <token>` matches a row in `tenant_api_keys` (root key): tenant = that row’s `tenant_id`.
4. If `Authorization: Bearer <token>` is a **delegated/share key** (Option D capability token; PASETO v4.public) minted by this proxy or a trusted proxy in the federation:
   - require `X-OH-PoP` proof header
   - verify capability offline (issuer DID key discovery) and enforce `limits`
   - optionally call issuer introspection only when strict-budget enforcement is required
5. UI cookie `proxy_auth`:
   - token resolves to an `AccessToken` row
   - `subject` resolves to `User`
   - tenant is selected via a UI “active tenant” cookie or stored `extra.activeTenantId` (see below)

### Authorization
- `viewer`: can view usage dashboards and models list
- `member`: can use proxy endpoints (`/v1/*`), view usage
- `admin`: can manage provider credentials/settings for tenant
- `owner`: can manage tenant membership + tenant API keys

### Where to store tenant context for UI sessions
We already have `resource?: string` and `extra?: json` on `AccessToken`/`RefreshToken`.

v1 recommendation:
- Use `extra.activeTenantId` on access/refresh tokens, updated when user switches tenants.
- Keep tokens “user-level”; tenant choice is a session preference.

## Federation & delegated keys (proxy network)

### Why this exists
We want a network of proxy instances where:
- users can **share** access (hand someone a key)
- users can **mint new limited keys** (attenuate permissions) for sharing
- the receiving proxy can validate/enforce those limits without hand-editing local DB state everywhere

This requires separating **issuer authority** (who minted the key) from **where the key is used**.

### Key types
- **Root tenant API key (opaque secret):** stored hashed in `tenant_api_keys`; used for direct access *and* for minting delegated keys.
- **Delegated/share key (capability token):** a token that encodes limits + provenance and is either:
  - verifiable offline (signed), or
  - verifiable online (introspection against issuer)
- **UI session tokens:** the existing `proxy_auth` / `proxy_refresh` cookies (human access), used to manage tenants/keys.

### Delegated/share key shape (limits)
Minimum fields (conceptual):
- `iss` (issuer DID; ATproto identity of the proxy that minted the capability)
- `tenant_id`
- `key_id` (unique id / `jti`)
- `aud` (optional; intended audience proxy DID(s) or `*` if broadly shareable)
- `sub` (optional; holder/user DID)
- `label` (optional)
- `scopes` (e.g. `proxy:use`, `proxy:admin`)
- `exp` (expiry)
- `limits` (JSON), e.g.:
  - `models_allow: string[]`
  - `providers_allow: string[]`
  - `requests_per_minute: number`
  - `tokens_per_day: number`
  - `max_cost_usd: number`
  - `max_concurrent_requests: number`

Mode 2 additionally requires **proof-of-possession** for requests using delegated keys (bearer-only is not safe against malicious proxies).

Optional provenance:
- `parent_key_id` (if minted from another delegated key)
- `issued_to` (freeform string or `user_id`)

### Chosen federation auth format (Option D — PASETO capability + PoP)

This spec uses **two signatures**:
- **Issuer signature**: proxy issuer signs the *capability token* (what is allowed).
- **Holder signature (PoP)**: the caller signs each request (proves the token wasn’t stolen by a proxy).

#### Capability token (issuer-signed)
- Format: **PASETO v4.public** (Ed25519).
- Stored/transported as an opaque string.
- Payload fields (minimum):
  - `iss`: issuer proxy DID
  - `kid`: issuer key id (DID key reference) *(or put in PASETO footer)*
  - `tenant_id`
  - `jti`: capability id (`key_id`)
  - `iat`, `exp`
  - `aud`: intended audience proxy DID(s). **Default: single DID (the intended proxy)**.
  - `sub`: holder DID (who may present this capability)
  - `cnf`: confirmation (bind to a specific holder key), e.g. `{ "kid": "did:...#key-1" }`
  - `scopes`: string[]
  - `limits`: object (models/providers/rate/budget/etc)
  - optional `parent_jti` for delegation chains

Attenuation rule:
- If a holder mints a new delegated capability, it MUST be a strict subset of the parent’s `scopes`/`limits`, and MUST have an earlier-or-equal `exp`.

#### Request proof (holder-signed; proof-of-possession)
- Header: `X-OH-PoP: <JWS>` (EdDSA/Ed25519) signed by the holder key referenced by `cnf.kid`.
- JWS payload fields:
  - `htm`: HTTP method
  - `htu`: full request URL (scheme + host + path + query)
  - `iat`: issued-at (seconds)
  - `jti`: nonce (unique per request)
  - `aud`: target proxy DID or origin
  - `cap_sha256`: sha256 of the PASETO capability token
  - `body_sha256`: optional sha256 of request body bytes

Replay protection:
- Maintain a short-lived replay cache for PoP `jti` per `{cnf.kid, aud}` (e.g. 5 minutes).
- Enforce a small time skew window (e.g. ±60s) for `iat`.

Body binding policy:
- For OpenAI-style JSON POSTs, require `body_sha256`.
- For streaming responses, this is still feasible because the request body is finite (response is streamed).
- If we later add endpoints where hashing is impractical, we can allow `body_sha256` to be optional per-route.

#### Optional online verification (for strict global budgets)
Even with PoP, **global budgets across many proxies** can require coordination. Optional issuer-authoritative path:
- `POST /api/federation/introspect` (or future allowance endpoint)
- Used only when a capability’s `limits` indicate strict issuer-enforced budgeting.

### Federation trust model
Each proxy needs an explicit trust configuration (no ambient trust):
- list of trusted issuer DIDs (`iss`)
- issuer metadata (DID method + DID document resolution policy)
- key discovery (DID doc keys and/or JWKS URL)
- allowed tenant ids (optional allowlist)
- (optional) web-of-trust policy: accept issuer only if endorsed by N trusted roots

This can live in:
- a config file (`FEDERATION_TRUST_FILE=...`) **or**
- a SQL table (preferred for UI-managed trust).

### Minimal federation endpoints
On each proxy (issuer):
- `GET /.well-known/open-hax-proxy/issuer.json` → issuer metadata (issuer DID, public endpoints, optional JWKS URL)
- `POST /api/federation/introspect` → optional strict-budget introspection

ATproto control-plane (issuer publishes signed records):
- `com.openhax.proxy.revocation` records (revoked delegated `jti`)
- `com.openhax.proxy.issuerServices` records (issuer endpoints, key hints)

On the UI/admin API:
- `POST /api/ui/tenants/:tenantId/delegated-keys` → mint a limited share key (PASETO)
- `GET /api/ui/tenants/:tenantId/delegated-keys` → list minted delegated keys
- `DELETE /api/ui/tenants/:tenantId/delegated-keys/:id` → revoke (and publish ATproto revocation record)

## Persistence changes (SQL)
Bump `SCHEMA_VERSION` and add migrations to `src/lib/db/schema.ts`.

New tables (DDL sketch):

```sql
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  subject TEXT NOT NULL UNIQUE,
  login TEXT,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tenant_memberships (
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS tenant_api_keys (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  prefix TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '["proxy:use"]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_tenant ON tenant_api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_hash ON tenant_api_keys(token_hash);

CREATE TABLE IF NOT EXISTS delegated_keys (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  issuer_did TEXT NOT NULL,
  holder_did TEXT NOT NULL,
  cnf_kid TEXT NOT NULL,
  parent_id TEXT,
  aud JSONB,
  label TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '["proxy:use"]',
  limits JSONB,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_delegated_keys_tenant ON delegated_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_delegated_keys_holder ON delegated_keys(holder_did);

CREATE TABLE IF NOT EXISTS trusted_issuers (
  issuer_did TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active',
  issuer_json_url TEXT,
  jwks_url TEXT,
  introspection_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Hashing:
- `token_hash = sha256(pepper + token)`
- pepper is an env var: `PROXY_TOKEN_PEPPER` (rotate carefully)

## API surface (new/changed)

### Existing OpenAI endpoints
- `POST /v1/chat/completions`
- `POST /v1/responses`
- ...

Change:
- replace “single shared PROXY_AUTH_TOKEN” semantics with tenant key support.

### New admin/UI API endpoints (minimal)
- `GET /api/ui/me` → current user + memberships + active tenant
- `POST /api/ui/tenants/:tenantId/select` → sets active tenant for session
- `GET /api/ui/tenants` → list memberships
- `POST /api/ui/tenants` (owner-only bootstrap) → create tenant
- `GET /api/ui/tenants/:tenantId/api-keys` (owner/admin)
- `POST /api/ui/tenants/:tenantId/api-keys` (owner) → returns secret once
- `DELETE /api/ui/tenants/:tenantId/api-keys/:id` (owner)
- `GET /api/ui/tenants/:tenantId/delegated-keys` (owner/admin)
- `POST /api/ui/tenants/:tenantId/delegated-keys` (owner/admin) → returns delegated key token once
- `DELETE /api/ui/tenants/:tenantId/delegated-keys/:id` (owner/admin)
- `GET /api/ui/federation/trusted-issuers` (owner/admin)
- `POST /api/ui/federation/trusted-issuers` (owner/admin)

## Policy & usage accounting
- Add `{tenant_id, issuer, key_id}` to request log entries and to usage accumulator keys.
- For federation, optionally emit usage events back to the issuer (async) so issuer-enforced budgets can work network-wide.
- If using shared provider keys (Phase 1), the main tenant-aware enforcement is:
  - rate/usage quotas per tenant
  - provider allow/deny per tenant

## Rollout plan (phases)

### Phase 0 — Keep local default stable
- No behavior change unless multi-tenancy/federation is explicitly enabled.
- `PROXY_AUTH_TOKEN` continues to work exactly as before.

### Phase 1 — Opt-in multi-tenancy (single proxy)
- Implement SQL tables for tenants/users/memberships/api-keys.
- Gate with `PROXY_MULTITENANCY_ENABLED=true` (default false).
- Implement request auth to map bearer token → tenant when multi-tenancy enabled.
- Implement UI routes to show and manage tenant API keys for active tenant.
- Add default tenant `default` and map legacy `PROXY_AUTH_TOKEN` to it.

### Phase 1b — Opt-in federation (proxy network)
- Gate with `PROXY_FEDERATION_ENABLED=true` (default false).
- Add `delegated_keys` + `trusted_issuers` tables.
- Implement delegated key minting + revocation in UI.
- Implement proof-of-possession (PoP) verification for delegated keys.
- Implement federation verification (offline signature validation via DID resolution; optionally introspection for strict-budget keys).
- Implement revocation propagation via ATproto records (plus local caching).

### Phase 2 — Tenant-aware usage & quotas
- Add `{tenant_id, issuer, key_id}` to request logs + usage snapshots.
- Add quota checks in request pipeline (per-tenant max requests/minute etc.).
- Partial implementation status:
  - request logs now persist `{tenant_id, issuer, key_id}`
  - account-usage accumulators and daily account snapshots are keyed by that attribution tuple
  - `/api/ui/request-logs` now enforces tenant visibility and supports tenant/key filtering
  - tenant-scoped dashboard overview and provider-model analytics now derive rollups from request-log attribution filters
  - per-tenant `requestsPerMinute` enforcement now blocks excess `/v1/*` requests using tenant-scoped proxy settings
  - tenant-scoped provider allow/deny settings now gate upstream provider selection, including factory-prefixed and local Ollama paths
  - richer quota dimensions (tokens/day, cost ceilings, concurrency) are still pending

### Phase 3 — Tenant-scoped provider credentials (optional)
- Either:
  - move provider credentials to tenant scope (schema changes), or
  - add per-tenant provider-policy overlays.

## Security notes
- Keep plaintext API keys / delegated tokens out of logs.
- Prefer constant-time compare for token hashes.
- Federation trust must be explicit (issuer allowlist); never auto-trust arbitrary `iss` values.
- If using signed delegated keys: rotate signing keys via JWKS and support key id (`kid`) pinning/rollover.
- If using introspection: cache conservatively and treat issuer downtime as a policy decision (fail-closed vs fail-open per route).
- Ensure UI endpoints require user session + tenant role checks.
- Keep branch-protection bypass out of this scope (separate operational spec).

## Reconciliation with focused companion drafts
This draft is the canonical identity/capability model. Companion drafts remain useful, but should be read as narrower lenses:

- `specs/drafts/multi-tenant-proxy-foundation.md`
  - concise tenant-isolation/persistence/UI checklist
  - complements this document’s deeper key/auth model
- `specs/drafts/proxy-federation.md`
  - focuses on peer routing, loop prevention, provenance, and peer capability exchange
  - this document is authoritative for delegated-key identity/trust mechanics
- `specs/drafts/cloud-deployment.md`
  - focuses on hosted runtime/persistence/ops constraints
  - required before federation becomes operationally trustworthy
- `specs/drafts/tenant-federation-cloud-roadmap.md`
  - sequencing/portfolio view across all three tracks

## Open questions
1. Default path: do we keep `PROXY_AUTH_TOKEN` as the primary local auth mechanism, and treat tenant keys as optional even when multi-tenancy is enabled?
2. Do we want “tenant selection” to be explicit via header (e.g. `X-Tenant-Id`) or only implicit via API key/token? (spec currently recommends implicit)
3. Do we need non-GitHub identities (email/password) for tenants? (likely no)
4. Federation (Option D): PoP body binding — require `body_sha256` for all JSON POSTs, or allow canonical-request-only? (safety vs ease)
5. Federation: when (if ever) do we require issuer-authoritative introspection / allowances for strict budgets?
6. How is federation trust bootstrapped: manual trusted issuer list, endorsements/web-of-trust, or both?
7. ATproto integration detail: do proxies run/own a PDS identity, or do we allow publishing revocation records via any compatible hosting as long as DID resolution works?
8. Do tenants need isolated upstream credentials now, or can we start with shared pool + quotas?

## Definition of done
- Default local mode is unchanged when multi-tenancy/federation is disabled.
- A request with `Authorization: Bearer <tenant_api_key>` is accepted and tagged with `{tenant_id, key_id}` in logs.
- A request with a delegated capability token is accepted **only with** a valid `X-OH-PoP` proof and is tagged with `{issuer, tenant_id, key_id, holder_did}`.
- UI user can view their memberships and generate/revoke tenant API keys.
- UI user can mint a delegated/share key (PASETO v4.public) with limits and revoke it.
- A delegated/share key minted on one proxy can be validated on another proxy that trusts the issuer DID.
- Revocation is propagated via ATproto records and enforced by subscribers after cache update.
- Existing single-tenant deployments remain functional via `PROXY_AUTH_TOKEN` mapped to default tenant.

---

## Next actions (implementation prep)
- Confirm default mode behavior stays unchanged when `PROXY_MULTITENANCY_ENABLED` / `PROXY_FEDERATION_ENABLED` are unset.
- Lock Option D details:
  - capability = PASETO v4.public
  - PoP = `X-OH-PoP` Ed25519 JWS
  - `aud` default = single proxy DID
- Decide initial trust bootstrap (manual trusted issuer list vs endorsements).
