---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Level iterator error fix"
conversation_id: 68b5fa27-2540-8320-82e4-aea93d6b58a8
create_time: 09/01/2025 at 2:55 PM
update_time: 09/01/2025 at 3:20 PM
---

# Title: Level iterator error fix

Created: 09/01/2025 at 2:55 PM
Last Updated: 09/01/2025 at 3:20 PM
Chat URL: https://chat.openai.com/c/68b5fa27-2540-8320-82e4-aea93d6b58a8


>[!nexus_user] **User** - 09/01/2025 at 2:55 PM
> > promethean@ doc:all /home/err/devel/promethean
> > pnpm doc:01-frontmatter && pnpm doc:02-embed && pnpm doc:03-query && pnpm doc:04-relate && pnpm doc:05-footers && pnpm doc:06-rename
> 
> > promethean@ doc:01-frontmatter /home/err/devel/promethean
> > tsx packages/docops/src/01-frontmatter.ts --dir docs/unique --gen-model qwen3:4b
> 
> 01-frontmatter: done.
> 
> > promethean@ doc:02-embed /home/err/devel/promethean
> > tsx packages/docops/src/02-embed.ts --dir docs/unique
> 
> 02-embed: done (Ollama→Chroma only).
> 
> > promethean@ doc:03-query /home/err/devel/promethean
> > tsx packages/docops/src/03-query.ts
> 
> ModuleError: Iterator is not open: cannot call next() after close()
>  at Iterator._next (/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/lib/deferred-iterator.js:60:13)
>  at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/lib/deferred-iterator.js:58:44
>  at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:1018:14
>  at DeferredQueue.drain (/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/lib/deferred-queue.js:57:20)
>  at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:165:23
>  at async AbstractSublevel.open (/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:222:9) {
>  code: 'LEVEL_ITERATOR_NOT_OPEN'
> }
>  ELIFECYCLE  Command failed with exit code 1.
>  ELIFECYCLE  Command failed with exit code 1.
<!-- UID: 62e104a9-afe1-4711-a30a-f96b08a99d02 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 2:55 PM
> Got it. This is a Level/abstract-level lifecycle bug, not Chroma. The iterator is being created or awaited while its sublevel (or the parent DB) is still opening—or has already been closed—so `DeferredIterator` auto-closes and you get `LEVEL_ITERATOR_NOT_OPEN`.
> 
> # What’s really happening
> One (or more) of these is true in `03-query.ts`:
> 
> 1) You create an iterator before `await db.open()` (or before a sublevel is ready). 
> 2) You close the DB (or a sublevel) while an iterator is still running. 
> 3) You mix implicit open/close (Level will open lazily) with explicit `db.close()` in overlapping async tasks. 
> 4) You construct new sublevels after iterators were created, which triggers more opens while an iterator is pending.
> 
> # Fast triage (do this now)
> - Ensure exactly one DB open path and one close path around the whole step:
>  - Open once at the start of `main()`.
>  - Never call `db.close()` until *all* iterators have finished.
> - Create sublevels immediately after opening the parent DB (not inside hot loops).
> - Use `for await (const [k,v] of it)` and **explicitly** `await it.close()` in a `finally`.
> - Don’t run other `open()`/`clear()`/writes on the same sublevel while an iterator is active.
> 
> # Minimal safe pattern (drop-in template)
> Use this structure in `03-query.ts` and stick to it. It’s functional, avoids mutation, and scopes resources clearly.
> 
> ```ts
> // packages/docops/src/03-query.ts
> import { Level } from "level";
> import { strict as assert } from "assert";
> 
> type Json = unknown;
> 
> type Range = {
>  gt?: string;
>  gte?: string;
>  lt?: string;
>  lte?: string;
>  reverse?: boolean;
>  limit?: number;
> };
> 
> const DB_PATH = ".cache/docs-pipeline"; // keep in one place
> 
> // Pure-ish helper to build ranges
> const range = (prefix: string): Range => ({ gt: `${prefix}`, lt: `${prefix}~` });
> 
> const usingIterator = async <T>(
>  it: AsyncIterable<[string, T]>,
>  onItem: (kv: readonly [string, T]) => void | Promise<void>
> ) => {
>  // Level iterators are also closable; we rely on caller to pass the actual iterator
>  // @ts-ignore - Level iterator types can be loose; we call close in finally.
>  const iterator = it as unknown as { [Symbol.asyncIterator](): AsyncIterator<[string, T]>; close(): Promise<void> };
>  try {
>  for await (const kv of iterator) {
>  await onItem(kv);
>  }
>  } finally {
>  await iterator.close();
>  }
> };
> 
> // Create DB once, create sublevels once, then operate.
> const withDb = async <R>(f: (root: Level<string, Json>, subs: {
>  chunks: Level<string, Json>;
>  embeds: Level<string, Json>;
>  docs: Level<string, Json>;
> }) => Promise<R>): Promise<R> => {
>  const db = new Level<string, Json>(DB_PATH, { valueEncoding: "json" });
>  await db.open();
> 
>  // Create sublevels *after* open and only once
>  const chunks = db.sublevel<string, Json>("chunks", { valueEncoding: "json" });
>  const embeds = db.sublevel<string, Json>("embeddings", { valueEncoding: "json" });
>  const docs = db.sublevel<string, Json>("docs", { valueEncoding: "json" });
> 
>  try {
>  // Optionally ensure sublevels are ready (open is inherited; this is defensive)
>  await Promise.all([chunks.open(), embeds.open(), docs.open()]);
>  return await f(db, { chunks, embeds, docs });
>  } finally {
>  // Close once all work (including iterators) is done
>  await db.close();
>  }
> };
> 
> const collect = <T>(xs: Iterable<T> | AsyncIterable<T>) =>
>  (async () => {
>  const out: T[] = [];
>  for await (const x of xs as any) out.push(x);
>  return out;
>  })();
> 
> async function main() {
>  await withDb(async (_db, { chunks, embeds, docs }) => {
>  // Example: iterate chunks safely
>  const it = chunks.iterator({ ...range("chunk:"), keys: true, values: true });
> 
>  const results: Array<{ key: string; value: Json }> = [];
>  await usingIterator(it, async ([key, value]) => {
>  results.push({ key, value });
>  });
> 
>  // If you need to query another sublevel, do it sequentially or ensure no overlap:
>  const eIt = embeds.iterator({ ...range("embed:"), keys: true, values: true });
>  const embedPairs: Array<[string, Json]> = [];
>  await usingIterator(eIt, async (kv) => embedPairs.push(kv));
> 
>  // Pure transform step (no DB calls)
>  const merged = results.map(({ key, value }) => {
>  const eid = (value as any)?.embedId ?? null;
>  const embed = eid
>  ? embedPairs.find(([ek]) => ek === `embed:${eid}`)?.[1]
>  : null;
>  return { key, value, embed };
>  });
> 
>  // Write outputs in a batch *after* iteration completes
>  if (merged.length) {
>  await docs.batch(
>  merged.map((m) => ({ type: "put", key: `doc:${m.key}`, value: m }))
>  );
>  }
> 
>  // Debug/assert optional
>  assert.ok(true);
>  });
> }
> 
> main().catch((err) => {
>  console.error("03-query fatal:", err);
>  process.exit(1);
> });
> ```
> 
> ### Notes that matter
> - **Open exactly once** (`await db.open()`), then create **all sublevels**, then iterate. 
> - `usingIterator(...)` ensures each iterator is explicitly closed, even on error. 
> - Don’t spawn parallel iterators on the same sublevel unless you really know the semantics; if you do, await each or isolate by ranges. 
> - No `db.close()` anywhere until **all** iterators and batches are done. 
> - Avoid calling `sublevel.open()` in hot paths—do it once up front (as in `withDb`). 
> - If you previously had `Promise.all([...iterators])` mixed with writes/clears, that’s a classic way to reproduce this failure. Sequence them.
> 
> # If you still see it
> - Grep for `db.close()` / `sublevel.clear()` / `sublevel.open()` inside loops or callbacks—rip them out. 
> - Ensure no unrelated step (like a progress reporter) is instantiating a fresh DB instance that gets closed early. Share one instance per process. 
> - Pin versions: `abstract-level@3.1.x`, `level@8.x`. Mixing old `levelup`/`encoding-down` with new `abstract-level` can create subtle iterator behavior. Keep them consistent.
> 
> # Why 02-embed looked “done”
> It only exercised the Ollama→Chroma path. `03-query` is your first heavy Level iteration across cached chunks/embeds/docs, so the race shows up here.
> 
> If you want, paste the current `03-query.ts` and I’ll mark the exact lines causing the iterator to close early.
> 
> #tags #promethean #docops #leveldb #typescript #functional-programming #bugfix
<!-- UID: e07873b6-b8ef-47f9-841c-1fb2c3480e32 -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:15 PM
> > @promethean/docops@ build /home/err/devel/promethean/packages/docops
> > tsc -p tsconfig.json
> 
> src/db.ts(71,26): error TS2741: Property 'location' is missing in type 'AbstractSublevel<Level<string, unknown>, string | Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike>, string, unknown>' but required in type 'Level<string, unknown>'.
> src/db.ts(71,34): error TS2741: Property 'location' is missing in type 'AbstractSublevel<Level<string, unknown>, string | Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike>, string, unknown>' but required in type 'Level<string, unknown>'.
> src/db.ts(71,42): error TS2741: Property 'location' is missing in type 'AbstractSublevel<Level<string, unknown>, string | Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike>, string, unknown>' but required in type 'Level<string, unknown>'.
> /home/err/devel/promethean/packages/docops:
>  ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @promethean/docops@ build: `tsc -p tsconfig.json`
> Exit status 2
<!-- UID: 495cd2a0-f7fe-49c3-8c7f-94cdff5b547a -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:15 PM
> Yep—this one’s on types, not runtime.
> 
> `sublevel()` returns an `AbstractSublevel`, which **doesn’t** have `location`. Only the root `Level` has `location`. You typed your sublevels as `Level<...>`, so TS screams.
> 
> ## Fix (clean + future-proof)
> 
> Use `AbstractLevel` for anything that may be a sublevel. Keep `Level` only for the root.
> 
> ### Patch (minimal)
> 
> ```diff
> - import { Level } from "level";
> + import { Level } from "level";
> + import type { AbstractLevel } from "abstract-level";
> 
>  type Json = unknown;
> 
> -export type DBHandles = {
> - root: Level<string, Json>;
> - chunks: Level<string, Json>;
> - embeds: Level<string, Json>;
> - docs: Level<string, Json>;
> -};
> +export type DBHandles = {
> + root: Level<string, Json>; // has `location`
> + chunks: AbstractLevel<string, Json>; // sublevel: no `location`
> + embeds: AbstractLevel<string, Json>;
> + docs: AbstractLevel<string, Json>;
> +};
> 
>  export async function openDb(path: string): Promise<DBHandles> {
>  const root = new Level<string, Json>(path, { valueEncoding: "json" });
>  await root.open();
> - const chunks = root.sublevel<string, Json>("chunks", { valueEncoding: "json" });
> - const embeds = root.sublevel<string, Json>("embeddings", { valueEncoding: "json" });
> - const docs = root.sublevel<string, Json>("docs", { valueEncoding: "json" });
> + const chunks: AbstractLevel<string, Json> = root.sublevel("chunks", { valueEncoding: "json" });
> + const embeds: AbstractLevel<string, Json> = root.sublevel("embeddings", { valueEncoding: "json" });
> + const docs: AbstractLevel<string, Json> = root.sublevel("docs", { valueEncoding: "json" });
>  // (optional) await Promise.all([chunks.open(), embeds.open(), docs.open()]);
>  return { root, chunks, embeds, docs };
>  }
> ```
> 
> ### If you expose helpers, keep the interface generic
> 
> Any function that accepts a “DB-like” handle should take `AbstractLevel<string, Json>` rather than `Level`. Example:
> 
> ```ts
> type KV = AbstractLevel<string, Json>;
> 
> export const readRange = async (db: KV, gt: string, lt: string) => {
>  const it = db.iterator({ gt, lt, keys: true, values: true });
>  try {
>  const out: Array<[string, Json]> = [];
>  for await (const kv of it) out.push(kv);
>  return out;
>  } finally {
>  // @ts-expect-error level iterators have close() at runtime
>  await it.close?.();
>  }
> };
> ```
> 
> ### Why this works
> - `AbstractLevel` is the common interface for root DBs **and** sublevels.
> - You stop promising `location` on sublevels that don’t have it.
> - You avoid brittle generic walls on `AbstractSublevel<...>` while keeping correct surface types.
> 
> ### Optional TS guardrails
> - Ensure `tsconfig.json` has `"moduleResolution": "bundler"` (or `node16`) if you’re in ESM land with Level 8.
> - You **don’t** need `skipLibCheck` for this; the real fix is the type change above.
> 
> If you want, paste `src/db.ts` around line 60–80 and I’ll give you a surgical diff against your exact code.
> 
> #tags #typescript #leveldb #abstract-level #docops #promethean #bugfix
<!-- UID: 26dad821-a4af-416a-acc4-b8b18839141a -->

---


