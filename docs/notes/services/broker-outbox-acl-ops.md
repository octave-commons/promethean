Broker building blocks: transactional Mongo outbox + drainer, JWT auth + scope-to-policy ACL with topic globs `*` segment, `**` multi, WS gateway checks, and an Ops dashboard for cursors/lag/snapshots.

Suggested paths under `shared/js/prom-lib/`:
- Outbox: `outbox/types.ts`, `outbox/drainer.ts`, `outbox/mongo.ts`
- ACL: `acl/match.ts`, `acl/policy.ts`, `acl/scopes.ts`
- Auth: `auth/jwt.ts`
- Ops: `ops/dashboard.ts`

Pair with diagrams: [../diagrams/event-bus-projections-diagrams]

#tags: #broker #eventbus #acl #jwt #ops

