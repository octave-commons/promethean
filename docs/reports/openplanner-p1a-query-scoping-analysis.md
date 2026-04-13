# P1A Query Scoping Analysis

Date: 2026-04-10
Status: Analysis Complete

## Executive Summary

Query scoping by org is **already largely implemented** across the Knoxx backend. The auth context (`org_id`, `user_id`, `membership_id`) is captured at request time and propagated through the system. However, there are some gaps that need attention.

## Current Implementation Status

### ✅ Already Scoped

| Component | Implementation | Location |
|-----------|----------------|----------|
| **Runs** | `auth-snapshot` stored with each run; `run-visible?` filters by org | `agent_turns.cljs`, `authz.cljs` |
| **Sessions** | `org_id` in extra field; `session-visible?` checks org membership | `core_memory.cljs` |
| **Memory Search** | `filter-authorized-memory-hits!` filters by org membership | `core_memory.cljs` |
| **Documents/Data Lakes** | `profile-can-access?` checks org; `orgId` stored with profile | `document_state.cljs` |
| **Translation Segments** | `org_id` passed to OpenPlanner for CRUD operations | `translation_routes.cljs` |
| **Admin Routes** | `ensure-org-scope!` enforces org boundary | `admin_routes.cljs` |

### Auth Snapshot Flow

```clojure
;; Captured in agent_turns.cljs when a run starts
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

### Run Visibility Logic

```clojure
;; authz.cljs
(defn run-visible?
  [ctx run]
  (cond
    (nil? ctx) true                                    ; No context = all visible (legacy)
    (system-admin? ctx) true                           ; System admin sees all
    (ctx-permitted? ctx "agent.runs.read_all") true    ; Global read permission
    (and (= (str (ctx-org-id ctx)) (str (record-org-id run)))
         (ctx-permitted? ctx "agent.runs.read_org")) true  ; Org-scoped read
    (and (ctx-permitted? ctx "agent.runs.read_own")
         (principal-match? ctx run)) true              ; Own runs only
    :else false))
