# Cephalon (Discord)

## Commands → Actions Refactor (in progress)

This service is migrating to a commands/actions pattern with tiny, framework‑free store and effects.

- Commands: Discord-only entrypoints in `src/commands/*` with `data` and default `execute()`.
- Actions: Reusable domain functions in `src/actions/*` with colocated `*.scope.ts` builders.
- Store: `src/store/*` contains a minimal event store and effects calling actions.
- Factories: Small dependency builders live under `src/factories/*`.

Tracer commands implemented:
- `ping` → `actions/ping.ts`
- `leave-voice` → `actions/leave-voice.ts` (Discord-coupled via adapter)

### Add a new action
1) Create `src/actions/foo.ts` exporting `default async function run(scope, input)`.
2) Create `src/actions/foo.scope.ts` exporting `type FooScope` and `buildFooScope()`.

### Add a new command
1) Create `src/commands/foo.ts` exporting `data` and default `execute(interaction, ctx)`.
2) Commands build a scope (or dispatch an event) and call the action; they handle defer/reply.

The Bot is a thin router: it registers commands and forwards interactions to command handlers. Effects listen to events and invoke actions.

#hashtags: #cephalon #service #promethean #actions #commands
