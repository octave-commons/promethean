# OpenPlanner P1A Deep Dive: Multi-Tenant Control Plane

Date: 2026-04-10
Status: Active development
Total points: 21

## Executive Summary

P1A is the **tenant foundation and runtime enforcement** phase. It ensures every protected request resolves org/user/membership context and fails closed. This is the highest product-risk reduction path in the current roadmap.

**Current Status:** The policy database (`policy-db.mjs`) and authorization layer (`authz.cljs`) are **already implemented**. The heavy lifting is done. What remains is wiring these into every protected route and adding negative tests.

## Architecture

### Control Plane Model

```
                        ┌───────────────────────────────┐
                        │         CONTROL PLANE         │
                        │                               │
                        │  Tenant Catalog               │
                        │  Tenant Policy Store          │
                        │  Provisioning / Onboarding    │
                        │  Model Profile Registry       │
                        │  Review Workflow Config       │
                        │  Audit + Billing Registry     │
                        └──────────────┬────────────────┘
                                       │
                            resolves tenant + policy
                                       │
                    ┌──────────────────▼──────────────────┐
                    │        TENANT GATEWAY / API         │
                    │ auth, host mapping, tenant resolve, │
                    │ RBAC, rate limits, audit logging,   │
                    │ retrieval guardrails, tool policy   │
                    └───────┬───────────────┬─────────────┘
                            │               │
                 ┌──────────▼──────┐   ┌────▼─────────────┐
                 │ ORCHESTRATION    │   │ REVIEW / LABEL   │
                 │ Openclawssy jobs │   │ queues per tenant│
                 │ ingest/eval/train│   │ + exports        │
                 └──────────┬───────┘   └────┬─────────────┘
                            │                │
          ┌─────────────────▼────────────────▼─────────────────┐
          │                     DATA PLANE                     │
          │  Doc store | Vector store | Graph store | Logs    │
          │  namespace/schema/collection scoped per tenant     │
          └────────────────────────────────────────────────────┘
```

**Key principle:** The agent never "figures out" tenancy on its own. The gateway hands the agent a fully resolved, pre-scoped execution context.

## Implementation Status

### ✅ Already Implemented

#### 1. Policy Database (`policy-db.mjs`) — 50KB of production-ready code

**Schema:**
- `orgs` — Organization records with slug, name, kind, status
- `users` — User records with email, display_name, auth_provider, status
- `memberships` — User-to-org relationships with status, is_default
- `roles` — Platform-scoped and org-scoped roles
- `permissions` — 60+ granular permission codes
- `role_permissions` — Role → permission mappings
- `membership_roles` — Membership → role mappings
- `tool_definitions` — 11 tool definitions (read, write, edit, bash, etc.)
- `role_tool_policies` — Role-level tool allow/deny policies
- `user_tool_policies` — Per-user tool policy overrides
- `data_lakes` — Org-scoped data lake configurations
- `audit_events` — Append-only audit trail

**Permissions (60+ defined):**
```
Platform-level:
- platform.org.create/read/update/delete
- platform.roles.manage
- platform.audit.read

Org-level:
- org.settings.read/update
- org.members.read/create/update/delete
- org.users.invite/create/read/update/disable
- org.roles.read/create/update/delete
- org.tool_policy.read/update
- org.datalakes.read/create/update/delete
- org.translations.read/review/export/manage

Datalake-level:
- datalake.read/query/write/ingest/admin

Agent-level:
- agent.chat.use
- agent.memory.read/cross_session
- agent.runs.read_own/read_org/read_all
- agent.controls.steer/follow_up

Tool-level:
- tool.read.use/write.use/edit.use/bash.use
- tool.email.send/discord.publish/bluesky.publish
- tool.semantic_query.use/memory_search.use/memory_session.use
```

**Built-in Roles:**
| Role | Scope | Permissions | Tool Access |
|------|-------|-------------|-------------|
| `system_admin` | Platform | All 60+ permissions | All 11 tools |
| `org_admin` | Org | 50+ org-scoped permissions | All 11 tools |
| `knowledge_worker` | Org | 12 basic permissions | 5 tools (read, canvas, semantic_query, memory_search, memory_session) |
| `data_analyst` | Org | 14 permissions | 7 tools |
| `developer` | Org | 17 permissions | 8 tools (includes bash) |
| `translator` | Org | 5 permissions | 3 tools |

