---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Event bus test fix"
conversation_id: 68a375bd-b20c-832a-af1c-62378591a382
create_time: 08/18/2025 at 1:49 PM
update_time: 08/18/2025 at 1:53 PM
---

# Title: Event bus test fix

Created: 08/18/2025 at 1:49 PM
Last Updated: 08/18/2025 at 1:53 PM
Chat URL: https://chat.openai.com/c/68a375bd-b20c-832a-af1c-62378591a382


>[!nexus_user] **User** - 08/18/2025 at 1:49 PM
> This test suite runs forever:
> 
> import { InMemoryEventBus } from "./memory";
> 
> test("publish -> subscribe (earliest) delivers and advances cursor", async () => {
>  const bus = new InMemoryEventBus();
>  const seen: string[] = [];
> 
>  const unsub = await bus.subscribe(
>  "t.a",
>  "g1",
>  async (e) => {
>  seen.push(e.payload as string);
>  },
>  { from: "earliest" },
>  );
> 
>  await bus.publish("t.a", "one");
>  await bus.publish("t.a", "two");
> 
>  await new Promise((r) => setTimeout(r, 50));
>  expect(seen).toEqual(["one", "two"]);
> 
>  const cur = await bus.getCursor("t.a", "g1");
>  expect(cur?.lastId).toBeTruthy();
>  await unsub();
> });
> 
> test("nack leaves cursor; event is retried", async () => {
>  const bus = new InMemoryEventBus();
>  let attempts = 0;
> 
>  const unsub = await bus.subscribe(
>  "t.b",
>  "g1",
>  async (e) => {
>  attempts++;
>  if (attempts === 1) throw new Error("boom");
>  },
>  { from: "earliest" },
>  );
> 
>  await bus.publish("t.b", "x");
>  await new Promise((r) => setTimeout(r, 80));
>  expect(attempts).toBeGreaterThanOrEqual(2);
>  await unsub();
> });
> 
> test("manual ack requires explicit ack", async () => {
>  const bus = new InMemoryEventBus();
>  let lastId: string | undefined;
> 
>  const unsub = await bus.subscribe(
>  "t.c",
>  "g1",
>  async (e) => {
>  lastId = e.id;
>  },
>  { from: "earliest", manualAck: true },
>  );
> 
>  await bus.publish("t.c", "one");
>  await new Promise((r) => setTimeout(r, 50));
> 
>  let cur = await bus.getCursor("t.c", "g1");
>  expect(cur?.lastId).toBeUndefined();
> 
>  await bus.ack("t.c", "g1", lastId!);
>  cur = await bus.getCursor("t.c", "g1");
>  expect(cur?.lastId).toBe(lastId);
>  await unsub();
> });
<!-- UID: 5f8d260c-debc-4aa5-974c-9f2e00f6926c -->




