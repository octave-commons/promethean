# Cephalon event-orientation migration spec

## Status
Draft

## Implementation note
As of 2026-03-27, the first TypeScript pilot slice is partially implemented in `orgs/octave-commons/cephalon/packages/cephalon-ts`:

- `createCephalonApp()` now emits `temporal.schedule.arm`, `temporal.schedule.fired`, and `cephalon.tick.requested` for circuit ticks before translating back into legacy `system.tick`
- `SessionManager` now emits `session.turn.requested` before `session.turn.started`
- the legacy `system.tick` path is still the compatibility bridge used by the current turn processor
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/main.ts` and the Clojure runtime are not migrated yet

## Summary
Unify the current Cephalon runtimes around an explicitly event-oriented model where:

- external stimuli already arrive as events
- timers are treated as a special class of events emitted by a scheduler
- turns are requested, started, completed, failed, and rescheduled through the event fabric instead of direct callback chains
- package-local loops become projections/reactors over an event log rather than the primary control plane

This spec covers the current TypeScript and Clojure Cephalon source packages and defines the first migration path from timer-owned control flow to scheduler-emitted temporal events.

## Reviewed sources

### TypeScript package
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/app.ts`
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/main.ts`
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/sessions/manager.ts`
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/llm/turn-processor.ts`
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/proactive/behavior.ts`
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/config/bots.ts`
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/circuits.ts`
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/types/index.ts`
- `orgs/octave-commons/cephalon/packages/cephalon-ts/README.md`

### Clojure package
- `orgs/octave-commons/cephalon/packages/cephalon-clj/src/promethean/main.clj`
- `orgs/octave-commons/cephalon/packages/cephalon-clj/src/promethean/runtime/cephalon.clj`
- `orgs/octave-commons/cephalon/packages/cephalon-clj/src/promethean/runtime/eventbus.clj`
- `orgs/octave-commons/cephalon/packages/cephalon-clj/src/promethean/runtime/sentinel.clj`
- `orgs/octave-commons/cephalon/packages/cephalon-clj/src/promethean/runtime/eidolon.clj`
- `orgs/octave-commons/cephalon/packages/cephalon-clj/README.md`

### Shared event substrate
- `packages/event/src/types.ts`
- `packages/event/src/memory.ts`
- `packages/event/src/mongo.ts`
- `packages/event/README.md`

## Current state

### TypeScript Cephalon already has an event core, but timers still own control flow
The TS runtime is partially event-oriented already:

- Discord and IRC integrations publish normalized events into `@promethean-os/event`
- `SessionManager` routes events and emits `session.turn.started`
- `TurnProcessor` emits `session.turn.completed`, `session.turn.error`, and `tool.result`

But key runtime behavior is still timer-owned:

- `app.ts` creates one timeout per circuit via `scheduleCircuitTick()` and `runCircuitTick()`
- tick rescheduling happens in callback code after turn completion
- `promptFieldInterval`, `creditInterval`, and `statsInterval` use raw `setInterval`
- `ProactiveBehavior` is a long-running sleep loop with per-session inflight tracking rather than a consumer of scheduled events
- the domain event type itself is still `system.tick`, which conflates “temporal trigger” with “semantic cephalon reflection turn”

### Clojure Cephalon is eventful at the edges, loopful at the center
The Clojure package also has a bus, but the central cephalon runtime is a scheduled loop:

- `runtime/eventbus.clj` supports `emit!`, `subscribe!`, and dispatch
- `main.clj` wires file-watch events and session subscriptions
- `runtime/cephalon.clj` uses `ScheduledExecutorService.scheduleAtFixedRate`
- each scheduled loop polls the session channel, remembers events, builds context, runs one LLM step, then emits thought/error events
- sentinel file watching is event-like at the adapter boundary but still invokes work directly instead of turning into a domain event stream

### Shared issue
Both packages treat timers as hidden implementation detail instead of first-class temporal events.
That causes:

- overlapping scheduler logic across packages
- direct callback rescheduling instead of replayable event flow
- poor observability for “why did a loop fire now?”
- difficult migration from in-memory buses to durable cursored event stores
- weak equivalence between GitHub/webhook-triggered cephalons and timer-triggered cephalons even though both are just stimuli

## Goal
Move Cephalon toward a model where **all runtime activity is driven by events**, including time.

Concretely:

1. preserve current behavior
2. introduce a canonical temporal-event layer
3. make scheduler decisions observable and replayable
4. allow event sources such as Discord, GitHub, FS watch, RSS, timers, and admin commands to share one control vocabulary
5. support future durable event stores and cursor-based replay via `packages/event`

## Non-goals

- Replace every in-memory component with Mongo immediately
- Redesign personas, circuits, or prompts in this phase
- Remove `system.tick` immediately without a compatibility bridge
- Build a full distributed scheduler before local event semantics are stable

## Core framing
A timer is not different in kind from a webhook.
It is an event source with a different producer.

### Canonical rule
- GitHub webhook => external event producer
- Discord gateway => external event producer
- File watch => external event producer
- RSS poll => temporal event producer + fetch worker
- `setTimeout`/`setInterval` => temporary local temporal event producers

The runtime should consume domain events, not own callback loops.

## Target event model

### 1. External stimulus events
Examples:
- `discord.message.created`
- `irc.message.created`
- `github.pr.synchronized`
- `github.issue.commented`
- `fs.note.modified`
- `rss.poll.completed`
- `admin.command.received`

### 2. Temporal stimulus events
New canonical class:
- `temporal.timer.fired`
- `temporal.schedule.fired`
- `temporal.window.elapsed`

Recommended payload shape:

```ts
{
  scheduleId: string,
  scheduleKind: string,
  subjectId?: string,
  dueAt: number,
  firedAt: number,
  intervalMs?: number,
  attempt?: number,
  metadata?: Record<string, unknown>
}
```

### 3. Cephalon intent events
Derived from stimuli:
- `cephalon.tick.requested`
- `cephalon.proactive.requested`
- `cephalon.credit.refill.requested`
- `cephalon.prompt-field.refresh.requested`
- `cephalon.stats.snapshot.requested`
- `cephalon.rss.poll.requested`

### 4. Turn lifecycle events
Keep and strengthen:
- `session.turn.requested` or current `session.turn.started`
- `session.turn.completed`
- `session.turn.error`

Recommended future split:
- `session.turn.requested` means “the scheduler wants work done”
- `session.turn.started` means “a worker accepted the request”

### 5. Side-effect/result events
Keep and expand:
- `tool.result`
- `proactive.tool.result`
- `cephalon.thought`
- `cephalon.error`
- `memory.created`
- `memory.summary.created`

## Timer/tick translation model

### Translation rule
A timer callback should be decomposed into two pieces:

1. **scheduler emission**
   - emits a temporal event when time arrives
2. **domain translation**
   - turns that temporal event into a cephalon-specific intent event

### Current `system.tick` translation
Today:
- raw timer fires
- runtime constructs `CephalonEvent { type: "system.tick" ... }`
- session manager routes it
- turn completion callback schedules the next timer

Target:

1. scheduler emits:
   - `temporal.schedule.fired`
2. translator emits:
   - `cephalon.tick.requested`
3. session manager converts request into:
   - `session.turn.requested`
4. worker emits:
   - `session.turn.started`
   - `session.turn.completed` or `session.turn.error`
5. schedule projection emits next arm event:
   - `temporal.schedule.arm`

### Compatibility bridge
For migration safety, `cephalon.tick.requested` may still be converted into the legacy in-process shape:

```ts
{
  type: "system.tick",
  payload: {
    ...legacyTickPayload,
    scheduleId,
    scheduleKind,
    firedAt,
    compatibilityMode: true
  }
}
```

This lets prompts and turn processors keep working while the orchestration layer changes.

## Timer-to-event translation table

| Current mechanism | Current owner | Event-oriented replacement | Compatibility note |
| --- | --- | --- | --- |
| `scheduleCircuitTick()` + `runCircuitTick()` in TS | runtime callback chain | `temporal.schedule.arm` -> `temporal.schedule.fired` -> `cephalon.tick.requested` | keep emitting legacy `system.tick` during migration |
| `creditInterval` in TS | runtime interval | `temporal.schedule.fired(kind=credit-refill)` -> `cephalon.credit.refill.requested` | no prompt coupling |
| `statsInterval` in TS | runtime interval | `temporal.schedule.fired(kind=stats-snapshot)` -> `cephalon.stats.snapshot.requested` | can remain observability-only |
| `promptFieldInterval` in TS | runtime interval | `temporal.schedule.fired(kind=prompt-field-refresh)` -> `cephalon.prompt-field.refresh.requested` | projection can update prompt field state |
| `ProactiveBehavior` sleep loop | behavior object | `temporal.schedule.fired(kind=proactive-task)` -> `cephalon.proactive.requested` | existing `system.proactive` can remain payload form initially |
| `RssPoller` internal interval | poller object | `temporal.schedule.fired(kind=rss-poll)` -> `cephalon.rss.poll.requested` -> `rss.poll.completed` | decouple fetch from loop ownership |
| `scheduleAtFixedRate` in CLJ `run-loop!` | cephalon runtime | `:temporal/schedule-fired` -> `:cephalon/tick-requested` | preserve `:event/type :system.tick` until consumers migrate |
| CLJ sentinel direct FS handler | file-watch adapter | `:fs/note-modified` -> `:sentinel/contract-requested` -> `:sentinel/contract-completed` | fs watch is already an event source; just normalize and route |

## Proposed shared event topics

These topics are the recommended first stable vocabulary across TS + CLJ:

### Temporal
- `temporal.schedule.arm`
- `temporal.schedule.cancel`
- `temporal.schedule.fired`

### Cephalon intents
- `cephalon.tick.requested`
- `cephalon.proactive.requested`
- `cephalon.credit.refill.requested`
- `cephalon.prompt-field.refresh.requested`
- `cephalon.stats.snapshot.requested`
- `cephalon.rss.poll.requested`

### Session lifecycle
- `session.turn.requested`
- `session.turn.started`
- `session.turn.completed`
- `session.turn.error`

### Knowledge + memory
- `memory.created`
- `memory.summary.created`
- `memory.compaction.deleted`
- `eidolon.related.requested`
- `eidolon.related.resolved`

### Edge adapters
- `discord.message.created`
- `irc.message.created`
- `github.event.received`
- `fs.note.modified`
- `rss.poll.completed`
- `sentinel.contract.requested`
- `sentinel.contract.completed`
- `sentinel.contract.failed`

## Migration strategy

### Phase 0 — Name the architecture honestly
- Declare “timers are temporal events” in package docs.
- Add one cross-package spec glossary so `tick`, `timer`, `schedule`, `turn request`, and `turn completion` mean the same thing in TS and CLJ.
- Treat the current timer-owned loops as compatibility scaffolding, not the target architecture.

### Phase 1 — Introduce temporal events without changing prompt behavior
#### TypeScript
- Add temporal event types to `orgs/octave-commons/cephalon/packages/cephalon-ts/src/types/index.ts`.
- Add `session.turn.requested` as a distinct event from `session.turn.started`.
- Create a scheduler helper that emits `temporal.schedule.fired` instead of constructing `system.tick` directly.
- Add a translator layer that turns `temporal.schedule.fired(kind=circuit-tick)` into the current legacy `system.tick` payload.

#### Clojure
- Add `:temporal/schedule-fired` and `:cephalon/tick-requested` events.
- Keep `run-loop!` for now, but have it emit the temporal event first, then route through the existing cephalon handling path.

### Phase 2 — Move rescheduling into projections/reactors
#### TypeScript
- Replace direct “on completed/error, setTimeout(next)” logic with a reactor subscribed to turn lifecycle events.
- Example:
  - `session.turn.completed(eventType=system.tick)` -> emit `temporal.schedule.arm`
  - `session.turn.error(eventType=system.tick)` -> emit `temporal.schedule.arm` with retry/backoff metadata
- This makes rescheduling observable and replayable.

#### Clojure
- Replace `ScheduledExecutorService.scheduleAtFixedRate` ownership with a simpler scheduler reactor or adapter that just emits temporal events.
- The cephalon loop should consume from session/event queues, not own the wall-clock.

### Phase 3 — Convert secondary loops
#### TypeScript
Migrate these to temporal events:
- prompt field refresh
- credit refill
- stats snapshot
- proactive task stepping
- RSS polling

Each becomes:
- one schedule definition
- one temporal fired event
- one domain request event
- one result event

#### Clojure
Convert:
- sentinel file handling from direct callback work to `:sentinel/contract-requested`
- eidolon embedding or OpenPlanner emission side effects into explicit result events where helpful

### Phase 4 — Durability and replay
Use `packages/event` more fully:
- event store -> `MongoEventStore`
- cursor store -> `MongoCursorStore`

This allows:
- replay from earliest/latest/ts
- stable consumer groups
- deterministic recovery after process restart
- temporal event auditing

### Phase 5 — Retire legacy `system.tick`
Only after prompt/turn consumers can handle `cephalon.tick.requested` directly:
- stop using `system.tick` as the canonical orchestration event
- optionally preserve it as a derived prompt-context artifact only

## Package-specific start tasks

### Start tasks for `orgs/octave-commons/cephalon/packages/cephalon-ts`
1. Add event types:
   - `temporal.schedule.arm`
   - `temporal.schedule.fired`
   - `cephalon.tick.requested`
   - `session.turn.requested`
2. Extract tick scheduling into a dedicated scheduler module.
3. Replace direct `setInterval`/`setTimeout` wiring in `app.ts` with event emission wrappers.
4. Move reschedule logic out of `session.turn.completed` callback bodies into a small reactor.
5. Add tests proving one fired schedule produces one requested turn and one follow-up arm event.

### Start tasks for `orgs/octave-commons/cephalon/packages/cephalon-clj`
1. Add temporal event keywords and payload shapes.
2. Wrap the scheduled executor so it emits `:temporal/schedule-fired` rather than doing cephalon work directly.
3. Refactor `run-loop!` into:
   - queue drain / context build / step
   - invoked by an event consumer
4. Change file-watch sentinel path to emit normalized events first.
5. Add a minimal replay test that feeds synthetic temporal events into the bus and asserts the same cephalon outputs as the current timer path.

## Verification plan

### Behavioral parity
- one tick request still causes one turn
- no overlapping turns for the same session
- turn completion still drives future activity
- proactive tasks still serialize per session
- CLJ cephalon still emits thought/error events under the same inputs

### Event visibility
For every timer-owned loop we should be able to inspect:
- when it was armed
- why it fired
- what domain request it created
- what completion/error followed
- what next schedule was chosen

### Replay criteria
A captured sequence of temporal + external events should be sufficient to re-drive:
- session routing decisions
- turn requests
- memory creation side effects
- follow-up schedule arming

## Risks
- event proliferation without naming discipline
- dual-path behavior during compatibility period
- replay semantics may expose hidden dependence on wall-clock state
- CLJ and TS may drift if event names are not normalized early

## Open questions
- Should the canonical temporal topic be `temporal.schedule.fired` or `scheduler.fired`?
- Should `system.tick` survive as prompt-facing only, or remain a public domain event forever?
- Should the scheduler be embedded per runtime at first, or extracted immediately into a shared package/service?
- Should RSS polling be modeled as one temporal event plus one IO event, or one combined domain event?

## Initial recommendation
Start with the TypeScript package as the migration pilot because it already has:
- an event bus abstraction from `packages/event`
- turn lifecycle events
- multiple timer-owned loops that clearly expose the pattern

Use the Clojure package as the semantic simplifier:
- fewer moving parts
- easy target for proving that temporal events can replace `scheduleAtFixedRate`

If Phase 1 works in TS, mirror the same event vocabulary in CLJ before changing persistence.

## Definition of done for the first migration slice
- TS tick scheduling emits temporal events and turn-request events rather than constructing `system.tick` directly in the timer callback
- CLJ loop can be driven by synthetic temporal events with no direct fixed-rate ownership in the cephalon worker body
- docs describe timers as temporal event sources
- legacy `system.tick` remains supported through a compatibility translator