**API Surface:**
- `resolveRequestContext(headers)` → Full user/org/roles/permissions context
- `evaluateToolAccess(headers, toolId)` → Check if tool is allowed
- `listPermissions()`, `listTools()` — Reference data
- `listOrgs()`, `createOrg(payload)` — Org management
- `listRoles()`, `getRole()`, `createRole()` — Role management
- `listUsers()`, `createUser()` — User management
- `listMemberships()`, `setMembershipRoles()` — Membership management
- `setRoleToolPolicies()`, `setMembershipToolPolicies()` — Tool policy overrides
- `listDataLakes()`, `createDataLake()` — Data lake management
- `getBootstrapContext()` — Bootstrap user info

#### 2. Authorization Layer (`authz.cljs`) — ClojureScript

**Core Functions:**
```clojure
;; Request context resolution
(resolve-request-context! runtime request)
(with-request-context! runtime request reply f)

;; Context accessors
(ctx-org-id ctx) (ctx-org-slug ctx) (ctx-user-id ctx)
(ctx-user-email ctx) (ctx-membership-id ctx)
(ctx-role-slugs ctx) (ctx-permissions ctx)

;; Permission checks
(ctx-permitted? ctx permission)
(ctx-any-permission? ctx permissions)
(ctx-tool-allowed? ctx tool-id)
(system-admin? ctx)

;; Guards (throw on failure)
(ensure-permission! ctx permission)
(ensure-any-permission! ctx permissions code message)
(ensure-org-scope! ctx org-id permission)
(ensure-conversation-access! conversation-access* ctx conversation-id)

;; Visibility predicates
(run-visible? ctx run)
(principal-match? ctx record)
```

**Auth Snapshot:**
```clojure
(defn auth-snapshot [ctx]
  {:org_id (ctx-org-id ctx)
   :org_slug (ctx-org-slug ctx)
   :user_id (ctx-user-id ctx)
   :user_email (ctx-user-email ctx)
   :membership_id (ctx-membership-id ctx)
   :role_slugs (vec (:roleSlugs ctx))
   :permissions (vec (:permissions ctx))
   :tool_policies (vec (:toolPolicies ctx))
   :is_system_admin (:isSystemAdmin ctx)})
```

### 🚧 Partial Implementation

#### Header Resolution
- Headers supported: `x-knoxx-membership-id`, `x-knoxx-user-email`, `x-knoxx-org-id`, `x-knoxx-org-slug`
- Resolution logic exists in `findRequestMembershipRow()`
- **Gap:** Not all routes use `with-request-context!` middleware

#### Conversation Access Control
- `ensure-conversation-access!` and `remember-conversation-access!` exist
- Tracks conversation ownership in `conversation-access*` atom
- **Gap:** Not wired into all conversation-related routes

### ❌ Missing Implementation

#### 1. Route-Level Enforcement (3 pts)
Most routes need `with-request-context!` wrapper:
- `/api/runs/*` — Run CRUD
- `/api/documents/*` — Document operations
- `/api/memory/*` — Memory operations
- `/api/tools/*` — Tool execution

#### 2. Tool Authorization from Policy DB (5 pts)
- Tool execution should check `ctx-tool-allowed?`
- Current state: Tools may execute without policy check
- Need integration in `tool_routes.cljs`

#### 3. Scope Memory/Runs/Documents by Org (5 pts)
- Queries need `WHERE org_id = :orgId` filters
- MongoDB queries need tenant-scoped collection/query filters
- **Gap:** `run-visible?` exists but needs broader application

#### 4. Negative E2E Tests (3 pts)
Required test scenarios:
- Cross-org read denial
- Cross-org write denial
- Tool execution without permission
- Suspended user access denial
- Suspended org access denial

## Isolation Invariants (Must Enforce)

1. **Every request resolves to exactly one tenant**
2. **Every document, interaction, review, export is tenant-scoped**
3. **Cross-tenant access is impossible by default** (not just "difficult")
4. **Retrieval never runs an unscoped query**
5. **Audit logs are tenant-scoped and tamper-resistant**
6. **Review queues, exports, training data are per-tenant**
7. **Model profiles are per-tenant even if endpoints are shared**

## Data Plane Isolation Ladder