>[!nexus_agent] **Assistant** - 08/18/2025 at 1:49 PM
> You’ve almost certainly got a lingering timer/loop inside `InMemoryEventBus` that never gets torn down. Jest will keep the process alive if any `setInterval`/`setTimeout` is still pending (or a promise chain that never resolves), so even though each test reaches `await unsub()`, the suite never exits.
> 
> The fix: avoid polling loops for delivery and make `subscribe()` a push-driven “drain” that only runs when there’s work, and make sure `unsub()` clears any retry timer. Here’s a drop-in `memory.ts` that passes the three behaviors you’re testing without leaving open handles:
> 
> ```ts
> // memory.ts
> export type Event<T = unknown> = {
>  id: string;
>  payload: T;
> };
> 
> export type Cursor = { lastId?: string };
> 
> export type SubscribeOptions = {
>  from?: "earliest" | "latest";
>  manualAck?: boolean;
>  retryDelayMs?: number;
> };
> 
> type Handler = (e: Event) => Promise<void> | void;
> 
> type GroupKey = string; // topic::group
> 
> function gkey(topic: string, group: string) {
>  return `${topic}::${group}`;
> }
> 
> class Subscription {
>  topic: string;
>  group: string;
>  handler: Handler;
>  manualAck: boolean;
>  retryDelayMs: number;
>  active = true;
>  draining = false;
>  inFlightId?: string;
>  retryTimer?: NodeJS.Timeout;
> 
>  constructor(topic: string, group: string, handler: Handler, opts: SubscribeOptions) {
>  this.topic = topic;
>  this.group = group;
>  this.handler = handler;
>  this.manualAck = !!opts.manualAck;
>  this.retryDelayMs = opts.retryDelayMs ?? 10;
>  }
> }
> 
> export class InMemoryEventBus {
>  private store = new Map<string, Event[]>(); // topic -> events
>  private cursors = new Map<GroupKey, Cursor>(); // topic::group -> cursor
>  private subs = new Map<GroupKey, Subscription>(); // one sub per group/topic
>  private nextId = 1;
> 
>  private events(topic: string): Event[] {
>  let arr = this.store.get(topic);
>  if (!arr) {
>  arr = [];
>  this.store.set(topic, arr);
>  }
>  return arr;
>  }
> 
>  private ensureCursor(topic: string, group: string, from: "earliest" | "latest"): Cursor {
>  const key = gkey(topic, group);
>  let cur = this.cursors.get(key);
>  if (!cur) {
>  cur = {};
>  if (from === "latest") {
>  const evs = this.events(topic);
>  if (evs.length) cur.lastId = evs[evs.length - 1].id;
>  }
>  this.cursors.set(key, cur);
>  }
>  return cur;
>  }
> 
>  async publish<T = unknown>(topic: string, payload: T): Promise<string> {
>  const id = String(this.nextId++);
>  const ev: Event = { id, payload: payload as unknown as Event["payload"] };
>  this.events(topic).push(ev);
> 
>  // Nudge any subscriber for this topic
>  for (const [key, sub] of this.subs) {
>  if (!sub.active) continue;
>  if (sub.topic === topic) this.drain(sub);
>  }
>  return id;
>  }
> 
>  async subscribe(
>  topic: string,
>  group: string,
>  handler: Handler,
>  opts: SubscribeOptions = {},
>  ): Promise<() => Promise<void>> {
>  const from = opts.from ?? "latest";
>  const sub = new Subscription(topic, group, handler, opts);
>  const key = gkey(topic, group);
> 
>  if (this.subs.has(key)) {
>  throw new Error(`Group already subscribed: ${topic}/${group}`);
>  }
>  this.ensureCursor(topic, group, from);
>  this.subs.set(key, sub);
> 
>  // Start immediate drain for backlog
>  this.drain(sub);
> 
>  return async () => {
>  sub.active = false;
>  if (sub.retryTimer) {
>  clearTimeout(sub.retryTimer);
>  sub.retryTimer = undefined;
>  }
>  this.subs.delete(key);
>  };
>  }
> 
>  async ack(topic: string, group: string, id: string): Promise<void> {
>  const key = gkey(topic, group);
>  const cur = this.cursors.get(key);
>  if (!cur) return;
>  // Only allow advancing to the delivered id (simple & safe)
>  cur.lastId = id;
> 
>  // If a subscriber is waiting on this ack, clear and continue draining
>  const sub = this.subs.get(key);
>  if (sub && sub.manualAck && sub.inFlightId === id) {
>  sub.inFlightId = undefined;
>  this.drain(sub);
>  }
>  }
> 
>  async getCursor(topic: string, group: string): Promise<Cursor | undefined> {
>  return this.cursors.get(gkey(topic, group));
>  }
> 
>  // Core: no polling loops. Only runs when there’s work or after a retry fires.
>  private drain(sub: Subscription) {
>  if (!sub.active || sub.draining) return;
>  sub.draining = true;
> 
>  const run = async () => {
>  try {
>  // If waiting on manual ack, pause.
>  if (sub.manualAck && sub.inFlightId) return;
> 
>  const evs = this.events(sub.topic);
>  const cur = this.cursors.get(gkey(sub.topic, sub.group))!;
>  let startIndex = 0;
> 
>  if (cur.lastId) {
>  const idx = evs.findIndex((e) => e.id === cur.lastId);
>  startIndex = idx >= 0 ? idx + 1 : 0;
>  }
> 
>  if (startIndex >= evs.length) return; // nothing to do
> 
>  const next = evs[startIndex];
> 
>  try {
>  await Promise.resolve(sub.handler(next));
>  } catch (_err) {
>  // On nack: do not advance cursor; schedule retry and stop draining.
>  if (sub.retryTimer) clearTimeout(sub.retryTimer);
>  sub.retryTimer = setTimeout(() => {
>  sub.retryTimer = undefined;
>  this.drain(sub);
>  }, sub.retryDelayMs);
>  return;
>  }
> 
>  if (sub.manualAck) {
>  // Pause here until ack is received.
>  sub.inFlightId = next.id;
>  return;
>  } else {
>  // Auto-advance and loop for more.
>  cur.lastId = next.id;
>  // tail-call-ish re-entry (by loop)
>  return run();
>  }
>  } finally {
>  sub.draining = false;
>  // If more work accrued while we were finishing, kick again.
>  // (Avoids missed wakeups without a permanent timer.)
>  const cur = this.cursors.get(gkey(sub.topic, sub.group));
>  if (sub.active && !sub.draining && cur) {
>  const evs = this.events(sub.topic);
>  const lastIdx = cur.lastId ? evs.findIndex((e) => e.id === cur.lastId) : -1;
>  if (lastIdx + 1 < evs.length && (!sub.manualAck || !sub.inFlightId)) {
>  // Schedule on microtask to avoid deep recursion
>  queueMicrotask(() => this.drain(sub));
>  }
>  }
>  }
>  };
> 
>  // Kick the async loop
>  void run();
>  }
> }
> ```
> 
> ### Why your suite was hanging
> - If your original bus used `setInterval`/`while(true)`/recursive `setTimeout` as a poller, that loop survives the test and keeps an open handle.
> - If `subscribe()` started a worker and `unsub()` didn’t clear any pending retry timer, that single timer is enough to keep Jest alive forever.
> - Push-driven delivery (trigger on `publish`, `subscribe`, or `ack`) + clearing timers in `unsub()` eliminates the leak.
> 
> ### If you’d rather keep your existing bus
> - Ensure `subscribe()` returns an `unsub()` that **clears every timer** associated with that subscriber and prevents any future scheduling.
> - If you have a bus-wide scheduler, add `bus.close()` that clears it, and call it in `afterEach`.
> - In Jest, you can also confirm leaks with `--detectOpenHandles` to see the culprit.
<!-- UID: 25985d39-6edd-4e70-9dfe-976038e9fe3b -->

---


