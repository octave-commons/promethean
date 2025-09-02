---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Mocking broker in AVA"
conversation_id: 68a4da6c-6844-8327-9b88-dcc5e6f0cb42
create_time: 08/19/2025 at 3:11 PM
update_time: 08/20/2025 at 12:04 AM
---

# Title: Mocking broker in AVA

Created: 08/19/2025 at 3:11 PM
Last Updated: 08/20/2025 at 12:04 AM
Chat URL: https://chat.openai.com/c/68a4da6c-6844-8327-9b88-dcc5e6f0cb42


>[!nexus_user] **User** - 08/19/2025 at 3:11 PM
> What's a good way to mock stuff when testing with ava? specificly the broker needs to be mocked up for many things to work with out agents writing hacks.
<!-- UID: f0e45b3f-8851-47d0-8dd8-4412fc6aee4c -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 3:13 PM
> Short version: don’t fight AVA to “mock imports.” Give your broker a pluggable transport and test against a **memory transport** for unit tests, and a tiny **in-process `ws` server** for integration tests. Use Sinon for spies/fake timers and Nock for any HTTP bits. AVA doesn’t ship mocking, and ESM import-level mocking is fragile with AVA right now. citeturn1view0
> 
> ---
> 
> # Recipe A — Unit tests with an in-memory broker
> 
> Define a small `IBroker` interface and a drop-in testing implementation. Your production code depends on the interface; tests pass the fake.
> 
> ```ts
> // ibroker.ts
> export type Envelope<T = unknown> = {
>  id: string; ts: number; topic: string; payload: T;
> };
> export type Handler<T = unknown> = (e: Envelope<T>) => Promise<void> | void;
> 
> export interface IBroker {
>  publish<T>(topic: string, payload: T): Promise<void>;
>  subscribe<T>(
>  topic: string,
>  group: string,
>  handler: Handler<T>,
>  opts?: { from?: 'earliest' | 'latest' }
>  ): Promise<() => Promise<void>>;
>  getCursor(topic: string, group: string): Promise<{ lastId?: string } | null>;
> }
> ```
> 
> ```ts
> // InMemoryBroker.ts (put under shared test utilities)
> import { randomUUID } from 'node:crypto';
> import { IBroker, Envelope, Handler } from './ibroker';
> 
> export class InMemoryBroker implements IBroker {
>  #messages = new Map<string, Envelope[]>(); // topic -> log
>  #cursors = new Map<string, number>(); // `${topic}:${group}` -> idx
>  #subs = new Map<string, Set<Handler>>(); // topic -> handlers
> 
>  async publish<T>(topic: string, payload: T) {
>  const list = this.#messages.get(topic) ?? [];
>  const env: Envelope<T> = { id: randomUUID(), ts: Date.now(), topic, payload };
>  list.push(env);
>  this.#messages.set(topic, list);
> 
>  // deliver async to resemble network behavior
>  queueMicrotask(() => this.#subs.get(topic)?.forEach(h => h(env)));
>  }
> 
>  async subscribe<T>(topic: string, group: string, handler: Handler<T>, opts?: {from?: 'earliest'|'latest'}) {
>  const key = `${topic}:${group}`;
>  const start = opts?.from === 'earliest' ? 0 : (this.#messages.get(topic)?.length ?? 0);
>  this.#cursors.set(key, start - 1);
> 
>  // catch-up replay
>  const backlog = this.#messages.get(topic) ?? [];
>  for (let i = start; i < backlog.length; i++) await handler(backlog[i]!);
> 
>  const set = this.#subs.get(topic) ?? new Set();
>  set.add(async (e: Envelope) => {
>  const i = (this.#cursors.get(key) ?? -1) + 1;
>  this.#cursors.set(key, i);
>  await handler(e);
>  });
>  this.#subs.set(topic, set);
> 
>  return async () => { set.delete(handler as Handler); };
>  }
> 
>  async getCursor(topic: string, group: string) {
>  const last = this.#cursors.get(`${topic}:${group}`);
>  return last == null || last < 0 ? null : { lastId: this.#messages.get(topic)?.[last]?.id };
>  }
> }
> ```
> 
> AVA test:
> 
> ```ts
> // broker.spec.ts
> import test from 'ava';
> import { InMemoryBroker } from './InMemoryBroker';
> 
> test('publish/subscribe delivers & tracks cursor', async t => {
>  const broker = new InMemoryBroker();
>  const seen: string[] = [];
> 
>  const unsub = await broker.subscribe('t.a', 'g1', e => { seen.push(e.payload as string); },
>  { from: 'earliest' });
> 
>  await broker.publish('t.a', 'one');
>  await broker.publish('t.a', 'two');
> 
>  await new Promise(r => setTimeout(r, 10));
>  t.deepEqual(seen, ['one', 'two']);
> 
>  const cur = await broker.getCursor('t.a', 'g1');
>  t.truthy(cur?.lastId);
>  await unsub();
> });
> ```
> 
> Why this path? AVA has no built-in mocking (you bring your own, e.g., Sinon), and ESM import-level mocking libraries are in flux — for instance, `esmock` explicitly dropped AVA/Jest support due to loader issues. Designing the broker behind an interface sidesteps all of that. citeturn1view0
> 
> ---
> 
> # Recipe B — Integration tests with a mock WebSocket broker
> 
> For code that *must* exercise your WS client, spin up a tiny `ws` server inside AVA hooks and point your client to it via an env var like `BROKER_URL=ws://127.0.0.1:<port>`. Use AVA’s `test.before/after` to set up/tear down. cite
> 
> ```ts
> // ws-broker.test.ts
> import test from 'ava';
> import { WebSocketServer } from 'ws';
> import type { AddressInfo } from 'node:net';
> 
> // Minimal, protocol-shaped mock
> test.beforeEach(t => {
>  const wss = new WebSocketServer({ port: 0 });
>  wss.on('connection', socket => {
>  socket.on('message', raw => {
>  const msg = JSON.parse(raw.toString());
>  if (msg.type === 'publish') {
>  // echo to subscribers for the same topic
>  wss.clients.forEach(client => {
>  if (client.readyState === 1) {
>  client.send(JSON.stringify({ type: 'event', topic: msg.topic, payload: msg.payload }));
>  }
>  });
>  }
>  });
>  });
>  const { port } = wss.address() as AddressInfo;
>  t.context = { wss, url: `ws://127.0.0.1:${port}` };
> });
> 
> test.afterEach.always(t => (t.context as any).wss.close());
> 
> // your client under test should read BROKER_URL at construction
> test('client publishes and receives messages', async t => {
>  process.env.BROKER_URL = (t.context as any).url;
>  const client = await createYourBrokerClientSomehow(); // ctor/factory in your code
> 
>  const received: any[] = [];
>  await client.subscribe('t.x', 'g1', e => received.push(e.payload), { from: 'latest' });
>  await client.publish('t.x', { hello: 'world' });
> 
>  await new Promise(r => setTimeout(r, 10));
>  t.deepEqual(received, [{ hello: 'world' }]);
> });
> ```
> 
> `ws` is the standard low-friction choice for this kind of in-process mock server. cite
> 
> ---
> 
> # Useful add-ons (these play nicely with AVA)
> 
> - **Sinon** for spies/stubs/fake timers (AVA explicitly expects you to bring a mocking library). 
>  ```ts
>  import sinon from 'sinon';
>  const clock = sinon.useFakeTimers();
>  // advance timers to trigger heartbeats/timeouts in your broker code
>  clock.tick(5000);
>  clock.restore();
>  ``` 
>  cite
> 
> - **Nock** for any HTTP calls your broker/client might make (auth, REST fallbacks, metrics, etc.). 
>  ```ts
>  import nock from 'nock';
>  nock('https://broker.example.test')
>  .post('/auth').reply(200, { token: 't' });
>  ``` 
>  cite
> 
> ---
> 
> # Wiring it into your codebase
> 
> 1) **Invert the dependency**: export a `createBroker()` that chooses transport by config:
> 
> ```ts
> // broker/index.ts
> import { IBroker } from './ibroker';
> import { InMemoryBroker } from './InMemoryBroker';
> import { WsBroker } from './WsBroker'; // your real client
> 
> export function createBroker(): IBroker {
>  const url = process.env.BROKER_URL;
>  if (!url || url === 'memory:') return new InMemoryBroker();
>  if (url.startsWith('ws://') || url.startsWith('wss://')) return new WsBroker(url);
>  throw new Error(`Unsupported BROKER_URL: ${url}`);
> }
> ```
> 
> 2) **In tests**, either:
> - set `BROKER_URL=memory:` (unit tests), or
> - start the `ws` server and set `BROKER_URL` to its URL (integration tests).
> 
> This keeps agents clean — no hacks, no global singletons, no loader sorcery.
> 
> ---
> 
> ## Notes on import-level mocking (if you *really* need it)
> 
> Historically folks reached for libraries that swap ESM imports at load time. Today that’s a minefield:
> - AVA has no built-in mocking. You can pair it with Sinon for spies, but replacing **ESM imports** needs a loader/sandbox. cite
> - `esmock` is a solid ESM-mocking lib, **but its README now states support for AVA/Jest is dropped** due to loader issues. If you require import-level mocking, consider the Node built-in test runner or a different strategy. citeturn1view0
> - Tools like `rewiremock` claim AVA compatibility, but ESM support is nuanced; I’d still recommend the DI + memory transport route for stability. citeturn5view0
> 
> ---
> 
> ## Quick checklist
> 
> - [ ] Put `InMemoryBroker` under a test utils path and make it the default when `BROKER_URL=memory:`.
> - [ ] Add a tiny `ws` server harness for end-to-end protocol tests (start/stop in AVA hooks). cite
> - [ ] Use **Sinon** for spies/timers; **Nock** for HTTP. cite
> - [ ] Avoid import-mocking with AVA unless you’re prepared to maintain loader plumbing.
> 
> If you want, I can drop a minimal “broker-harness” folder (memory broker + ws server helper + AVA macros) tailored to your current interfaces so the agents can just `createBroker()` without hacks.
<!-- UID: e6b1fc13-5bd6-49e4-bf53-1c3a0b8c18c8 -->

---


