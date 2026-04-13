# Shared-state federation v1

## Status
Draft

## Summary
Enable a practical first step toward multi-instance `proxx` federation by treating several deployed instances as **stateless edges over one shared control plane**.

For v1, the shared/mirrored state is intentionally narrow:
- operator/admin identity and tenant membership
- provider credentials, especially OpenAI OAuth accounts added through the UI
- analytics usage data used by the dashboard and provider/model analytics pages

This does **not** attempt full peer-to-peer proxy federation yet. It is a control-plane federation milestone backed by shared SQL state.

## Why now
The user goal is immediate transferability:
- if one instance is bootstrapped and the operator authenticates there, the same operator/admin state should exist everywhere
- if one instance adds an OpenAI OAuth account, the account should project to all instances
- analytics stats should accumulate across the fleet instead of fragmenting per instance

The repo already partially supports this shape:
- SQL-backed users, memberships, sessions, tenant API keys, providers, and accounts already exist
- OpenAI OAuth credentials already persist into SQL when `DATABASE_URL` is configured
- the missing major shared-state piece for the requested milestone is analytics/request-usage persistence

## Current repo reality
### Already shared through SQL when instances point at the same `DATABASE_URL`
- GitHub allowlist and UI auth persistence
- `users`, `tenant_memberships`, `tenant_api_keys`
- provider/account credentials in `providers` + `accounts`
- proxy settings in `config`

### Still local/file-backed today
- request logs and derived analytics (`data/request-logs.jsonl` + metadata)
- chat sessions (`data/sessions.json`)
- prompt affinity and some other convenience state

### Consequence
OpenAI OAuth credentials are already close to the requested behavior when multiple instances share one database, but analytics are still split per instance.

## Goals
1. Make shared-DB multi-instance deployment an explicit supported mode.
2. Ensure OpenAI OAuth credentials added on one instance become visible to all instances without manual export/import.
3. Persist analytics/request-usage into SQL so dashboard + analytics pages reflect fleet-wide usage.
4. Keep current single-instance/file-backed mode working when `DATABASE_URL` is absent.
5. Document the boundary clearly: this is shared-state federation, not full remote peer routing.

## Non-goals (v1)
- Full proxy-to-proxy request forwarding or remote peer routing.
- Shared chat sessions.
- Shared prompt affinity / semantic session indexes.
- Distributed locking or exactly-once cross-instance coordination.
- Full event-sourcing redesign.

## Design direction
### Decision 1: shared SQL control plane is the federation substrate
When multiple `proxx` instances point at the same `DATABASE_URL`, they are considered one federated cluster for control-plane purposes.

This keeps the first milestone simple:
- no custom replication layer
- no bespoke CRDT/state-sync protocol
- reuse the durable system of record already present in the repo

### Decision 2: add a SQL request-usage ledger for shared analytics
Introduce a SQL-backed request-usage store that mirrors the normalized `RequestLogEntry` shape.

Requirements:
- every request log record/update should upsert into SQL
- UI analytics routes can query SQL-backed usage instead of local file-only state when available
- local file-backed request log behavior remains as fallback for non-DB installs

### Decision 3: keep runtime/local fast-paths, but make operator surfaces shared
The in-memory/file request log store can remain for local routing heuristics and fallback behavior.
Shared dashboard/analytics surfaces should prefer SQL-backed usage when present.

This avoids a risky full replacement of the local request-log implementation in one phase.

## Implementation phases
### Phase 1 — Spec + contracts
- Add this draft.
- Document that shared-state federation v1 means multiple instances sharing one `DATABASE_URL`.
- Define analytics mirroring boundary.

### Phase 2 — SQL request-usage persistence
- Add a SQL-backed request-usage store/table.
- Mirror `RequestLogEntry` records/updates into SQL.
- Keep mirroring best-effort but ordered and durable enough for operator analytics.

### Phase 3 — Shared analytics reads
- Update dashboard overview to read SQL usage when available.
- Update provider/model analytics to read SQL usage when available.
- Optionally update request-log listing to prefer SQL when available.

### Phase 4 — Docs + verification
- Document multi-instance shared-state deployment in `README.md`.
- Verify that two instances sharing one DB see:
  - same admin/operator membership state
  - same OpenAI OAuth credentials
  - same usage analytics totals

## Open questions
1. Is ~5s key-pool reload acceptable for cross-instance OAuth projection, or do we need DB notify/listen for faster propagation later?
2. Should request-log listing also become shared in this phase, or only dashboard/analytics?
3. How much retention should SQL usage keep by default?
4. Do we later collapse local file-backed request logs entirely when SQL is configured?

## Risks
- Duplicating analytics state into both local files and SQL can drift if mirroring fails silently.
- SQL-backed analytics queries could become expensive if we later store very large volumes without rollups.
- Operators may confuse shared-state federation with full peer-routing federation if the docs are vague.

## Affected files
- `src/app.ts`
- `src/lib/request-log-store.ts`
- `src/lib/ui-routes.ts`
- `src/lib/db/schema.ts` or a new SQL store module under `src/lib/db/`
- `README.md`
- `specs/drafts/shared-state-federation-v1.md`

## Definition of done
- Two instances using the same `DATABASE_URL` share operator/admin + tenant state.
- An OpenAI OAuth account added on one instance is available to the others after normal runtime refresh/reload.
- Dashboard + provider/model analytics report shared fleet usage from SQL-backed usage data.
- Single-instance/file-backed mode still works without `DATABASE_URL`.
