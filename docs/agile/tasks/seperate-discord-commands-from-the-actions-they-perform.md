---
$$
uuid: 56da5f84-d732-4455-b0a6-97b36fbae026
$$
title: Cephalon Commands → Actions Refactor — Task Refinement
status: todo
priority: P3
labels: []
$$
created_at: '2025-09-15T02:02:58.520Z'
$$
---
# Cephalon Commands → Actions Refactor — Task Refinement

> Split Discord-facing **commands** from reusable **actions** (DI via `scope`).

---

## 🎯 Objectives

* The `Bot` class becomes a thin **router** for Discord commands only.
* Each **action** lives in its own file under `./src/actions`. Most actions are **Discord-agnostic**, but **Discord‑coupled actions** are allowed where it makes sense (e.g., voice control).
* Each **command** lives in its own file under `./src/commands` and is **Discord-specific**.
* Commands **extract/build** the `scope` for actions and map interaction params → action inputs.
* Actions are callable from **other entry points** (broker handlers, schedulers, CLI).

---

## 📦 Requirements (Detailed)

* **Project Structure**

  * `./services/ts/cephalon/src/actions/*` — one action per file, default export `run(scope, input)`.
  * Each action defines **its own local scope** in a colocated file, e.g. `actions/foo.scope.ts` or `actions/foo/scope.ts`.
  * `./services/ts/cephalon/src/commands/*` — one command per file, default export `execute(interaction)`.
  * `./services/ts/cephalon/src/factories/*` — optional reusable dependency factories (e.g., `logger`, `mongo`, `broker`, `discordCtx`, `voice`, `testing`).
  * Prefer **adapters** for platform APIs. Discord‑coupled actions may depend on `discord.js` **via a small adapter** or directly if necessary for clarity.
  * Imports follow repo rules: use **@shared/ts/dist/...** for shared libs (no new aliases).

* **Action Design**

  * Pure async functions with signature $per-action scope type$:

    ```ts
    // actions/ping.ts
    import type { PingScope } from "./ping.scope";

    export type PingInput = { userId: string };
    export type PingOutput = { message: string };

    export default async function run(scope: PingScope, input: PingInput): Promise<PingOutput> {
      // ... business logic, using only PingScope deps
      return { message: "pong" };
    }
    ```
  * No global singletons; everything flows through `scope`.
  * Errors are **typed** (domain errors) and surfaced to caller; no direct user messaging.I = unknown, O = unknown> = (scope: ActionScope, input: I) => Promise<O>;
    export default async function run(scope: ActionScope, input: I): Promise<O> { /\* ... \*/ }

  * No global singletons; everything flows through `scope`.
  * Errors are **typed** (domain errors) and surfaced to caller; no direct user messaging.

* **Scope Object**

  * Defined per-action next to the action file $e.g., `./src/actions/ping.scope.ts` or `./src/actions/ping/scope.ts`$; no global `ActionScope`:

    ```ts
    // Example: actions/ping.ts scope
    export type PingScope = {
      logger: Logger;
      policy: PolicyChecker;
      time: () => Date;                  // inject for testability
      // Optional deps for THIS action only
      tts?: VoiceSynth; stt?: SttClient;
      // Add only what the action truly needs (e.g., db, broker) — keep minimal
    };
    ```
  * Commands compose the **action-local scope** using a small builder exported next to the action $e.g., `buildPingScope(ctx)`$, which may internally use helpers in `src/factories/*`.
  * No monolithic `makeBaseScope` or global `ActionScope` type; keep scopes **minimal and action-specific**.

* **Command Responsibilities**

  * Parse/validate interaction options → `input` for action.
  * Build action-specific scope via its `build*Scope(interactionOrCtx)` (colocated next to the action), using `src/factories/*` as needed.
  * Handle Discord reply lifecycle: defer, follow-up, ephemeral.
  * Map action outcomes/errors → user-visible messages.
  * No business logic; no DB calls directly.

* **Permissions & Policy (Circuit 2)**

  * Actions call `scope.policy.assertAllowed(subject, action, resource)` early.
  * Commands **never** bypass policy.

* **Error Handling**

  * Standard error types: `UserError`, `NotAllowedError`, `RetryableError`, `SystemError`.
  * Commands render friendly text for `UserError` & `NotAllowedError`; log others.