| Tier | Storage pattern | Best for |
|------|-----------------|----------|
| **Shared** | Shared app, tenant namespace/schema, strict API filtering | Low-risk and mid-market tenants |
| **Isolated data** | Shared app, separate DB/index/account for tenant | Legal, healthcare, finance |
| **Dedicated stamp** | Separate deployment stamp + dedicated data plane | Highest-risk or highest-revenue tenants |

**Current implementation:** Shared tier with `org_id` filtering.

## Request Flow

```
1. User hits tenant.example.com or sends tenant-bound API key
2. Gateway resolves tenant_id and user claims, loads tenant config
3. Gateway selects retrieval targets: index=X, namespace=tenant_123, filters
4. Orchestrator runs retrieval/generation only with scoped config
5. Translation layer applies tenant's glossary, rules, thresholds
6. Response logged with grounding metadata, tenant ID, review triggers
7. If confidence/policy checks fail → copied to tenant's review queue
```

## Stories Breakdown (21 points)

| # | Story | Points | Status | Notes |
|---|-------|--------|--------|-------|
| 1 | Request-context resolution helpers | 3 | ✅ Done | `resolve-request-context!`, `with-request-context!` |
| 2 | Policy DB membership/policy lookup | 5 | ✅ Done | Full PostgreSQL implementation |
| 3 | Runtime tool authorization from policy DB | 5 | 🚧 Partial | `ctx-tool-allowed?` exists, needs wiring |
| 4 | Scope memory/runs/documents by org | 5 | 🚧 Partial | `run-visible?` exists, needs broader use |
| 5 | Negative e2e tests for denial paths | 3 | ❌ Missing | Cross-tenant, permission, suspension tests |

### Remaining Work

1. **Wire `with-request-context!` into all protected routes** (~2-3 days)
   - Audit each route file for context resolution
   - Add middleware wrapper where missing

2. **Add tool authorization checks** (~1 day)
   - Modify `tool_routes.cljs` to check `ctx-tool-allowed?` before execution

3. **Scope queries by org_id** (~2 days)
   - Add `WHERE org_id = :orgId` to SQL queries
   - Add MongoDB query filters for tenant scope

4. **Write negative e2e tests** (~2 days)
   - Cross-org denial tests
   - Permission denial tests
   - Suspension denial tests

## Exit Criteria

- [ ] All protected routes fail closed without context
- [ ] Tool execution is policy-backed
- [ ] Cross-org denial is tested
- [ ] Audit trail captures all tenant-scoped actions

## Key Files

| File | Purpose |
|------|---------|
| `packages/knoxx/backend/src/policy-db.mjs` | PostgreSQL policy database (50KB) |
| `packages/knoxx/backend/src/cljs/knoxx/backend/authz.cljs` | Authorization layer |
| `packages/knoxx/backend/src/cljs/knoxx/backend/app_routes.cljs` | Main route definitions |
| `packages/knoxx/backend/src/cljs/knoxx/backend/tool_routes.cljs` | Tool execution routes |
| `packages/knoxx/backend/src/cljs/knoxx/backend/document_routes.cljs` | Document operations |
| `packages/knoxx/backend/src/cljs/knoxx/backend/memory_routes.cljs` | Memory operations |
| `packages/knoxx/specs/knowledge-ops-multi-tenant-control-plane.md` | Architecture spec |
| `packages/knoxx/specs/knowledge-ops-mvp-phase1-epics.md` | Epic breakdown |

## Dependencies

- **P0** must be landed (backend migration complete) — ✅ Done
- No dependencies on P1B, P1C, or later phases

## Timeline Estimate

- If policy DB integration is mostly complete: **1-2 weeks**
- Main effort is testing and edge-case handling
- Wire remaining routes, add tests, verify fail-closed behavior

## Risks

1. **Inconsistent route protection** — Some routes may miss context resolution
2. **Test coverage gaps** — Negative tests are critical for security guarantees
3. **Performance regression** — Per-request policy lookup adds latency
4. **Migration complexity** — Existing data may lack org_id fields

## Recommendations

1. **Audit all routes** — Systematic check for `with-request-context!` usage
2. **Automated test suite** — CI must run cross-tenant denial tests
3. **Performance monitoring** — Track policy lookup latency
4. **Documentation** — Update API docs to show tenant context requirements
5. **Consider caching** — Request context can be cached per-request in the `__knoxxRequestContext` field (already implemented)