```

### Session Visibility Logic

```clojure
;; core_memory.cljs
(defn session-visible?
  [ctx rows]
  (cond
    (nil? ctx) true                    ; No context = visible (legacy)
    (system-admin? ctx) true           ; System admin sees all
    :else
    (let [extras (map row-extra-map rows)
          org-ids (into #{} (keep #(some-> % :org_id str not-empty)) extras)
          same-org? (contains? org-ids (str (ctx-org-id ctx)))]
      (cond
        (empty? org-ids) false         ; No org info = deny
        (not same-org?) false          ; Different org = deny
        (ctx-permitted? ctx "agent.memory.cross_session") true  ; Cross-session perm
        :else (or (contains? membership-ids ...)
                  (contains? user-ids ...))))))  ; Principal match
```

### Document Profile Access

```clojure
;; document_state.cljs
(defn profile-can-access?
  ([profile session-id] (profile-can-access? profile nil session-id))
  ([profile auth-context session-id]
   (let [org-id (some-> (:orgId profile) str not-empty)
         org-allowed? (if org-id
                        (or (nil? auth-context)
                            (authz/system-admin? auth-context)
                            (= org-id (str (authz/ctx-org-id auth-context))))
                        (or (nil? auth-context)
                            (authz/system-admin? auth-context)))
         session-allowed? (or (not (:privateToSession profile))
                              (str/blank? (str (:ownerSessionId profile)))
                              (= (str (:ownerSessionId profile)) (str session-id)))]
     (and org-allowed? session-allowed?))))
```

## Identified Gaps

### 1. Legacy Fallback: `nil` Context Allows Access

**Problem:** Several visibility checks return `true` when `ctx` is `nil`:

```clojure
(defn run-visible?
  [ctx run]
  (cond
    (nil? ctx) true  ; <-- ALLOWS ALL when no context
    ...))
```

**Risk:** If `with-request-context!` is not wired into a route, all data becomes visible.

**Fix:** Remove `nil` fallback or require explicit opt-in:

```clojure
(defn run-visible?
  [ctx run]
  (when-not ctx
    (throw (http-error 401 "request_context_required" "Request context is required")))
  (cond
    (system-admin? ctx) true
    ...))
```

### 2. Missing Context Resolution in Some Routes

**Routes that need verification:**

| Route | Has `with-request-context!` | Needs Fix |
|-------|---------------------------|-----------|
| `/api/lounge/messages` | ❌ No | Yes - should require auth |
| `/api/config` | ❌ No | No - public config OK |
| `/health` | ❌ No | No - health check OK |
| `/v1/models` | ❌ No (uses API key) | Uses different auth |
| `/v1/chat/completions` | ❌ No (uses API key) | Uses different auth |
| `/v1/embeddings` | ❌ No (uses API key) | Uses different auth |

### 3. Lounge Messages Not Scoped

**Problem:** `/api/lounge/messages` is public with no auth:

```clojure
(route! app "GET" "/api/lounge/messages"
        (fn [_request reply]
          (json-response! reply 200 {:messages @lounge-messages*})))

(route! app "POST" "/api/lounge/messages"
        (fn [request reply]
          ;; No with-request-context! call
          ...))
```

**Fix:** Add auth and scope by org, or remove if not needed.

### 4. OpenPlanner Queries May Need org_id Filter

**Problem:** Some OpenPlanner queries don't include org_id filter:

```clojure
;; translation_routes.cljs - GET segments doesn't filter by org
(-> (openplanner-request! config "GET"
      (str "/v1/translations/segments?" params))
    ;; params doesn't include org_id
```

**Fix:** Add `org_id` to query params:

```clojure
(let [params (str "project=" (js/encodeURIComponent project)
                  "&org_id=" (js/encodeURIComponent (str (ctx-org-id ctx)))
                  "&limit=" limit
                  ...)]
```

### 5. In-Memory Data Not Persisted to DB

**Problem:** `runs*` and `database-state*` are in-memory atoms:

```clojure
(defonce runs* (atom {}))
(defonce database-state* (atom nil))
```

**Risk:** Data lost on restart; not truly multi-tenant without DB persistence.

**Fix:** These should eventually be backed by MongoDB/PostgreSQL, but the in-memory implementation is acceptable for MVP as long as scoping is correct.

## Recommended Changes

### High Priority

1. **Remove nil ctx fallback** - Change visibility functions to fail closed when context is missing
2. **Add auth to lounge routes** - Either scope by org or remove
3. **Add org_id to OpenPlanner queries** - Ensure all queries filter by org

### Medium Priority

4. **Add audit logging for scope violations** - Log when access is denied
5. **Persist runs to MongoDB** - Move from in-memory atom to persistent storage
6. **Add integration tests for scoping** - Verify cross-org denial in CI

### Low Priority

7. **Document scoping contract** - Write explicit contract for each route
8. **Add metrics for auth failures** - Track denial rates

## Implementation Plan

### Phase 1: Close Gaps (2-3 days)

1. Update `run-visible?` to require context
2. Update `session-visible?` to require context
3. Add `org_id` to translation segment queries
4. Add auth to lounge routes or deprecate

### Phase 2: Verify (1 day)

1. Run existing e2e tests
2. Add new tests for each gap fixed
3. Manual verification of cross-org denial

### Phase 3: Harden (2 days)

1. Add audit logging
2. Add metrics
3. Update documentation

## Code Changes Required

### 1. authz.cljs - Remove nil fallback

```clojure
(defn run-visible?
  [ctx run]
  (when-not ctx
    (throw (http-error 401 "request_context_required" "Request context is required for run visibility check")))
  (cond
    (system-admin? ctx) true
    (ctx-permitted? ctx "agent.runs.read_all") true
    (and (= (str (ctx-org-id ctx)) (str (record-org-id run)))
         (ctx-permitted? ctx "agent.runs.read_org")) true
    (and (ctx-permitted? ctx "agent.runs.read_own")
         (principal-match? ctx run)) true
    :else false))
```

### 2. core_memory.cljs - Remove nil fallback

```clojure
(defn session-visible?
  [ctx rows]
  (when-not ctx
    (throw (backend-http/http-error 401 "request_context_required" "Request context is required for session visibility check")))
  (cond
    (system-admin? ctx) true
    :else
    (let [extras (map row-extra-map rows)
          org-ids (into #{} (keep #(some-> % :org_id str not-empty)) extras)
          same-org? (contains? org-ids (str (ctx-org-id ctx)))]
      ...)))
```

### 3. translation_routes.cljs - Add org_id to queries

```clojure
;; GET /api/translations/segments
(let [params (str "project=" (js/encodeURIComponent project)
                  "&org_id=" (js/encodeURIComponent (str (ctx-org-id ctx)))
                  "&limit=" limit
                  "&offset=" offset
                  ...)]
```

### 4. memory_routes.cljs - Add auth to lounge

```clojure
(route! app "GET" "/api/lounge/messages"
        (fn [request reply]
          (with-request-context! runtime request reply
            (fn [ctx]
              (json-response! reply 200 {:messages @lounge-messages*})))))

(route! app "POST" "/api/lounge/messages"
        (fn [request reply]
          (with-request-context! runtime request reply
            (fn [ctx]
              (when ctx (ensure-permission! ctx "agent.chat.use"))
              ...))))
```

## Verification Checklist

- [ ] All protected routes use `with-request-context!`
- [ ] `run-visible?` fails closed without context
- [ ] `session-visible?` fails closed without context
- [ ] `profile-can-access?` checks org boundary
- [ ] Translation queries filter by `org_id`
- [ ] Lounge routes are authenticated or deprecated
- [ ] Cross-org denial tests pass
- [ ] Audit log captures scope violations