* **Testing**

  * Unit tests for **actions** with action-local scope mocks $e.g., `actions/foo.scope.mock.ts`$ — no Discord.
  * Contract tests for **commands** using `discord.js` mocks verifying defers, replies.
  * One integration test proving an **action is invokable via non-Discord path** (e.g., broker handler or CLI) using `build*Scope()` without Discord context.

* **Docs & DX**

  * Short README: how to add a command, add an action, define its local scope, and compose with factories.
  * Keep factories small and composable under `src/factories/*`; avoid global containers.

---

## ✅ Acceptance Criteria

* [ ] `Bot` class contains only command registration/routing; no business logic.
* [ ] All existing commands from `bot.ts` moved to `./src/commands/*` with matching names.
* [ ] Each command calls an action in `./src/actions/*`.
* [ ] Each action has a colocated `*.scope.ts` defining its minimal scope + builder.
* [ ] Discord‑coupled actions (if any) isolate behavior behind a small adapter and expose a **broker‑friendly** scope builder; tests include adapter mocks.
* [ ] At least one action exercised from a **non-Discord** context $broker/CLI$ in tests.
* [ ] Lint, typecheck, and tests green in CI; PM2 processes unaffected.
* [ ] Docs updated: how to add a command, how to add an action, how to call from elsewhere.

---

## 🧱 Runtime State & Store (Redux‑lite, no deps)

