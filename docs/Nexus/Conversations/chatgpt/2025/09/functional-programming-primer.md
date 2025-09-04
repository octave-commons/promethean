---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Functional programming primer"
conversation_id: 68b65d1d-14ac-8330-8249-bf25ffb3c86f
create_time: 09/01/2025 at 9:57 PM
update_time: 09/02/2025 at 12:25 PM
---

# Title: Functional programming primer

Created: 09/01/2025 at 9:57 PM
Last Updated: 09/02/2025 at 12:25 PM
Chat URL: https://chat.openai.com/c/68b65d1d-14ac-8330-8249-bf25ffb3c86f


>[!nexus_user] **User** - 09/01/2025 at 9:57 PM
> Write a functional programming in typescript primer
<!-- UID: 5c88b25e-41de-42ae-aaa0-2f05e23eea29 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 9:57 PM
> # Functional Programming in TypeScript — a pragmatic, no-BS primer
> 
> You don’t need Haskell or heavy libs to write clean, composable, testable TypeScript. You **do** need discipline, a few tiny helpers, and a clear separation between **pure** code and **effects** (I/O, time, randomness). This primer keeps it practical and opinionated.
> 
> ---
> 
> ## TL;DR rules
> 
> 1. **Make everything pure by default.** Function in → function out. No hidden mutation, time, I/O, or global state.
> 2. **Push effects to the edges.** Read files, call HTTP, get time *outside* your core logic; inject results in.
> 3. **Prefer data transformations.** Maps, filters, reduces, folds, combinators. Avoid classes with mutable state.
> 4. **Use types to forbid foot-guns.** `readonly`, `ReadonlyArray<T>`, discriminated unions.
> 5. **Compose small functions.** Build bigger behavior from tiny, focused pieces.
> 6. **Determinism beats cleverness.** If it’s hard to test, it’s probably too coupled to effects.
> 
> If you only follow those six, your codebase will already feel different.
> 
> ---
> 
> ## Core mental model
> 
> - **Pure layer:** all business logic, pure functions, total/typed. Deterministic and easy to fuzz/test.
> - **Ports (effects) layer:** boundary interfaces for I/O (`readFile`, `fetchJson`, `now`, `randomInt`).
> - **Adapters (wiring):** the only place you *actually* touch Node, fetch, fs, env vars, etc.
> 
> Think like a systems designer: functions are pipes, values flow through. You can swap adapters without touching the pure core.
> 
> ---
> 
> ## TypeScript features that matter
> 
> - **`readonly` and `ReadonlyArray<T>`**
> - **Discriminated unions** (aka algebraic data types)
> - **Narrowing & exhaustiveness** with `switch (x._tag) { ... }`
> - **Utility types**: `Record<K,V>`, `Pick`, `Partial`, `ExactOptionalPropertyTypes`, `noUncheckedIndexedAccess`
> - **`as const`** for literal safety
> - **Generics** for reusable combinators
> 
> ---
> 
> ## A minimal FP “micro-kit” (no dependency)
> 
> Drop this into `shared/fp.ts`:
> 
> ```ts
> // shared/fp.ts
> export const pipe = <A>(a: A, ...fns: Array<(x: any) => any>) =>
>  fns.reduce((x, f) => f(x), a) as any;
> 
> export type Option<A> = { _tag: "None" } | { _tag: "Some"; value: A };
> export const None: Option<never> = { _tag: "None" };
> export const Some = <A>(value: A): Option<A> => ({ _tag: "Some", value });
> export const O = {
>  map:
>  <A, B>(f: (a: A) => B) =>
>  (oa: Option<A>): Option<B> =>
>  (oa._tag === "Some" ? Some(f(oa.value)) : None),
>  flatMap:
>  <A, B>(f: (a: A) => Option<B>) =>
>  (oa: Option<A>): Option<B> =>
>  (oa._tag === "Some" ? f(oa.value) : None),
>  getOrElse:
>  <A>(onNone: () => A) =>
>  (oa: Option<A>): A =>
>  (oa._tag === "Some" ? oa.value : onNone()),
> };
> 
> export type Result<E, A> = { _tag: "Ok"; value: A } | { _tag: "Err"; error: E };
> export const Ok = <A>(value: A): Result<never, A> => ({ _tag: "Ok", value });
> export const Err = <E>(error: E): Result<E, never> => ({ _tag: "Err", error });
> export const R = {
>  map:
>  <E, A, B>(f: (a: A) => B) =>
>  (ra: Result<E, A>): Result<E, B> =>
>  (ra._tag === "Ok" ? Ok(f(ra.value)) : ra),
>  flatMap:
>  <E, A, B>(f: (a: A) => Result<E, B>) =>
>  (ra: Result<E, A>): Result<E, B> =>
>  (ra._tag === "Ok" ? f(ra.value) : ra),
> };
> 
> export type Task<A> = () => Promise<A>;
> export const T = {
>  map:
>  <A, B>(f: (a: A) => B) =>
>  (ta: Task<A>): Task<B> =>
>  async () =>
>  f(await ta()),
>  flatMap:
>  <A, B>(f: (a: A) => Task<B>) =>
>  (ta: Task<A>): Task<B> =>
>  async () =>
>  f(await ta())(),
> };
> ```
> 
> You just got `pipe`, `Option`, `Result`, and a lightweight `Task` (aka lazy `Promise`). 90% of FP needs, covered.
> 
> ---
> 
> ## Everyday transformations (cheat sheet)
> 
> ```ts
> // Pure helpers (no mutation)
> export const map = <A, B>(f: (a: A) => B) => (xs: ReadonlyArray<A>): ReadonlyArray<B> =>
>  xs.map(f);
> 
> export const filter = <A>(p: (a: A) => boolean) => (xs: ReadonlyArray<A>) =>
>  xs.filter(p);
> 
> export const reduce =
>  <A, B>(zero: B, f: (b: B, a: A) => B) =>
>  (xs: ReadonlyArray<A>) =>
>  xs.reduce(f, zero);
> 
> export const groupBy = <A, K extends string | number | symbol>(
>  key: (a: A) => K,
> ) => (xs: ReadonlyArray<A>): Readonly<Record<K, ReadonlyArray<A>>> =>
>  xs.reduce((acc, x) => {
>  const k = key(x);
>  const bucket = acc[k] ?? [];
>  return { ...acc, [k]: [...bucket, x] };
>  }, {} as Record<K, A[]> as any);
> 
> export const uniqBy = <A, K>(key: (a: A) => K) => (xs: ReadonlyArray<A>) => {
>  const seen = new Set<K>();
>  const out: A[] = [];
>  for (const x of xs) {
>  const k = key(x);
>  if (!seen.has(k)) { seen.add(k); out.push(x); }
>  }
>  return out as ReadonlyArray<A>;
> };
> ```
> 
> Use with `pipe(data, map(...), filter(...), reduce(...))`.
> 
> ---
> 
> ## Error handling without drama
> 
> - Avoid throwing inside pure code. Use `Result<E,A>` for expected failures.
> - Use `Option<A>` where absence is normal.
> - Convert exceptions at the *edge* (adapter) to `Err`.
> 
> Example: parsing JSON safely with `Result`:
> 
> ```ts
> import { Result, Ok, Err } from "./shared/fp";
> 
> export const safeJson = <A = unknown>(s: string): Result<string, A> => {
>  try {
>  return Ok(JSON.parse(s) as A);
>  } catch (e) {
>  return Err(`Invalid JSON: ${(e as Error).message}`);
>  }
> };
> ```
> 
> Want schema validation? Use `zod` *in the adapter or a thin wrapper* so the core still sees a typed value or a `Result`.
> 
> ```ts
> import { z } from "zod";
> import { Result, Ok, Err } from "./shared/fp";
> 
> const User = z.object({ id: z.string(), email: z.string().email() });
> type User = z.infer<typeof User>;
> 
> export const parseUser = (u: unknown): Result<string, User> => {
>  const r = User.safeParse(u);
>  return r.success ? Ok(r.data) : Err(r.error.message);
> };
> ```
> 
> ---
> 
> ## Async without spaghetti
> 
> Model async computations as **`Task<A>`** (aka `() => Promise<A>`). It’s lazy: nothing runs until you call it.
> 
> ```ts
> import { T } from "./shared/fp";
> 
> const getUser: Task<{ id: string }> = async () => ({ id: "u1" });
> 
> const program = T.map((u: { id: string }) => u.id)(getUser);
> // Still nothing executed
> 
> program().then(console.log); // "u1"
> ```
> 
> Compose tasks:
> 
> ```ts
> import { T } from "./shared/fp";
> 
> const fetchUser = (id: string): Task<{ id: string; name: string }> =>
>  async () => ({ id, name: "Alice" });
> 
> const fetchOrders = (id: string): Task<readonly string[]> =>
>  async () => ["o1", "o2"];
> 
> const program = T.flatMap((u: { id: string }) =>
>  T.map((orders: readonly string[]) => ({ user: u, orders }))(fetchOrders(u.id))
> )(fetchUser("u1"));
> 
> const result = await program(); // { user: {...}, orders: [...] }
> ```
> 
> Concurrency? Use `Promise.all` at the edge:
> 
> ```ts
> const runAll = <A>(tasks: ReadonlyArray<Task<A>>): Task<ReadonlyArray<A>> =>
>  async () => Promise.all(tasks.map((t) => t()));
> ```
> 
> ---
> 
> ## IO boundary (Ports & Adapters)
> 
> Define **ports** (interfaces) for effects. Core stays pure and gets ports injected.
> 
> ```ts
> // ports.ts
> export type Ports = {
>  now: () => number; // time
>  readText: (path: string) => Promise<string>; // fs or http
>  log: (msg: string) => void; // logging
> };
> ```
> 
> Core pipeline (pure **except** it *accepts* ports):
> 
> ```ts
> // core.ts
> import { pipe } from "./shared/fp";
> import { map, filter } from "./shared/array-ops";
> import type { Ports } from "./ports";
> 
> export type Invoice = Readonly<{ id: string; amount: number; paid: boolean }>;
> 
> export const summarize = (ports: Ports) =>
>  (invoices: ReadonlyArray<Invoice>) => {
>  ports.log(`summarizing ${invoices.length} invoices at ${ports.now()}`);
>  const total = pipe(
>  invoices,
>  filter((i) => !i.paid),
>  map((i) => i.amount),
>  ).reduce((a, b) => a + b, 0);
>  return { outstanding: total, count: invoices.length } as const;
>  };
> ```
> 
> Adapter for Node:
> 
> ```ts
> // adapters/node.ts
> import fs from "node:fs/promises";
> import { Ports } from "../ports";
> 
> export const nodePorts: Ports = {
>  now: () => Date.now(),
>  readText: (p) => fs.readFile(p, "utf8"),
>  log: (m) => console.log(m),
> };
> ```
> 
> Wire in `main` (only place with real effects):
> 
> ```ts
> // main.ts
> import { nodePorts } from "./adapters/node";
> import { summarize, type Invoice } from "./core";
> 
> const run = async () => {
>  const data: ReadonlyArray<Invoice> = [
>  { id: "1", amount: 10, paid: false },
>  { id: "2", amount: 5, paid: true },
>  ];
>  const result = summarize(nodePorts)(data);
>  console.log(result);
> };
> 
> run();
> ```
> 
> ---
> 
> ## Testing with **AVA** (ESM, TypeScript, zero drama)
> 
> **`package.json`**
> 
> ```json
> {
>  "type": "module",
>  "scripts": {
>  "test": "ava"
>  },
>  "devDependencies": {
>  "ava": "^6.0.0",
>  "ts-node": "^10.9.2",
>  "typescript": "^5.6.2"
>  },
>  "ava": {
>  "extensions": {
>  "ts": "module"
>  },
>  "nodeArguments": ["--loader=ts-node/esm"],
>  "require": []
>  }
> }
> ```
> 
> **`tsconfig.json`**
> 
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "ESNext",
>  "moduleResolution": "Bundler",
>  "strict": true,
>  "noUncheckedIndexedAccess": true,
>  "exactOptionalPropertyTypes": true,
>  "verbatimModuleSyntax": true,
>  "resolveJsonModule": true,
>  "skipLibCheck": true
>  }
> }
> ```
> 
> **A pure test with faked ports**
> 
> ```ts
> // test/core.test.ts
> import test from "ava";
> import { summarize, type Invoice } from "../src/core";
> import type { Ports } from "../src/ports";
> 
> const fakePorts: Ports = {
>  now: () => 1234567890,
>  readText: async () => "unused",
>  log: () => void 0,
> };
> 
> test("summarize computes outstanding correctly (pure core)", (t) => {
>  const invoices: ReadonlyArray<Invoice> = [
>  { id: "1", amount: 10, paid: false },
>  { id: "2", amount: 5, paid: true },
>  ];
>  const result = summarize(fakePorts)(invoices);
>  t.deepEqual(result, { outstanding: 10, count: 2 });
> });
> ```
> 
> No files touched. No clocks. Fast.
> 
> ---
> 
> ## Discriminated unions for real-world modeling
> 
> Stop passing `any`. Model state explicitly.
> 
> ```ts
> type Loading = { _tag: "Loading" };
> type Loaded<A> = { _tag: "Loaded"; data: A };
> type Failed = { _tag: "Failed"; reason: string };
> type RemoteData<A> = Loading | Loaded<A> | Failed;
> 
> const foldRemote = <A, B>(
>  onLoading: () => B,
>  onLoaded: (a: A) => B,
>  onFailed: (e: string) => B,
> ) => (r: RemoteData<A>): B => {
>  switch (r._tag) {
>  case "Loading": return onLoading();
>  case "Loaded": return onLoaded(r.data);
>  case "Failed": return onFailed(r.reason);
>  }
> };
> ```
> 
> Use `foldRemote` to render UI, choose retries, etc. Exhaustiveness guarantees you didn’t forget a case.
> 
> ---
> 
> ## Reducers: managing state the functional way
> 
> Event → reduce → new state. No mutation necessary.
> 
> ```ts
> type Cart = Readonly<{ items: ReadonlyArray<{ sku: string; qty: number }> }>;
> type Add = { _tag: "Add"; sku: string; qty: number };
> type Remove = { _tag: "Remove"; sku: string };
> type Event = Add | Remove;
> 
> const reduceCart = (state: Cart, ev: Event): Cart => {
>  switch (ev._tag) {
>  case "Add": {
>  const idx = state.items.findIndex(i => i.sku === ev.sku);
>  if (idx === -1) return { items: [...state.items, { sku: ev.sku, qty: ev.qty }] };
>  const next = state.items.map((i, j) => j === idx ? { ...i, qty: i.qty + ev.qty } : i);
>  return { items: next };
>  }
>  case "Remove":
>  return { items: state.items.filter(i => i.sku !== ev.sku) };
>  }
> };
> ```
> 
> ---
> 
> ## Performance & pragmatism
> 
> - **Copying is cheap** for small to medium data; profile before micro-optimizing.
> - Use **structural sharing** (`{ ...obj, x }`, `[...arr, x]`) instead of mutation.
> - Avoid `Object.freeze` in hot paths—it’s slower.
> - If performance demands it, isolate a tiny imperative hotspot and keep the *surface* pure.
> 
> ---
> 
> ## When to reach for libraries
> 
> - **You can ship with just this primer.** For big projects, consider:
>  - `zod` for schema validation
>  - `fp-ts` for a batteries-included FP toolkit (Option/Either/TaskEither/ReadonlyArray, etc.)
>  - `effect` or `neverthrow` if you want structured effects or ergonomic `Result`
> 
> Be honest: libraries help, but they also lock you into idioms. Start tiny, add when it hurts.
> 
> ---
> 
> ## An end-to-end mini example
> 
> **Goal:** Parse lines of CSV *content* (no I/O), validate rows, aggregate totals.
> 
> ```ts
> // csv-core.ts
> import { Ok, Err, Result } from "./shared/fp";
> 
> export type Row = Readonly<{ sku: string; qty: number; price: number }>;
> 
> export const parseCsv = (s: string): ReadonlyArray<ReadonlyArray<string>> =>
>  s.split(/\r?\n/).filter(Boolean).map((line) => line.split(",").map((x) => x.trim()));
> 
> export const toRow = (cells: ReadonlyArray<string>): Result<string, Row> => {
>  if (cells.length !== 3) return Err("Expected 3 columns");
>  const [sku, qtyS, priceS] = cells;
>  const qty = Number(qtyS); const price = Number(priceS);
>  return Number.isFinite(qty) && Number.isFinite(price) && sku
>  ? Ok({ sku, qty, price })
>  : Err("Invalid number or missing sku");
> };
> 
> export const total = (rows: ReadonlyArray<Row>) =>
>  rows.reduce((acc, r) => acc + r.qty * r.price, 0);
> ```
> 
> **Ports & wiring (I/O at edge):**
> 
> ```ts
> // csv-main.ts
> import fs from "node:fs/promises";
> import { parseCsv, toRow, total } from "./csv-core";
> import { Result } from "./shared/fp";
> 
> const main = async (path: string) => {
>  const text = await fs.readFile(path, "utf8");
>  const results = parseCsv(text).map(toRow);
>  const errors = results.filter((r) => r._tag === "Err") as Result<string, never>[];
>  if (errors.length) {
>  console.error("Errors:", errors.map((e) => e.error));
>  process.exitCode = 1;
>  return;
>  }
>  const rows = results.map((r: any) => r.value);
>  console.log("Total =", total(rows));
> };
> 
> main(process.argv[2] ?? "in.csv");
> ```
> 
> **Test the pure bits with AVA:**
> 
> ```ts
> // test/csv-core.test.ts
> import test from "ava";
> import { parseCsv, toRow, total } from "../src/csv-core";
> 
> test("parseCsv splits lines/cells", (t) => {
>  t.deepEqual(parseCsv("a,b,c\n1,2,3"), [["a","b","c"],["1","2","3"]]);
> });
> 
> test("toRow validates cells", (t) => {
>  const ok = toRow(["sku1","2","3.5"]);
>  t.is(ok._tag, "Ok");
>  const err = toRow(["only","two"]);
>  t.is(err._tag, "Err");
> });
> 
> test("total multiplies qty * price", (t) => {
>  t.is(total([{ sku:"x", qty:2, price:3 }]), 6);
> });
> ```
> 
> ---
> 
> ## Pitfalls to avoid
> 
> - **Hidden effects in “helpers.”** If it logs, reads, or mutates, it’s not pure.
> - **Implicit time.** `Date.now()` inside core logic will wreck determinism. Pass `now` in.
> - **Shared mutable caches.** Prefer functional caches (memoize with explicit scope) or move caching to the adapter.
> - **Overengineering with monads.** If a `try { } catch { }` in the adapter is fine, do that. Keep the core small and typed.
> 
> ---
> 
> ## Minimal checklist for new modules
> 
> - [ ] Pure functions first; effects injected as parameters.
> - [ ] `readonly` everywhere feasible.
> - [ ] Types model reality (discriminated unions for states).
> - [ ] AVA tests for core logic (no I/O).
> - [ ] One adapter file per environment (Node, browser, test fakes).
> - [ ] `pipe` + small combinators over giant class hierarchies.
> 
> ---
> 
> ### Final word
> 
> Functional programming in TS isn’t about dogma. It’s about **predictability under change**. Keep the mathy stuff light, the boundaries clean, and the values flowing.
> 
> #typescript #functional-programming #primer #typescript-tips #immutability #composition #option #result #task #ports-and-adapters #zod #ava #testing #patterns #reducers #discriminated-unions #clean-architecture
<!-- UID: 983de53a-4dff-4949-9e9b-95d2f67fb110 -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:19 AM
> keep going
<!-- UID: 86a907e8-a989-4fec-9a0d-ed55985c60df -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:19 AM
> Alright, let’s turn the dial up. Same rules: practical first, no mysticism.
> 
> # Advanced FP in TypeScript — patterns that survive real projects
> 
> ## 1) Error taxonomy that doesn’t rot
> Stop passing strings around. Model **known** failures explicitly; keep an escape hatch for unknowns.
> 
> ```ts
> // errors.ts
> export type DomainError =
>  | { _tag: "NotFound"; entity: "User" | "Order"; id: string }
>  | { _tag: "Validation"; issues: readonly string[] }
>  | { _tag: "Conflict"; reason: string }
>  | { _tag: "External"; vendor: "Stripe" | "S3"; detail: string };
> 
> export const toHttp = (e: DomainError): { status: number; body: unknown } => {
>  switch (e._tag) {
>  case "NotFound": return { status: 404, body: e };
>  case "Validation": return { status: 400, body: e };
>  case "Conflict": return { status: 409, body: e };
>  case "External": return { status: 502, body: e };
>  }
> };
> ```
> 
> Pair this with `Result<DomainError, A>` and your controllers become trivial and consistent.
> 
> ---
> 
> ## 2) Retry/backoff as a pure policy + effectful runner
> Make policy pure, runner impure. Test the policy easily.
> 
> ```ts
> // retry.ts (pure)
> export type RetryPolicy = Readonly<{
>  maxAttempts: number;
>  baseMs: number; // exponential backoff base
>  jitter: (n: number) => number; // inject RNG for testability
> }>;
> 
> export const delays = (p: RetryPolicy): ReadonlyArray<number> =>
>  Array.from({ length: p.maxAttempts - 1 }, (_, i) =>
>  Math.round(p.baseMs * 2 ** i + p.jitter(i)),
>  );
> ```
> 
> ```ts
> // retry-runner.ts (impure, edge)
> export const runWithRetry = async <A>(
>  task: () => Promise<A>,
>  dlys: ReadonlyArray<number>,
>  shouldRetry: (e: unknown) => boolean,
> ): Promise<A> => {
>  let lastErr: unknown;
>  for (let i = 0; i <= dlys.length; i++) {
>  try { return await task(); }
>  catch (e) {
>  lastErr = e;
>  if (i === dlys.length || !shouldRetry(e)) break;
>  await new Promise((r) => setTimeout(r, dlys[i]));
>  }
>  }
>  throw lastErr;
> };
> ```
> 
> You can inject `shouldRetry` to only retry `External` errors and not `Validation`.
> 
> ---
> 
> ## 3) Cancellation + timeouts without tears
> Model **cancel tokens** or use `AbortSignal`. Keep your core **cancellable** by design.
> 
> ```ts
> export type CancellableTask<A> = (signal: AbortSignal) => Promise<A>;
> 
> export const withTimeout = <A>(ms: number, task: CancellableTask<A>): CancellableTask<A> =>
>  async (signal) => {
>  const controller = new AbortController();
>  const id = setTimeout(() => controller.abort(), ms);
>  try {
>  signal.addEventListener("abort", () => controller.abort(), { once: true });
>  return await task(controller.signal);
>  } finally {
>  clearTimeout(id);
>  }
>  };
> ```
> 
> Compose with `Promise.race` at the edge if needed; don’t hardcode timeouts inside your core.
> 
> ---
> 
> ## 4) Streaming as first-class: AsyncIterable pipelines
> When datasets are big, **don’t** slurp into memory. Use `AsyncIterable` like you’d use arrays.
> 
> ```ts
> // stream-ops.ts
> export const amap =
>  <A, B>(f: (a: A) => Promise<B>) =>
>  async function* (it: AsyncIterable<A>): AsyncIterable<B> {
>  for await (const a of it) yield await f(a);
>  };
> 
> export const afilter =
>  <A>(p: (a: A) => Promise<boolean>) =>
>  async function* (it: AsyncIterable<A>): AsyncIterable<A> {
>  for await (const a of it) if (await p(a)) yield a;
>  };
> 
> export const areduce =
>  <A, B>(zero: B, f: (b: B, a: A) => Promise<B>) =>
>  async (it: AsyncIterable<A>) => {
>  let acc = zero;
>  for await (const a of it) acc = await f(acc, a);
>  return acc;
>  };
> ```
> 
> Wire a file/HTTP source at the edge; keep the transforms pure.
> 
> ---
> 
> ## 5) Lenses (without a library)
> You don’t need a full optics lib for 80% of cases. Write small, typed **get/set** helpers.
> 
> ```ts
> // lens.ts
> export type Lens<S, A> = {
>  get: (s: S) => A;
>  set: (a: A) => (s: S) => S;
>  mod: (f: (a: A) => A) => (s: S) => S;
> };
> 
> export const lens = <S, A>(get: (s: S) => A, set: (s: S, a: A) => S): Lens<S, A> => ({
>  get,
>  set: (a) => (s) => set(s, a),
>  mod: (f) => (s) => set(s, f(get(s))),
> });
> 
> // Example
> type State = Readonly<{ user: Readonly<{ name: string; email: string }> }>;
> const userL = lens<State, State["user"]>(
>  (s) => s.user,
>  (s, user) => ({ ...s, user }),
> );
> const nameL = lens<State["user"], string>(
>  (u) => u.name,
>  (u, name) => ({ ...u, name }),
> );
> 
> // Compose manually:
> const setUserName = (name: string) => (s: State) => userL.set(nameL.set(name)(userL.get(s)))(s);
> ```
> 
> FP optics get heavy fast; only introduce a full optics lib after you feel the pain.
> 
> ---
> 
> ## 6) Domain modules: DTO ↔ domain mapping
> Keep wire formats out of your core. Transform DTOs at the boundary.
> 
> ```ts
> // order-dto.ts (adapter)
> import { z } from "zod";
> export const OrderDto = z.object({
>  id: z.string(),
>  qty: z.number().int().nonnegative(),
>  price_cents: z.number().int().nonnegative(),
> });
> export type OrderDto = z.infer<typeof OrderDto>;
> 
> // order.ts (domain)
> export type Money = Readonly<{ cents: number }>;
> export type Order = Readonly<{ id: string; qty: number; price: Money }>;
> 
> export const fromDto = (dto: OrderDto): Order =>
>  ({ id: dto.id, qty: dto.qty, price: { cents: dto.price_cents } } as const);
> 
> export const toDto = (o: Order): OrderDto =>
>  ({ id: o.id, qty: o.qty, price_cents: o.price.cents } as const);
> ```
> 
> Your core now works entirely with `Money`, not raw numbers.
> 
> ---
> 
> ## 7) Composition patterns you’ll reuse
> 
> ### `composeK` (compose functions returning `Result`)
> 
> ```ts
> import { Result, Ok, Err } from "./shared/fp";
> 
> export const composeK =
>  <E, A, B, C>(f: (a: A) => Result<E, B>, g: (b: B) => Result<E, C>) =>
>  (a: A): Result<E, C> => {
>  const r1 = f(a);
>  return r1._tag === "Ok" ? g(r1.value) : r1;
>  };
> ```
> 
> ### `TaskResult` (aka `TaskEither`) without a lib
> 
> ```ts
> export type TaskResult<E, A> = () => Promise<Result<E, A>>;
> 
> export const TR = {
>  of: <E, A>(a: A): TaskResult<E, A> => async () => Ok(a),
>  fromPromise:
>  <E, A>(thunk: () => Promise<A>, onErr: (e: unknown) => E): TaskResult<E, A> =>
>  async () => {
>  try { return Ok(await thunk()); }
>  catch (e) { return Err(onErr(e)); }
>  },
>  flatMap:
>  <E, A, B>(f: (a: A) => TaskResult<E, B>) =>
>  (ta: TaskResult<E, A>): TaskResult<E, B> =>
>  async () => {
>  const ra = await ta();
>  return ra._tag === "Ok" ? f(ra.value)() : ra;
>  },
> };
> ```
> 
> This gives you ergonomic, typed async error handling without `fp-ts`.
> 
> ---
> 
> ## 8) Property-based testing (AVA + fast-check)
> Unit tests catch regressions; **property tests** catch blind spots.
> 
> ```ts
> // test/total.prop.test.ts
> import test from "ava";
> import fc from "fast-check";
> import { total } from "../src/csv-core";
> 
> test("total is additive over concatenation", async (t) => {
>  await fc.assert(
>  fc.asyncProperty(
>  fc.array(fc.record({
>  sku: fc.string({ minLength: 1 }),
>  qty: fc.integer({ min: 0, max: 1000 }),
>  price: fc.integer({ min: 0, max: 10_000 }),
>  })),
>  fc.array(fc.record({
>  sku: fc.string({ minLength: 1 }),
>  qty: fc.integer({ min: 0, max: 1000 }),
>  price: fc.integer({ min: 0, max: 10_000 }),
>  })),
>  async (xs, ys) => {
>  const t1 = total(xs as any);
>  const t2 = total(ys as any);
>  const t3 = total([...xs, ...ys] as any);
>  t.is(t3, t1 + t2);
>  }
>  ),
>  { numRuns: 200 }
>  );
> });
> ```
> 
> ---
> 
> ## 9) Module layout that scales
> A pattern that keeps the FP boundaries visible:
> 
> ```
> src/
>  domain/
>  errors.ts # DomainError, error mappers
>  model/ # domain types (Money, Order, User, etc.)
>  services/ # pure services: price calc, validation, reducers
>  ports/
>  index.ts # Ports interface(s)
>  adapters/
>  node.fs.ts # read/write adapters
>  http.fetch.ts
>  time.node.ts
>  log.console.ts
>  app/
>  usecases/ # orchestration: TR/Task composition
>  http/ # controllers -> translate domain errors -> HTTP
>  shared/
>  fp.ts # pipe/Option/Result/Task/TaskResult
>  stream-ops.ts
>  lens.ts
> ```
> 
> **Rule of thumb:** `domain` never imports `adapters`. `adapters` can depend on anything.
> 
> ---
> 
> ## 10) Migration: from OOP/service classes to FP
> You don’t need to burn the house down. Replace internal methods with pure functions; keep the public API stable.
> 
> **Before:**
> 
> ```ts
> class CartService {
>  constructor(private repo: Repo) {}
>  async add(userId: string, sku: string, qty: number) {
>  const cart = await this.repo.load(userId);
>  cart.items.push({ sku, qty }); // mutation
>  await this.repo.save(userId, cart);
>  return cart;
>  }
> }
> ```
> 
> **After (same outward shape, pure core inside):**
> 
> ```ts
> // core (pure)
> type Cart = Readonly<{ items: ReadonlyArray<{ sku: string; qty: number }> }>;
> export const addItem = (sku: string, qty: number) => (c: Cart): Cart => {
>  const idx = c.items.findIndex(i => i.sku === sku);
>  return idx === -1
>  ? { items: [...c.items, { sku, qty }] }
>  : { items: c.items.map((i, j) => (j === idx ? { ...i, qty: i.qty + qty } : i)) };
> };
> 
> // adapter/service (impure)
> class CartService {
>  constructor(private repo: Repo) {}
>  async add(userId: string, sku: string, qty: number) {
>  const cart = await this.repo.load(userId);
>  const next = addItem(sku, qty)(cart);
>  await this.repo.save(userId, next);
>  return next;
>  }
> }
> ```
> 
> You get determinism and simpler tests immediately.
> 
> ---
> 
> ## 11) Telemetry without polluting core
> Pass a **logger** (or event sink) via ports; emit **structured** events.
> 
> ```ts
> // ports.ts
> export type LogLevel = "debug" | "info" | "warn" | "error";
> export type Logger = (level: LogLevel, msg: string, fields?: Record<string, unknown>) => void;
> 
> export type Ports = {
>  now: () => number;
>  log: Logger;
>  // ...
> };
> 
> // core.ts (pure-ish, only uses Ports)
> export const checkout = (ports: Ports) => (order: Order) => {
>  ports.log("info", "checkout.start", { orderId: order.id });
>  const total = computeTotal(order);
>  ports.log("debug", "checkout.total", { cents: total.cents });
>  return total;
> };
> ```
> 
> In tests, inject a no-op logger; in prod, send to stdout or OTLP.
> 
> ---
> 
> ## 12) Guardrails in `tsconfig`
> Your types enforce discipline; turn the screws:
> 
> ```json
> {
>  "compilerOptions": {
>  "strict": true,
>  "noUncheckedIndexedAccess": true,
>  "exactOptionalPropertyTypes": true,
>  "noImplicitOverride": true,
>  "noFallthroughCasesInSwitch": true,
>  "useUnknownInCatchVariables": true
>  }
> }
> ```
> 
> These catch a *ton* of state bugs before runtime.
> 
> ---
> 
> ## 13) Interop: if you must use `fp-ts`
> If the team already knows `fp-ts`, these correspondences map cleanly:
> 
> - `Option<A>` ↔ `O.Option<A>`
> - `Result<E,A>` ↔ `E.Either<E,A>`
> - `Task<A>` ↔ `T.Task<A>`
> - `TaskResult<E,A>` ↔ `TE.TaskEither<E,A>`
> 
> Keep your **domain** decoupled: export plain data and simple functions. Adapter layers can use heavy libs freely.
> 
> ---
> 
> ## 14) Concurrency patterns that won’t burn you
> 
> ### Bounded parallelism
> 
> ```ts
> export const parallelN = <A, B>(n: number, f: (a: A) => Promise<B>) =>
>  async (as: ReadonlyArray<A>): Promise<ReadonlyArray<B>> => {
>  const q = [...as];
>  const out: B[] = [];
>  const workers = Array.from({ length: n }, async () => {
>  while (q.length) {
>  const a = q.shift()!;
>  out.push(await f(a));
>  }
>  });
>  await Promise.all(workers);
>  return out;
>  };
> ```
> 
> ### Idempotent retry with dedupe key
> Keep a dedupe key in the effect layer to avoid double-charging/creating.
> 
> ---
> 
> ## 15) Minimal “hexagonal” HTTP controller
> Controller: translate HTTP ⇄ domain types. No business logic.
> 
> ```ts
> // app/http/orders.ts
> import type { FastifyInstance } from "fastify";
> import { OrderDto, Order } from "../../domain/order";
> import { toHttp } from "../../domain/errors";
> import { createOrder } from "../usecases/create-order"; // TaskResult<DomainError, Order>
> 
> export const register = (f: FastifyInstance) => {
>  f.post("/orders", async (req, res) => {
>  const p = OrderDto.safeParse(req.body);
>  if (!p.success) return res.status(400).send({ _tag: "Validation", issues: p.error.issues });
>  const task = createOrder(p.data); // returns TaskResult
>  const r = await task();
>  if (r._tag === "Err") {
>  const http = toHttp(r.error);
>  return res.status(http.status).send(http.body);
>  }
>  return res.status(201).send(r.value);
>  });
> };
> ```
> 
> You can replace Fastify with anything; usecase stays the same.
> 
> ---
> 
> ## 16) “Functional React” in one paragraph (if you’re doing UI)
> - Use **pure components**: props in → JSX out.
> - Keep state reducers **pure**; side-effects in `useEffect` with clear deps.
> - Normalize remote state as `RemoteData` union; render with exhaustive folds.
> - Derive view data with `useMemo` (pure transformations), not inline mutation.
> 
> ---
> 
> ## 17) Performance: when immutability bites
> - For large arrays, **batch** updates; avoid repeated `map` chains in hot loops—`pipe` once and keep functions small.
> - For giant maps/sets, consider **persistent data structures** (e.g., `immutable-js`) but keep them at the edges so you don’t infect your types everywhere.
> - Profile before “optimizing” away clarity. Most overhead is in I/O and serialization, not copying 20-element arrays.
> 
> ---
> 
> ## 18) A living checklist (pin this)
> 
> - [ ] **Effects at edges** (ports/adapters). Core stays pure.
> - [ ] **Error taxonomy** is explicit; HTTP mapping centralized.
> - [ ] **DTO mapping** at boundaries; domain uses strong types.
> - [ ] **`readonly`** defaults, discriminated unions for state.
> - [ ] **TaskResult** for async failures, no thrown exceptions in core.
> - [ ] **Tests**: unit + property-based for invariants.
> - [ ] **Telemetry** injected via ports; no `console.log` in core.
> - [ ] **Retries/Timeouts** are policies, not magic constants.
> - [ ] **Streaming** for big data; `AsyncIterable` transforms.
> - [ ] **tsconfig** strict mode guardrails on.
> 
> ---
> 
> ## Drop-in “starter kit” (files to copy)
> 
> - `shared/fp.ts` (pipe/Option/Result/Task/TaskResult)
> - `shared/stream-ops.ts` (async map/filter/reduce)
> - `shared/lens.ts` (tiny optics)
> - `domain/errors.ts` (taxonomy + http mapper)
> - `ports/index.ts` (Ports + Logger)
> - `adapters/*` (node/http/time/log)
> - `app/usecases/*` (TaskResult composition)
> - `app/http/*` (controllers)
> 
> That’s enough backbone to keep a real codebase honest for a long time.
> 
> ---
> 
> ## Where to go next
> - Add **circuit breakers** around flaky vendors (trip on consecutive `External` errors).
> - Introduce **command/query separation** in usecases (reads are pure; writes return events).
> - Emit **domain events** (pure) and handle them in an effectful **outbox** adapter for reliability.
> 
> If you want, we can take one of your active modules and refactor it to this shape—end-to-end—so you have a concrete template to follow next time.
> 
> #typescript #functional-programming #taskresult #ports-and-adapters #streams #asyn #retry #backoff #cancellation #lenses #dto #errors #ava #fast-check #immutability #hexagonal-architecture #clean-architecture #obsidian
<!-- UID: bfe636db-7264-4b95-80b6-8937470ea240 -->

---




>[!nexus_user] **User** - 09/02/2025 at 9:35 AM
> let's dive deep into the file s ystem
<!-- UID: d2b5fb2f-54df-469f-8c84-5347da316690 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:35 AM
> Got it. Let’s go **all-in on filesystems from a functional TypeScript** angle: safe, testable, fast. We’ll frame FS as **ports + pure core**, then nail the hard parts: atomic writes, streaming, locks, recursion, watching, crash recovery, and performance. No hand-waving.
> 
> ---
> 
> # Filesystem, the FP way (TypeScript)
> 
> ## 0) Ground rules
> 
> - **Core stays pure.** File I/O lives behind **Ports**.
> - **Deterministic orchestration.** Pass time, randomness, paths in.
> - **Recoverable by design.** Prefer append-only logs, temp files, and idempotency.
> 
> ```ts
> // ports/fs.ts
> export type FsPorts = {
>  readText: (absPath: string) => Promise<string>;
>  writeTextAtomic: (absPath: string, data: string) => Promise<void>;
>  readStream: (absPath: string) => NodeJS.ReadableStream; // never in core; orchestration only
>  listDir: (absDir: string) => Promise<ReadonlyArray<DirEntry>>;
>  stat: (absPath: string) => Promise<Stats>;
>  removeFile: (absPath: string) => Promise<void>;
>  rename: (from: string, to: string) => Promise<void>;
>  makeDirp: (absDir: string) => Promise<void>;
> };
> 
> export type DirEntry = Readonly<{ name: string; isFile: boolean; isDir: boolean; isSymlink: boolean }>;
> export type Stats = Readonly<{ size: number; mtimeMs: number; isFile: boolean; isDir: boolean; isSymlink: boolean }>;
> ```
> 
> Why: your “domain” (parsing, indexing, etc.) should never know **how** bytes moved.
> 
> ---
> 
> ## 1) Paths & sandboxing (prevent traversal)
> 
> Never trust user paths. Resolve into a **sandbox root** and reject anything that climbs out.
> 
> ```ts
> // adapters/path-sandbox.ts
> import path from "node:path";
> 
> export const inSandbox = (root: string, p: string): string => {
>  const abs = path.resolve(root, p);
>  if (!abs.startsWith(path.resolve(root) + path.sep)) {
>  throw new Error(`Path escapes sandbox: ${p}`);
>  }
>  return abs;
> };
> ```
> 
> Use it **before** touching disk. Also normalize case sensitivity assumptions (Windows is case-insensitive; avoid equality checks by name unless you normalize).
> 
> ---
> 
> ## 2) Atomic writes that actually survive crashes
> 
> **Recipe:** write to a temp file in the same dir → `fsync` temp → `rename` to target → optional `fsync` parent dir (Linux).
> 
> ```ts
> // adapters/node-fs.ts
> import fs from "node:fs/promises";
> import nodeFs from "node:fs";
> import path from "node:path";
> import { FsPorts } from "../ports/fs";
> 
> const fsyncDir = async (dir: string) => {
>  // Optional but safest on Linux: ensure directory entry is persisted
>  const fd = await fs.open(dir, "r");
>  try { await fd.sync(); } finally { await fd.close(); }
> };
> 
> export const nodeFsPorts: FsPorts = {
>  async readText(p) { return fs.readFile(p, "utf8"); },
> 
>  async writeTextAtomic(p, data) {
>  const dir = path.dirname(p);
>  const base = path.basename(p);
>  const tmp = path.join(dir, `.${base}.${process.pid}.${Date.now()}.tmp`);
>  await fs.mkdir(dir, { recursive: true });
>  const fh = await fs.open(tmp, "w", 0o600);
>  try {
>  await fh.writeFile(data, "utf8");
>  await fh.sync(); // flush file data
>  } finally {
>  await fh.close();
>  }
>  await fs.rename(tmp, p); // POSIX rename is atomic within same filesystem/dir
>  // Best-effort directory fsync (Linux ext4, XFS). No-op on Windows/mac in practice.
>  try { await fsyncDir(dir); } catch {}
>  },
> 
>  readStream(p) { return nodeFs.createReadStream(p); },
> 
>  async listDir(absDir) {
>  const dirents = await fs.readdir(absDir, { withFileTypes: true });
>  return dirents.map(d => ({ name: d.name, isFile: d.isFile(), isDir: d.isDirectory(), isSymlink: d.isSymbolicLink() }));
>  },
> 
>  async stat(p) {
>  const s = await fs.lstat(p);
>  return { size: Number(s.size), mtimeMs: s.mtimeMs, isFile: s.isFile(), isDir: s.isDirectory(), isSymlink: s.isSymbolicLink() };
>  },
> 
>  async removeFile(p) { await fs.unlink(p).catch(() => {}); },
> 
>  async rename(a, b) { await fs.rename(a, b); },
> 
>  async makeDirp(d) { await fs.mkdir(d, { recursive: true }); },
> };
> ```
> 
> **Why rename?** If your process dies mid-write, the old file stays valid. On completion, readers either see the old or new version, never half-written bytes.
> 
> ---
> 
> ## 3) JSON safely (no throws in core)
> 
> ```ts
> // core/json.ts (pure)
> import { Ok, Err, Result } from "../shared/fp";
> 
> export const parseJson = <A>(s: string): Result<string, A> => {
>  try { return Ok(JSON.parse(s) as A); }
>  catch (e) { return Err(`Invalid JSON: ${(e as Error).message}`); }
> };
> 
> export const stringifyJson = (x: unknown): string =>
>  JSON.stringify(x, null, 2);
> ```
> 
> Use `Result`—**never** let JSON errors explode through your core.
> 
> ---
> 
> ## 4) Directory walking as AsyncIterable (stack-safe, sym)
> 
> ```ts
> // app/walk.ts
> import path from "node:path";
> import type { FsPorts } from "../ports/fs";
> 
> export type WalkOptions = Readonly<{
>  followSym?: boolean; // default false to avoid cycles
>  match?: (absPath: string) => boolean; // filter by path
> }>;
> 
> export async function* walk(fs: FsPorts, root: string, opts: WalkOptions = {}): AsyncIterable<string> {
>  const follow = opts.followSym ?? false;
>  const q: string[] = [root];
>  const seen = new Set<string>(); // inode-based detection would need extra stats; path-based best-effort
> 
>  while (q.length) {
>  const dir = q.pop()!;
>  const entries = await fs.listDir(dir);
>  for (const e of entries) {
>  const abs = path.join(dir, e.name);
>  if (e.isFile) {
>  if (!opts.match || opts.match(abs)) yield abs;
>  } else if (e.isDir) {
>  q.push(abs);
>  } else if (e.isSymlink && follow) {
>  if (!seen.has(abs)) { seen.add(abs); q.push(abs); }
>  }
>  }
>  }
> }
> ```
> 
> **Why iterable?** Works for huge trees without eating RAM.
> 
> ---
> 
> ## 5) File reading at scale: line iterator, chunking, backpressure
> 
> ```ts
> // app/streams.ts
> import readline from "node:readline";
> import type { FsPorts } from "../ports/fs";
> 
> export async function* readLines(fs: FsPorts, absPath: string): AsyncIterable<string> {
>  const stream = fs.readStream(absPath);
>  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
>  for await (const line of rl) yield line as string;
> }
> ```
> 
> Consume with `for await` to naturally respect backpressure.
> 
> ---
> 
> ## 6) Content-addressed storage (dedupe + integrity)
> 
> Use **hash(file) → path**; write atomically; skip if exists.
> 
> ```ts
> // app/cas.ts
> import crypto from "node:crypto";
> import path from "node:path";
> import type { FsPorts } from "../ports/fs";
> 
> export const sha256 = (buf: Buffer | string) =>
>  crypto.createHash("sha256").update(buf).digest("hex");
> 
> export const casPath = (storeDir: string, digest: string) =>
>  path.join(storeDir, digest.slice(0, 2), digest.slice(2));
> 
> export const putBlob = (fs: FsPorts, storeDir: string) => async (data: string | Buffer) => {
>  const digest = sha256(typeof data === "string" ? Buffer.from(data) : data);
>  const dest = casPath(storeDir, digest);
>  await fs.makeDirp(path.dirname(dest));
>  // Idempotent: skip if file exists
>  try { await fs.stat(dest); return { digest, path: dest } as const; } catch {}
>  await fs.writeTextAtomic(dest, typeof data === "string" ? data : data.toString("binary"));
>  return { digest, path: dest } as const;
> };
> ```
> 
> **Bonus:** validate on read by re-hashing bytes; reject if mismatch.
> 
> ---
> 
> ## 7) Append-only log + crash-safe rotation (WAL-style)
> 
> Great for durable queues and recovery.
> 
> ```ts
> // app/aol.ts
> import path from "node:path";
> import type { FsPorts } from "../ports/fs";
> 
> export type AppendOnlyLog = {
>  append: (record: string) => Promise<void>;
>  readAll: () => AsyncIterable<string>;
>  rotateIf: (maxBytes: number) => Promise<void>;
> };
> 
> export const aol = (fs: FsPorts, dir: string, file = "log.txt"): AppendOnlyLog => {
>  const abs = path.join(dir, file);
> 
>  const append = async (record: string) => {
>  // use atomic append pattern: read -> concat -> atomic write (simple) or fs.appendFile then fsync (more precise)
>  // Simpler & safe with rename: not strictly "append", but atomic snapshot growth.
>  let prev = "";
>  try { prev = await fs.readText(abs); } catch {}
>  await fs.writeTextAtomic(abs, prev + record + "\n");
>  };
> 
>  const readAll = async function* () {
>  try {
>  const text = await fs.readText(abs);
>  for (const line of text.split(/\r?\n/)) if (line) yield line;
>  } catch {}
>  };
> 
>  const rotateIf = async (maxBytes: number) => {
>  try {
>  const s = await fs.stat(abs);
>  if (s.size < maxBytes) return;
>  const rotated = path.join(dir, `log.${Date.now()}.txt`);
>  await fs.rename(abs, rotated); // atomic cutover
>  // new log will be (re)created on next append
>  } catch {}
>  };
> 
>  return { append, readAll, rotateIf };
> };
> ```
> 
> If you need strict append semantics (`fs.appendFile` + `fsync`), put it behind the port and provide a Linux-only adapter.
> 
> ---
> 
> ## 8) File locks (coarse, portable enough)
> 
> Use “**lock file** with O_EXCL**” semantics via `fs.open` fail-fast. Not bulletproof across NFS, but good on local disks.
> 
> ```ts
> // app/lock.ts
> import fs from "node:fs/promises";
> import path from "node:path";
> 
> export const withFileLock = async <A>(lockDir: string, name: string, f: () => Promise<A>): Promise<A> => {
>  await fs.mkdir(lockDir, { recursive: true });
>  const lockPath = path.join(lockDir, `${name}.lock`);
>  const handle = await fs.open(lockPath, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY)
>  .catch(() => { throw new Error(`Lock in use: ${name}`); });
>  try {
>  await handle.writeFile(String(process.pid));
>  await handle.sync();
>  return await f();
>  } finally {
>  await handle.close().catch(() => {});
>  await fs.unlink(lockPath).catch(() => {}); // tolerate crashes/leaks
>  }
> };
> ```
> 
> If two processes race, only one gets the lock. Release on finally; tolerate stale lock files by checking `pid` if you want.
> 
> ---
> 
> ## 9) Watching files sanely (coalesce noisy events)
> 
> `fs.watch` is cross-platform but noisy. Use **AbortSignal**, debounce, and re-stat.
> 
> ```ts
> // app/watch.ts
> import fs from "node:fs";
> import path from "node:path";
> import { setTimeout as sleep } from "node:timers/promises";
> 
> export type WatchEvent = Readonly<{ kind: "created" | "changed" | "deleted"; absPath: string }>;
> 
> export const watchDir = async function* (
>  absDir: string,
>  signal?: AbortSignal,
> ): AsyncIterable<WatchEvent> {
>  const watcher = fs.watch(absDir, { persistent: false, recursive: false });
>  const queue: string[] = [];
>  const on = (ev: string, filename?: string) => { if (filename) queue.push(path.join(absDir, filename)); };
>  watcher.on("change", on);
>  watcher.on("rename", on);
> 
>  try {
>  while (!signal?.aborted) {
>  // debounce & coalesce a bit
>  await sleep(50);
>  while (queue.length) {
>  const file = queue.shift()!;
>  let kind: WatchEvent["kind"] = "changed";
>  try {
>  await fs.promises.access(file, fs.constants.F_OK);
>  // If recently created, your logic can mark 'created'; else 'changed'
>  } catch {
>  kind = "deleted";
>  }
>  yield { kind, absPath: file };
>  }
>  }
>  } finally {
>  watcher.close();
>  }
> };
> ```
> 
> For massive trees, watch **top-level dirs** and re-scan subtrees selectively.
> 
> ---
> 
> ## 10) High-volume performance tricks (when profiling says “do it”)
> 
> - **`readdir({ withFileTypes: true })`** avoids extra stats.
> - **Batch stats** with `Promise.allSettled`.
> - **Stream** large files; avoid `readFile` on GB-sized blobs.
> - **Compression**: offload gzip/deflate to **streams** (`zlib.createGzip()`), not post-hoc buffers.
> - **Use `Buffer` pooling`** only if profiling shows alloc pressure.
> - **Avoid `Object.freeze`** in hot loops; prefer local immutability via copies.
> - **Cross-device renames** fail—keep temp file in **same dir** as destination (we did).
> 
> ---
> 
> ## 11) Secure by default
> 
> - **Reject sym** unless you explicitly follow them (avoid link tricks escaping sandbox).
> - **No user-controlled absolute paths**—resolve inside sandbox.
> - **Set perms** (e.g., `0o600` for secrets). Don’t rely on umask defaults.
> - **Validate content** (e.g., schema for JSON) before making it authoritative.
> - **Path canonicalization**: always `path.resolve` → compare to sandbox root.
> 
> ---
> 
> ## 12) End-to-end example: “Index markdown files to JSON cache”
> 
> **Goal:** walk a sandboxed `docs/`, parse front-matter, hash content, write an atomic JSON index.
> 
> ```ts
> // core/indexer.ts (pure core)
> import { Result, Ok, Err } from "../shared/fp";
> 
> export type Doc = Readonly<{ path: string; title: string; tags: readonly string[]; hash: string }>;
> 
> const parseFrontMatter = (src: string): Result<string, { title: string; tags: string[]; body: string }> => {
>  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/m.exec(src);
>  if (!m) return Err("Missing frontmatter");
>  const body = m[2];
>  const meta: Record<string, unknown> = Object.fromEntries(
>  m[1].split(/\r?\n/).map(line => {
>  const i = line.indexOf(":");
>  return i === -1 ? [line.trim(), ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
>  })
>  );
>  const title = String(meta["title"] ?? "").trim();
>  const tags = String(meta["tags"] ?? "").split(",").map(s => s.trim()).filter(Boolean);
>  if (!title) return Err("title required");
>  return Ok({ title, tags, body });
> };
> 
> export const toDoc = (absPath: string, hash: string, content: string): Result<string, Doc> => {
>  const r = parseFrontMatter(content);
>  if (r._tag === "Err") return r;
>  return Ok({ path: absPath, title: r.value.title, tags: r.value.tags, hash });
> };
> ```
> 
> ```ts
> // app/build-index.ts (orchestration: effects + pure core)
> import path from "node:path";
> import crypto from "node:crypto";
> import { nodeFsPorts as FS } from "../adapters/node-fs";
> import { inSandbox } from "../adapters/path-sandbox";
> import { walk } from "./walk";
> import { toDoc } from "../core/indexer";
> import { stringifyJson } from "../core/json";
> 
> const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
> 
> export const buildIndex = async (root: string, outRel = "index.json") => {
>  const rootAbs = path.resolve(root);
>  const docs: any[] = [];
>  for await (const abs of walk(FS, rootAbs, { match: p => p.endsWith(".md") })) {
>  const text = await FS.readText(abs).catch(() => "");
>  const docR = toDoc(abs, sha256(text), text);
>  if (docR._tag === "Ok") docs.push(docR.value);
>  }
>  const output = stringifyJson({ docs });
>  const outPath = inSandbox(rootAbs, outRel);
>  await FS.writeTextAtomic(outPath, output);
>  return outPath;
> };
> 
> // run if called directly
> if (process.argv[1] && process.argv[1].endsWith("build-index.ts")) {
>  const root = process.argv[2] ?? "docs";
>  buildIndex(root).then(p => console.log("Wrote", p)).catch(e => {
>  console.error(e); process.exitCode = 1;
>  });
> }
> ```
> 
> **Crash-safe:** each write to `index.json` is atomic, readers never see half JSON.
> 
> ---
> 
> ## 13) Testing FS without flaky I/O (AVA)
> 
> Use a real temp dir (fast, reliable), keep tests hermetic.
> 
> ```ts
> // test/build-index.test.ts
> import test from "ava";
> import os from "node:os";
> import fs from "node:fs/promises";
> import path from "node:path";
> import { buildIndex } from "../src/app/build-index";
> 
> const tmp = async () => await fs.mkdtemp(path.join(os.tmpdir(), "fs-idx-"));
> 
> test("buildIndex writes atomic index.json with parsed docs", async (t) => {
>  const dir = await tmp();
>  await fs.mkdir(path.join(dir, "docs"), { recursive: true });
>  await fs.writeFile(path.join(dir, "docs", "a.md"),
> `---
> title: Hello
> tags: demo, test
> ---
> # A
> `, "utf8");
>  const out = await buildIndex(path.join(dir, "docs"), "index.json");
>  t.true(out.endsWith("index.json"));
>  const text = await fs.readFile(path.join(dir, "docs", "index.json"), "utf8");
>  const obj = JSON.parse(text);
>  t.is(obj.docs.length, 1);
>  t.is(obj.docs[0].title, "Hello");
> });
> ```
> 
> No mocking circus. Temp dirs + atomic writes = stable tests.
> 
> ---
> 
> ## 14) Concurrency: bounded walkers & writers
> 
> When processing thousands of files, cap concurrency.
> 
> ```ts
> // app/parallel.ts
> export const parallelN = <A, B>(n: number, f: (a: A) => Promise<B>) =>
>  async (items: ReadonlyArray<A>) => {
>  const q = [...items];
>  const out: B[] = [];
>  const workers = Array.from({ length: n }, async () => {
>  while (q.length) out.push(await f(q.pop()!));
>  });
>  await Promise.all(workers);
>  return out as ReadonlyArray<B>;
>  };
> ```
> 
> Integrate with `walk`: collect paths first (bounded), or create a worker pool consuming an async queue if directories are enormous.
> 
> ---
> 
> ## 15) Migration pattern (imperative → FP)
> 
> - Wrap existing `fs.*` calls inside an adapter (like `nodeFsPorts`).
> - Replace direct I/O in modules with **ports injected**.
> - Move transformations (parsing, selecting, mapping) into pure functions.
> - Replace “update file in place” with **rewrite to temp + rename**.
> - Centralize error classification (`ENOENT` → `NotFound`, etc.) at the adapter boundary.
> 
> ---
> 
> ## 16) Common pitfalls (don’t step on these)
> 
> - **Cross-device rename**: writing temp on `/tmp` then renaming to another mount → `EXDEV`. Temp **must live in the same dir** as dest (we do).
> - **fs.watch reliability**: events drop under load; always verify state with `stat` or a **rescan**.
> - **Symlink shenanigans**: keep sandbox; don’t follow sym unless required.
> - **Partial writes**: `writeFile` can succeed but OS crash loses directory entry—hence `fsync` + `rename` + (optionally) `fsync` dir.
> - **Windows path limits**: avoid absurdly deep trees; use `path` APIs, never hardcode separators.
> - **Encoding**: always specify `"utf8"`; never rely on platform default.
> 
> ---
> 
> ## 17) Where this gets you
> 
> - Deterministic builds, indexes, and caches.
> - Safe concurrent writers with coarse lock files.
> - Streamed readers for arbitrarily big inputs.
> - Crash-safe artifacts with atomicity guarantees.
> - Testable logic isolated from I/O weirdness.
> 
> If you want, point me at one FS-heavy module in your repo and I’ll refactor it into **ports + atomic ops + streams**, then wire AVA tests around it.
> 
> #filesystem #typescript #functional-programming #atomic-writes #asyn #streams #locks #watchers #sandbox #content-addressed #append-only-log #reliability #ava #testing #performance #clean-architecture
<!-- UID: f10da9cf-1657-45ca-853f-ec6b7792bcab -->

---




>[!nexus_user] **User** - 09/02/2025 at 9:43 AM
> functional ava testing utilities
<!-- UID: 857d782e-57f6-4313-8712-884f7b992d83 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:43 AM
> Alright Err — here’s a tight **FP-style AVA testkit** you can drop into a repo and actually use. Zero mocking frameworks, just **ports, fakes, and pure helpers**. It’s split into small modules so you can import only what you need.
> 
> > Structure (suggested)
> ```
> testkit/
>  result.ts # Result/Option test helpers
>  time.ts # fake clocks + time control
>  rng.ts # deterministic PRNG
>  fs.ts # temp dirs + golden files
>  http.ts # minimal fake HTTP port
>  spying.ts # structured log capture / call recording
>  async.ts # eventually(), withTimeout(), parallelN()
>  property.ts # fast-check glue
> ```
> 
> ---
> 
> # `testkit/result.ts` — ergonomic assertions for FP types
> 
> ```ts
> // testkit/result.ts
> import test from "ava";
> 
> export type Result<E, A> = { _tag: "Ok"; value: A } | { _tag: "Err"; error: E };
> export const Ok = <A>(value: A): Result<never, A> => ({ _tag: "Ok", value });
> export const Err = <E>(error: E): Result<E, never> => ({ _tag: "Err", error });
> 
> export const expectOk = <E, A>(t: test.ExecutionContext, r: Result<E, A>, msg?: string): A => {
>  t.truthy(r, msg ?? "expected Result");
>  t.is(r._tag, "Ok", msg ?? `expected Ok, got ${r._tag}`);
>  // @ts-expect-error narrowed above
>  return r.value as A;
> };
> 
> export const expectErr = <E, A>(t: test.ExecutionContext, r: Result<E, A>, msg?: string): E => {
>  t.truthy(r, msg ?? "expected Result");
>  t.is(r._tag, "Err", msg ?? `expected Err, got ${r._tag}`);
>  // @ts-expect-error narrowed above
>  return r.error as E;
> };
> 
> export type Option<A> = { _tag: "Some"; value: A } | { _tag: "None" };
> export const Some = <A>(value: A): Option<A> => ({ _tag: "Some", value });
> export const None: Option<never> = { _tag: "None" };
> 
> export const expectSome = <A>(t: test.ExecutionContext, o: Option<A>, msg?: string): A => {
>  t.is(o._tag, "Some", msg ?? `expected Some, got ${o._tag}`);
>  // @ts-expect-error narrowed above
>  return o.value as A;
> };
> export const expectNone = <A>(t: test.ExecutionContext, o: Option<A>, msg?: string) => {
>  t.is(o._tag, "None", msg ?? `expected None, got ${o._tag}`);
> };
> 
> export const exhaustive = (x: never): never => {
>  throw new Error(`Non-exhaustive match: ${String(x)}`);
> };
> ```
> 
> **Use it**
> ```ts
> import test from "ava";
> import { Ok, Err, expectOk, expectErr } from "../testkit/result";
> 
> test("parseUser returns Ok", t => {
>  const r = Ok({ id: "u1" });
>  const u = expectOk(t, r);
>  t.is(u.id, "u1");
> });
> 
> test("validate returns Err", t => {
>  const r = Err({ _tag: "Validation", issues: ["email"] });
>  const e = expectErr(t, r);
>  t.deepEqual(e.issues, ["email"]);
> });
> ```
> 
> ---
> 
> # `testkit/time.ts` — deterministic time
> 
> ```ts
> // testkit/time.ts
> export type FakeClock = {
>  now: () => number;
>  advanceMs: (ms: number) => void;
>  reset: (epochMs?: number) => void;
> };
> 
> export const fakeClock = (epochMs = 1_600_000_000_000): FakeClock => {
>  let t = epochMs;
>  return {
>  now: () => t,
>  advanceMs: (ms) => { t += ms; },
>  reset: (ms = epochMs) => { t = ms; },
>  };
> };
> ```
> 
> **Pattern:** your core accepts `now: () => number`. In tests, inject `fakeClock.now` and move time with `advanceMs`.
> 
> ---
> 
> # `testkit/rng.ts` — repeatable randomness
> 
> ```ts
> // testkit/rng.ts
> export type RNG = () => number;
> 
> export const mulberry32 = (seed: number): RNG => {
>  let a = seed >>> 0;
>  return () => {
>  a = (a + 0x6D2B79F5) >>> 0;
>  let t = Math.imul(a ^ (a >>> 15), 1 | a);
>  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
>  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
>  };
> };
> 
> export const fakeJitter = (rng: RNG) => (_i: number) => Math.floor(rng() * 10); // e.g., for backoff tests
> ```
> 
> ---
> 
> # `testkit/fs.ts` — temp dirs & golden files (atomic)
> 
> ```ts
> // testkit/fs.ts
> import os from "node:os";
> import path from "node:path";
> import fs from "node:fs/promises";
> import crypto from "node:crypto";
> 
> export const mktempdir = async (prefix = "ava-fp-") =>
>  fs.mkdtemp(path.join(os.tmpdir(), prefix));
> 
> export const writeAtomic = async (absPath: string, data: string | Buffer) => {
>  const dir = path.dirname(absPath);
>  const base = path.basename(absPath);
>  const tmp = path.join(dir, `.${base}.${process.pid}.${Date.now()}.tmp`);
>  await fs.mkdir(dir, { recursive: true });
>  await fs.writeFile(tmp, data);
>  await fs.rename(tmp, absPath);
> };
> 
> export const goldenAssert = async (absPath: string, content: string, { update = false } = {}) => {
>  if (update) return writeAtomic(absPath, content);
>  const existing = await fs.readFile(absPath, "utf8").catch(() => "");
>  if (existing !== content) {
>  const diff = diffSummary(existing, content);
>  throw new Error(`Golden mismatch for ${absPath}\n${diff}`);
>  }
> };
> 
> const diffSummary = (a: string, b: string) => {
>  const ha = crypto.createHash("sha1").update(a).digest("hex");
>  const hb = crypto.createHash("sha1").update(b).digest("hex");
>  return `sha1 old=${ha} new=${hb}\n--- OLD\n${a}\n--- NEW\n${b}`;
> };
> ```
> 
> **Use it**
> ```ts
> import test from "ava";
> import path from "node:path";
> import { mktempdir, goldenAssert } from "../testkit/fs";
> 
> test("renders stable output", async t => {
>  const dir = await mktempdir();
>  const out = "hello\n";
>  await goldenAssert(path.join(dir, "out.txt"), out, { update: true }); // first run
>  await t.notThrowsAsync(() => goldenAssert(path.join(dir, "out.txt"), out));
> });
> ```
> 
> ---
> 
> # `testkit/http.ts` — HTTP “port” fake (no nock)
> 
> ```ts
> // testkit/http.ts
> export type HttpRequest = Readonly<{ method: "GET"|"POST"|"PUT"|"DELETE"; url: string; body?: unknown }>;
> export type HttpResponse = Readonly<{ status: number; json?: unknown; text?: string }>;
> export type HttpPort = (req: HttpRequest) => Promise<HttpResponse>;
> 
> export const httpRouter = (routes: Record<string, (req: HttpRequest) => Promise<HttpResponse>>): HttpPort =>
>  async (req) => {
>  const key = `${req.method} ${req.url}`;
>  const handler = routes[key];
>  if (!handler) return { status: 404, json: { error: "not found" } };
>  return handler(req);
>  };
> 
> export const httpCapture = (base: HttpPort) => {
>  const calls: HttpRequest[] = [];
>  const port: HttpPort = async (req) => {
>  calls.push(req);
>  return base(req);
>  };
>  return { port, calls };
> };
> ```
> 
> Use this in your adapters: your core/usecases should depend on `HttpPort`, not global `fetch`.
> 
> ---
> 
> # `testkit/spying.ts` — structured logs/calls
> 
> ```ts
> // testkit/spying.ts
> export type LogLevel = "debug" | "info" | "warn" | "error";
> export type LogEvent = Readonly<{ level: LogLevel; msg: string; fields?: Record<string, unknown> }>;
> export type Logger = (level: LogLevel, msg: string, fields?: Record<string, unknown>) => void;
> 
> export const captureLogger = () => {
>  const events: LogEvent[] = [];
>  const log: Logger = (level, msg, fields) => { events.push({ level, msg, fields }); };
>  const find = (substr: string) => events.filter(e => e.msg.includes(substr));
>  return { log, events, find };
> };
> 
> export const callsOf = <Args extends any[], Ret>(
>  fn: (...args: Args) => Ret,
> ) => {
>  const calls: Args[] = [];
>  const spy = (...args: Args): Ret => {
>  calls.push(args);
>  // @ts-expect-error opaque ret; provide your own behavior by wrapping a base fn if needed
>  return undefined;
>  };
>  return { spy, calls };
> };
> ```
> 
> ---
> 
> # `testkit/async.ts` — eventually, withTimeout, parallelN
> 
> ```ts
> // testkit/async.ts
> export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
> 
> export const withTimeout = async <A>(ms: number, thunk: () => Promise<A>): Promise<A> => {
>  let timer: any;
>  const timeout = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error(`Timeout ${ms}ms`)), ms); });
>  try {
>  return await Promise.race([thunk(), timeout]);
>  } finally {
>  clearTimeout(timer);
>  }
> };
> 
> export const eventually = async (assertion: () => Promise<void> | void, opts: { timeoutMs?: number; intervalMs?: number } = {}) => {
>  const deadline = Date.now() + (opts.timeoutMs ?? 1500);
>  const interval = opts.intervalMs ?? 25;
>  let lastErr: unknown;
>  while (Date.now() < deadline) {
>  try { await assertion(); return; }
>  catch (e) { lastErr = e; await sleep(interval); }
>  }
>  throw lastErr ?? new Error("eventually: assertion never passed");
> };
> 
> export const parallelN = <A, B>(n: number, f: (a: A) => Promise<B>) =>
>  async (items: ReadonlyArray<A>): Promise<ReadonlyArray<B>> => {
>  const q = [...items];
>  const out: B[] = [];
>  const workers = Array.from({ length: Math.max(1, n) }, async () => {
>  while (q.length) out.push(await f(q.pop()!));
>  });
>  await Promise.all(workers);
>  return out;
>  };
> ```
> 
> ---
> 
> # `testkit/property.ts` — fast-check glue for AVA
> 
> ```ts
> // testkit/property.ts
> import fc, { Arbitrary } from "fast-check";
> import test from "ava";
> 
> export const check = async (t: test.ExecutionContext, prop: fc.IProperty<unknown>, runs = 200) => {
>  await fc.assert(prop, { numRuns: runs });
>  t.pass();
> };
> 
> export const arbNonEmptyString: Arbitrary<string> =
>  fc.string({ minLength: 1, maxLength: 64 }).filter(s => s.trim().length > 0);
> ```
> 
> **Use it**
> ```ts
> import test from "ava";
> import fc from "fast-check";
> import { check, arbNonEmptyString } from "../testkit/property";
> import { total } from "../src/core/price";
> 
> test("total is additive", async t => {
>  await check(
>  t,
>  fc.property(
>  fc.array(fc.nat(1000)), fc.array(fc.nat(1000)),
>  (xs, ys) => {
>  const sum = (as: number[]) => as.reduce((a,b) => a + b, 0);
>  return sum(xs.concat(ys)) === sum(xs) + sum(ys);
>  }
>  )
>  );
> });
> ```
> 
> ---
> 
> ## Example: testing a retry policy with fake clock + rng
> 
> ```ts
> import test from "ava";
> import { fakeClock } from "../testkit/time";
> import { mulberry32, fakeJitter } from "../testkit/rng";
> 
> // Pure policy
> type Policy = { maxAttempts: number; baseMs: number; jitter: (i:number)=>number };
> const delays = (p: Policy) => Array.from({ length: p.maxAttempts - 1 }, (_, i) => p.baseMs * (2 ** i) + p.jitter(i));
> 
> test("delays are exponential with jitter", t => {
>  const clock = fakeClock(); // not used here, just showing composition
>  const rng = mulberry32(42);
>  const p: Policy = { maxAttempts: 4, baseMs: 50, jitter: fakeJitter(rng) };
>  t.deepEqual(delays(p).length, 3);
>  const ds = delays(p);
>  t.true(ds[1] > ds[0]);
>  t.true(ds[2] > ds[1]);
> });
> ```
> 
> ---
> 
> ## Example: end-to-end with ports (no global FS/fetch)
> 
> Imagine your usecase:
> 
> ```ts
> // src/ports.ts
> export type Ports = {
>  now: () => number;
>  http: (req: { method: "GET"; url: string }) => Promise<{ status: number; json?: unknown }>;
>  log: (lvl: "info"|"error", msg: string, fields?: Record<string, unknown>) => void;
> };
> ```
> 
> **Test it:**
> 
> ```ts
> import test from "ava";
> import { fakeClock } from "../testkit/time";
> import { httpRouter, httpCapture } from "../testkit/http";
> import { captureLogger } from "../testkit/spying";
> 
> // usecase under test
> const fetchUser = (P: Ports) => async (id: string) => {
>  P.log("info", "fetchUser.start", { id, at: P.now() });
>  const res = await P.http({ method: "GET", url: `/users/${id}` });
>  if (res.status !== 200 || !res.json) throw new Error("bad status");
>  return res.json as { id: string; name: string };
> };
> 
> test("fetchUser logs and returns json", async t => {
>  const clock = fakeClock(1000);
>  const router = httpRouter({
>  "GET /users/u1": async () => ({ status: 200, json: { id: "u1", name: "Alice" } })
>  });
>  const { port: http, calls } = httpCapture(router);
>  const { log, events } = captureLogger();
> 
>  const user = await fetchUser({ now: clock.now, http, log })("u1");
> 
>  t.deepEqual(user, { id: "u1", name: "Alice" });
>  t.true(events.some(e => e.msg === "fetchUser.start" && e.fields?.id === "u1"));
>  t.is(calls.length, 1);
>  t.is(calls[0].url, "/users/u1");
> });
> ```
> 
> No global stubs. No network. All deterministic.
> 
> ---
> 
> ## AVA config reminder (ESM + TS)
> 
> ```json
> // package.json
> {
>  "type": "module",
>  "devDependencies": {
>  "ava": "^6",
>  "typescript": "^5.6.2",
>  "ts-node": "^10.9.2",
>  "fast-check": "^3.18.0"
>  },
>  "ava": {
>  "extensions": { "ts": "module" },
>  "nodeArguments": ["--loader=ts-node/esm"]
>  }
> }
> ```
> 
> ```json
> // tsconfig.json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "ESNext",
>  "moduleResolution": "Bundler",
>  "strict": true,
>  "noUncheckedIndexedAccess": true,
>  "exactOptionalPropertyTypes": true,
>  "verbatimModuleSyntax": true,
>  "resolveJsonModule": true,
>  "skipLibCheck": true
>  }
> }
> ```
> 
> ---
> 
> ## Testing playbook (how to use this well)
> 
> - **Prefer ports over mocks.** Define tiny interfaces and inject fakes from `testkit/*`.
> - **Golden files** only for stable output — always **atomic write** and provide an `UPDATE_GOLDEN=1` switch in your test runner if you want quick updates.
> - **Property tests** for invariants (e.g., “reducers are idempotent under empty events,” “totals are additive”).
> - **Deterministic time/rand** for anything with backoff/ttl/throttling.
> - **Concurrency tests**: bound parallelism with `parallelN`; assert outcomes with `eventually`.
> 
> If you want, point me to a real module and I’ll stitch these into an AVA suite tailored to your repo.
> 
> #ava #typescript #functional-programming #testkit #ports-and-adapters #fast-check #golden-files #fake-clock #deterministic #no-mocks #composition #property-testing #retry #backoff
<!-- UID: 2bea73a2-6c7f-411a-82ae-0c06407687bc -->

---




>[!nexus_user] **User** - 09/02/2025 at 12:24 PM
> LRU cache
<!-- UID: 9a8f3b29-8f14-4f19-b0ef-b358a7c8cfa1 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 12:24 PM
> Alright Err — LRU cache, but **functional**. No hidden mutation leaking into your code. We’ll keep the internals pragmatic (copy-on-write) and expose a **pure API**: each op returns a **new cache state** plus any result (value/eviction).
> 
> # Functional LRU Cache in TypeScript (pure API, copy-on-write internals)
> 
> ## Design
> - State is a plain object: `cap`, `size`, `map`, `head`, `tail`.
> - `map` stores nodes: `{ key, value, prev, next }`.
> - Each op clones only the changed parts (map + touched nodes). Everything else is shared.
> - Complexity: near **O(1)** per op for realistic caps; no global mutation; referentially transparent.
> 
> ## Code (drop-in)
> 
> ```ts
> // lru.ts
> export type Node<K, V> = Readonly<{
>  key: K;
>  value: V;
>  prev?: K; // more recent is toward head
>  next?: K; // less recent is toward tail
> }>;
> 
> export type LRU<K, V> = Readonly<{
>  cap: number;
>  size: number;
>  head?: K; // most-recently used key
>  tail?: K; // least-recently used key
>  map: ReadonlyMap<K, Node<K, V>>;
> }>;
> 
> export const init = <K, V>(cap: number): LRU<K, V> => {
>  if (!Number.isFinite(cap) || cap < 1) throw new Error("LRU capacity must be >= 1");
>  return { cap, size: 0, map: new Map() };
> };
> 
> type Evicted<K, V> = Readonly<{ key: K; value: V }>;
> 
> const cloneMap = <K, V>(m: ReadonlyMap<K, V>): Map<K, V> => new Map(m);
> 
> /** Detach a node from the list; returns updated map/head/tail */
> const detach = <K, V>(
>  cache: LRU<K, V>,
>  key: K,
> ): { map: Map<K, Node<K, V>>; head?: K; tail?: K } => {
>  const n = cache.map.get(key);
>  if (!n) return { map: cloneMap(cache.map), head: cache.head, tail: cache.tail };
> 
>  const map = cloneMap(cache.map);
>  // Rebuild neighbors immutably
>  if (n.prev !== undefined) {
>  const p = map.get(n.prev)!;
>  map.set(n.prev, { ...p, next: n.next });
>  }
>  if (n.next !== undefined) {
>  const nx = map.get(n.next)!;
>  map.set(n.next, { ...nx, prev: n.prev });
>  }
> 
>  // Remove from n (optional, but keeps objects clean if you inspect)
>  map.set(key, { ...n, prev: undefined, next: undefined });
> 
>  // Fix head/tail
>  const head = cache.head === key ? n.next : cache.head;
>  const tail = cache.tail === key ? n.prev : cache.tail;
> 
>  return { map, head, tail };
> };
> 
> /** Attach node as new head (most-recent) */
> const attachHead = <K, V>(
>  mapIn: Map<K, Node<K, V>>,
>  currentHead: K | undefined,
>  key: K,
> ): { map: Map<K, Node<K, V>>; head: K; tail?: K } => {
>  const node = mapIn.get(key)!;
>  const map = mapIn;
>  // Link current head back to key
>  if (currentHead !== undefined) {
>  const h = map.get(currentHead)!;
>  map.set(currentHead, { ...h, prev: key });
>  map.set(key, { ...node, next: currentHead, prev: undefined });
>  return { map, head: key };
>  } else {
>  // First element
>  map.set(key, { ...node, prev: undefined, next: undefined });
>  return { map, head: key, tail: key };
>  }
> };
> 
> /** Move existing key to head (if present) */
> const promote = <K, V>(cache: LRU<K, V>, key: K): LRU<K, V> => {
>  if (!cache.map.has(key) || cache.head === key) return cache;
>  const { map: m1, head: h1, tail: t1 } = detach(cache, key);
>  const { map: m2, head: h2, tail: t2 } = attachHead(m1, h1, key);
>  return { ...cache, map: m2, head: h2, tail: t1 ?? t2 };
> };
> 
> export const has = <K, V>(cache: LRU<K, V>, key: K): boolean =>
>  cache.map.has(key);
> 
> export const size = <K, V>(cache: LRU<K, V>) => cache.size;
> 
> export const get = <K, V>(
>  cache: LRU<K, V>,
>  key: K,
> ): { cache: LRU<K, V>; value?: V; hit: boolean } => {
>  const n = cache.map.get(key);
>  if (!n) return { cache, hit: false };
>  const promoted = promote(cache, key);
>  // value unchanged
>  return { cache: promoted, value: n.value, hit: true };
> };
> 
> export const peek = <K, V>(
>  cache: LRU<K, V>,
>  key: K,
> ): { cache: LRU<K, V>; value?: V; hit: boolean } => {
>  const n = cache.map.get(key);
>  return n ? { cache, value: n.value, hit: true } : { cache, hit: false };
> };
> 
> export const set = <K, V>(
>  cache: LRU<K, V>,
>  key: K,
>  value: V,
> ): { cache: LRU<K, V>; evicted?: Evicted<K, V> } => {
>  const exists = cache.map.has(key);
> 
>  // Start with a map that has (possibly updated) node
>  let map = cloneMap(cache.map);
>  map.set(key, { key, value });
> 
>  let head = cache.head;
>  let tail = cache.tail;
>  let sz = exists ? cache.size : cache.size + 1;
> 
>  // If existed, detach current position first (will reattach at head)
>  if (exists) {
>  const det = detach({ ...cache, map }, key);
>  map = det.map; head = det.head; tail = det.tail;
>  }
> 
>  // Attach new/updated node at head
>  const att = attachHead(map, head, key);
>  map = att.map; head = att.head; tail = tail ?? att.tail;
> 
>  // Evict if over capacity
>  if (sz > cache.cap) {
>  const lruKey = tail!;
>  const lruNode = map.get(lruKey)!;
>  // Detach LRU and delete
>  const det2 = detach({ ...cache, map, head, tail, size: sz }, lruKey);
>  map = det2.map; head = det2.head; tail = det2.tail;
>  map.delete(lruKey);
>  sz -= 1;
>  return {
>  cache: { cap: cache.cap, size: sz, head, tail, map },
>  evicted: { key: lruNode.key, value: lruNode.value },
>  };
>  }
> 
>  return { cache: { cap: cache.cap, size: sz, head, tail, map } };
> };
> 
> export const remove = <K, V>(
>  cache: LRU<K, V>,
>  key: K,
> ): { cache: LRU<K, V>; removed?: Evicted<K, V> } => {
>  if (!cache.map.has(key)) return { cache };
>  const n = cache.map.get(key)!;
>  const det = detach(cache, key);
>  const map = det.map;
>  map.delete(key);
>  const sz = cache.size - 1;
>  // Fix head/tail if we removed the last element
>  const head = det.head;
>  const tail = det.tail;
>  return { cache: { cap: cache.cap, size: sz, head, tail, map }, removed: { key, value: n.value } };
> };
> 
> export const clear = <K, V>(cache: LRU<K, V>): LRU<K, V> =>
>  ({ cap: cache.cap, size: 0, map: new Map() });
> 
> /** Iterate keys in MRU → LRU order */
> export const keysMRU = function* <K, V>(cache: LRU<K, V>): Generator<K> {
>  let k = cache.head;
>  while (k !== undefined) {
>  yield k;
>  const n = cache.map.get(k);
>  k = n?.next as K | undefined;
>  }
> };
> 
> /** Materialize entries in MRU → LRU order */
> export const entriesMRU = <K, V>(cache: LRU<K, V>): ReadonlyArray<Readonly<[K, V]>> => {
>  const out: Array<[K, V]> = [];
>  for (const k of keysMRU(cache)) out.push([k, cache.map.get(k)!.value]);
>  return out;
> };
> ```
> 
> ## Quick usage
> 
> ```ts
> import { init, set, get, entriesMRU } from "./lru";
> 
> let cache = init<string, number>(3);
> ({ cache } = set(cache, "a", 1));
> ({ cache } = set(cache, "b", 2));
> ({ cache } = set(cache, "c", 3));
> 
> let r = get(cache, "a"); // hit moves "a" to MRU
> cache = r.cache;
> 
> const put = set(cache, "d", 4);
> cache = put.cache;
> console.log(put.evicted); // { key: "b", value: 2 } (LRU was "b")
> 
> console.log(entriesMRU(cache)); // [["d",4],["a",1],["c",3]]
> ```
> 
> ## AVA tests (baseline)
> 
> ```ts
> // lru.test.ts
> import test from "ava";
> import { init, set, get, peek, remove, entriesMRU, size } from "../src/lru";
> 
> test("set/get promotes to MRU and evicts LRU", t => {
>  let c = init<string, number>(2);
>  ({ cache: c } = set(c, "x", 1));
>  ({ cache: c } = set(c, "y", 2));
>  // Access x -> MRU
>  let g = get(c, "x");
>  t.true(g.hit);
>  t.is(g.value, 1);
>  c = g.cache;
> 
>  // Insert z -> evict LRU (which is y)
>  const put = set(c, "z", 3);
>  c = put.cache;
>  t.deepEqual(put.evicted, { key: "y", value: 2 });
>  t.deepEqual(entriesMRU(c), [["z",3],["x",1]]);
> });
> 
> test("peek does not promote", t => {
>  let c = init<string, number>(2);
>  ({ cache: c } = set(c, "a", 1));
>  ({ cache: c } = set(c, "b", 2));
>  const p = peek(c, "a");
>  t.true(p.hit);
>  t.is(p.value, 1);
>  t.deepEqual(entriesMRU(c), [["b",2],["a",1]]); // unchanged
> });
> 
> test("remove updates and size", t => {
>  let c = init<string, number>(3);
>  ({ cache: c } = set(c, "a", 1));
>  ({ cache: c } = set(c, "b", 2));
>  ({ cache: c } = set(c, "c", 3));
>  const r = remove(c, "b");
>  c = r.cache;
>  t.deepEqual(r.removed, { key: "b", value: 2 });
>  t.is(size(c), 2);
>  t.deepEqual(entriesMRU(c), [["c",3],["a",1]]);
> });
> ```
> 
> ## Notes / trade-offs
> - **Purity:** external callers see a pure API. State is an immutable value you can snapshot, diff, or time-travel.
> - **Performance:** we copy the small set of touched nodes + the `Map` shell. For caps in the hundreds/thousands, this is plenty fast on V8. If you need max throughput, hide a mutable implementation behind the same interface and keep your domain pure.
> - **Equality:** Keys use JS `Map` identity semantics. For structural equality keys, wrap them in a canonical string (hash) at the boundary.
> 
> ## Extras you may want
> - TTL: store `expiresAt` in node; purge on `get`/`set`.
> - Weighted capacity: track `weight(value)` and evict until under cap.
> - Serialization: `toJSON` as `[[k,v],...]` in MRU order; `fromJSON` rebuilds .
> 
> If you want the **mutable-core** variant (O(1), internal mutation but pure facade via cloning only outputs), I can drop that too — same signature, just faster under heavy churn.
> 
> #typescript #functional-programming #lru #cache #immutable #copy-on-write #ava #clean-architecture #patterns
<!-- UID: ddacd77d-6b1d-4721-9138-699e5b4bb4df -->

---