**Why**: The `Bot` currently acts like a process‑wide variable bucket. Introduce a tiny, framework‑free **store + effects** so the Bot only routes Discord events → `dispatch()`, and **effects** call our domain **actions/**.
$$
**Principles**
$$
* Library‑free (no Redux pkg): \~40 lines of `createStore` + `subscribe`, `dispatch`, `getState`.
* **Events** $not to be confused with `actions/`$: immutable payloads describing *what happened / intent*.
* **Reducer**: pure `(state, event) => state'` for ephemeral runtime state (voice status, shard health, throttles, in‑flight tasks).
* **Effects**: async listeners triggered by specific events; they call `actions/*` with an action‑local scope, may `dispatch` follow‑up events.
* **Broker bridge**: middleware to forward selected events to the message bus and to dispatch incoming broker messages.
* **Selectors**: small pure helpers to read derived data for scope builders.

**State is ephemeral** (per process): never the source of truth for DB; mirrors live runtime only.

---

## 🧭 Non‑Goals

* Building a full IoC container framework; keep DI **manual & simple**.
* Changing business logic or command behavior; only **moving/separating** concerns.
* Introducing new path aliases beyond **@shared/ts/dist**.

---

## 🧱 Constraints

* Monorepo conventions (#shared folder). Do **not** introduce new shared packages or aliases.
* Keep action signatures stable and minimal; prefer adding to `scope` over passing many params.

---

## 🪜 Subtasks (Implementation Plan)
$$
1. **Inventory & Plan**
$$
   * [ ] List commands currently in `bot.ts` (names, options, permissions, long‑running?).
   * [ ] Group by domain; propose action filenames.
$$
2. **Scaffold**
$$
   * [ ] Add `src/actions/`, `src/commands/`, and `src/factories/` directories.
   * [ ] Add minimal helpers in `src/factories/` (e.g., `logger.ts`, `mongo.ts`, `broker.ts`, `discord.ts`, `voice.ts`, `testing.ts`).
   * [ ] Add `src/store/` with `createStore.ts`, `events.ts`, `reducer.ts`, `effects/`.
   * [ ] Add adapter for `discord.js` voice under `src/factories/voice.ts`.
$$
3. **Move Bot to Router**
$$
   * [ ] `Bot` wires Discord → `dispatch()` only; no business logic.
   * [ ] Register effects on store startup.
$$
4. **Tracer Bullet**
$$
   * [ ] Implement `ping` (agnostic) + `leave-voice` (Discord‑coupled via adapter).
   * [ ] For each, add: event(s) → effect(s) → action call → follow‑up event.
$$
5. **Port Remaining Commands**
$$
   * [ ] Create events for each command; route input parsing in commands; business in actions.
   * [ ] Ensure long-running actions use `deferReply()` & follow-ups.
$$
6. **Broker Bridge**
$$
   * [ ] Middleware to forward certain events to broker; subscribe to broker topics and `dispatch` incoming messages.
$$
7. **Testing**
$$
   * [ ] Unit tests: reducer (pure), selectors (pure), effects $mock factories + actions$.
   * [ ] Command tests with Discord mocks verifying defers, replies, and `dispatch` calls.
   * [ ] Integration test: broker → store → effect → action path.
$$
8. **Docs & Scripts**
$$
   * [ ] Update README for store/effects patterns and naming (Events vs Actions).
$$
9. **Cleanup**
$$
   * [ ] Delete business logic from `bot.ts`; keep only routing & `dispatch`.

---

## 🗂️ Proposed File Layout

```
services/ts/cephalon/
  src/
    actions/
      ping.ts
      ping.scope.ts
      leave-voice.ts
      leave-voice.scope.ts
      ...
    commands/
      ping.ts
      leave-voice.ts
      ...
    factories/
      logger.ts
      mongo.ts
      broker.ts
      chroma.ts
      discord.ts
      voice.ts
      telemetry.ts
      tts.ts
      stt.ts
      testing.ts
    store/
      createStore.ts        // tiny framework-free store
      events.ts             // union of event types
      reducer.ts            // pure state updates
      effects/
        voice.ts            // reacts to leave/join events → calls actions
        health.ts           // shard/heartbeat events → actions
        ...
    bot/
      index.ts              // registers commands, routes → store.dispatch
    broker/
      handlers.ts           // non-Discord invocations → actions or dispatch
      bridge.ts             // subscribes broker → dispatch; forwards events → broker
    cli/
      cephalon-cli.ts
  test/
    actions/
    commands/
    store/
    integration/
```

---

## 📐 Reference Sketches

### Mermaid — High-Level Flow

```mermaid
flowchart LR
  A[Discord Interaction] --> B(Bot Router)
  B -->|dispatch| S[Store]
  S --> R[Reducer]
  S --> E(Effects)
  E -->|call| ACT[Action (domain fn)]
  ACT -->|result| E
  E -->|dispatch follow-up| S
  E -->|reply/DM via command wrapper| B

  subgraph Non-Discord
    X[Broker/Event/CLI] -->|dispatch or call| S
    E -->|broker bridge| X
  end
```

### Mermaid — Module Boundaries

```mermaid
graph TD
  subgraph Commands (discord.js only)
    CMD1[commands/*]
  end
  subgraph Actions (pure)
    ACT1[actions/* + *.scope.ts]
  end
  subgraph Factories
    F1[logger]
    F2[mongo]
    F3[broker]
    F4[discord]
  end
  CMD1 --> ACT1
  ACT1 --> F1
  ACT1 --> F2
  ACT1 --> F3
  CMD1 --> F4
```

---

## ✨ Code Skeletons
$$
**Tiny store (framework‑free)**
$$
```ts
// src/store/createStore.ts
export type Unsubscribe = () => void;
export type Listener<E> = (event: E) => void | Promise<void>;

export function createStore<S, E>(initial: S, reducer: (s: S, e: E) => S) {
  let state = initial;
  const listeners = new Set<Listener<E>>();

  function getState() { return state; }
  function subscribe(l: Listener<E>): Unsubscribe { listeners.add(l); return () => listeners.delete(l); }
  async function dispatch(e: E) {
    state = reducer(state, e); // pure update
    for (const l of listeners) await l(e); // fire effects (can be async)
  }

  return { getState, subscribe, dispatch };
}
```
$$
**Events & reducer**
$$
```ts
// src/store/events.ts
export type Event =
  | { type: 'VOICE/LEAVE_REQUESTED'; guildId: string; channelId?: string; by: string }
  | { type: 'VOICE/LEFT'; guildId: string }
  | { type: 'HEARTBEAT/UP'; pid: number; name: string }
  | { type: 'HEARTBEAT/DOWN'; pid: number; name: string }
  // ... add more
;

// src/store/reducer.ts
export type CephalonState = {
  voice: Record<string, { connected: boolean; channelId?: string }>;
  heartbeats: Record<string, { up: boolean; pid?: number }>;
};

export const initialState: CephalonState = { voice: {}, heartbeats: {} };

export function reducer(s: CephalonState, e: Event): CephalonState {
  switch (e.type) {
    case 'VOICE/LEFT': {
      const next = { ...s.voice }; next[e.guildId] = { connected: false };
      return { ...s, voice: next };
    }
    case 'HEARTBEAT/UP': {
      const key = e.name; return { ...s, heartbeats: { ...s.heartbeats, [key]: { up: true, pid: e.pid } } };
    }
    case 'HEARTBEAT/DOWN': {
      const key = e.name; return { ...s, heartbeats: { ...s.heartbeats, [key]: { up: false } } };
    }
    default: return s;
  }
}
```

**Effect that calls a Discord‑coupled action**

```ts
// src/store/effects/voice.ts
import type { Event } from '../events';
import { buildLeaveVoiceScope } from '../../actions/leave-voice.scope';
import runLeave from '../../actions/leave-voice';

export function registerVoiceEffects(store: { subscribe: (l: (e: Event) => void) => () => void; dispatch: (e: Event) => Promise<void> }) {
  store.subscribe(async (e) => {
    if (e.type === 'VOICE/LEAVE_REQUESTED') {
      const scope = await buildLeaveVoiceScope();
      await runLeave(scope, { guildId: e.guildId, channelId: e.channelId });
      await store.dispatch({ type: 'VOICE/LEFT', guildId: e.guildId });
    }
  });
}
```

**Bot router uses dispatch, not business logic**

```ts
// src/bot/index.ts
import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { createStore } from '../store/createStore';
import { reducer, initialState } from '../store/reducer';
import type { Event } from '../store/events';
import { registerVoiceEffects } from '../store/effects/voice';

export const store = createStore(initialState, reducer);
registerVoiceEffects(store);

export const leaveVoiceData = new SlashCommandBuilder().setName('leave-voice').setDescription('Disconnect');

export async function executeLeaveVoice(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  await store.dispatch({ type: 'VOICE/LEAVE_REQUESTED', guildId: interaction.guildId!, by: interaction.user.id });
  await interaction.editReply('Leaving…');
}
```
$$
**Broker bridge sketch**
$$
```ts
// src/broker/bridge.ts
import type { Event } from '../store/events';
import { BrokerClient } from '@shared/ts/dist/broker';

export function attachBrokerBridge(store: { dispatch: (e: Event) => Promise<void> }) {
  const broker = new BrokerClient();
  broker.subscribe('cephalon.events', async (busEvent) => {
    // validate & map busEvent → Event
    await store.dispatch(busEvent as Event);
  });

  // Optional: forward certain events to bus
  // store.subscribe(e => broker.publish('cephalon.events', e))
}
```

---

## 🧪 Test Matrix

* **Actions**

  * Happy-path returns
  * Policy denied → typed error
  * Retryable system error bubbles
* **Commands**

  * Defers reply for long-running actions
  * Renders user-friendly errors for `UserError`/`NotAllowedError`
  * Ephemeral vs public replies respected
* **Non-Discord**

  * Action callable from CLI/broker with mock scope

---

## 🚚 Migration Plan

1. Land scaffolding & base scope.
2. Port one simple command (ping) end-to-end.
3. Port medium-complexity command $needs DB/vector access$.
4. Port remaining commands in small PRs; remove logic from `bot.ts`.
5. Add Discord voice adapter and broker invocation example for a Discord‑coupled action.

---

## 🧨 Risks & Mitigations

* **Hidden Discord coupling in logic** → First tracer PR reveals API needs; iterate scope.
* **Overgrown `scope`** → Establish boundaries; prefer adapters per domain; document fields.
* **Test flakiness** → Provide stable mocks per-action $e.g., `actions/foo.scope.mock.ts`$ or shared in `src/factories/testing.ts`.

---


## 🧾 PR Checklist (Definition of Done)

* [ ] New files placed under `src/actions` and `src/commands` with matching names.
* [ ] Discord‑coupled actions document their adapter dependency; tests cover adapter usage.
* [ ] `Bot` only routes.
* [ ] Unit & integration tests added/updated.
* [ ] Docs updated; examples compile.
* [ ] Imports follow **@shared/ts/dist/** convention.

---

## 🔗 Related Epics / Tags

\#framework-core #cephalon #dependency-injection #separation-of-concerns #actions #commands #discord

---

## 🔍 Relevant Links

* \$\[kanban.md]$

## Notes
- Tests or documentation are missing; acceptance criteria not fully met.
- Story Points: 3
$$
#in-progress
$$
