---
$$
uuid: e6434d07-f629-40d3-b355-c44c1c80f2a3
$$
$$
created_at: '2025-09-05T10:49:40Z'
$$
filename: Ports and Adapters for Test-Driven Persistence
title: Ports and Adapters for Test-Driven Persistence
$$
description: >-
$$
  A clean architecture pattern using ports and adapters to decouple business
  logic from persistence layers, enabling testable and modular code with minimal
  test hooks. This approach defines interfaces for core needs, provides thin
  adapters for databases like MongoDB and Chroma, and ensures tests mock only
  owned interfaces without touching production dependencies.
tags:
  - ports
  - adapters
  - test-driven
  - persistence
  - dependency-injection
  - modular
  - mocking
  - composition-root
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---
You’re right to hate those test hooks. They couple tests to production modules, hide global state, and make parallel runs flaky. A cleaner approach is:

* define **ports** (your own minimal interfaces),
* provide **adapters** for Mongo/Chroma,
* have a **composition root** that wires real adapters in prod,
* and in tests either inject fakes directly or **mock at the module boundary** $ESM-safe$ without touching business code.

This follows “ports & adapters” and the “don’t mock what you don’t own” spirit: you mock your own interfaces, not third-party clients. ([Better Programming][1], [8th Light][2], [Hynek Schlawack][3])

---

# 1) Define ports (what your core needs)

```ts
// src/ports/persistence.ts
export type Vector = number[];

export interface DocStore {
  insert(doc: { id: string; data: unknown }): Promise<void>;
  findById(id: string): Promise<unknown | null>;
}

export interface VectorStore {
  upsert(id: string, vector: Vector, meta?: Record<string, unknown>): Promise<void>;
  query(vector: Vector, k: number): Promise<Array<{ id: string; score: number }>>;
}
```

No test logic here, just pure contracts you own.

---

# 2) Adapters $Mongo / Chroma$ — thin, replaceable

```ts
// src/adapters/mongo-doc-store.ts
import type { DocStore } from "../ports/persistence.js";
import { MongoClient } from "mongodb";

export const makeMongoDocStore = (client: MongoClient, dbName = "app", col = "docs"): DocStore => {
  const collection = client.db(dbName).collection(col);
  return Object.freeze({
    async insert(doc) { await collection.insertOne(doc); },
    async findById(id) { return collection.findOne({ id }); },
  });
};
```

```ts
// src/adapters/chroma-vector-store.ts
import type { VectorStore } from "../ports/persistence.js";
import { ChromaClient } from "chromadb";

export const makeChromaVectorStore = (client: ChromaClient, collection = "vectors"): VectorStore => {
  const collP = client.getOrCreateCollection({ name: collection });
  return Object.freeze({
    async upsert(id, vector, meta) {
      const coll = await collP;
      await coll.upsert({ ids: [id], embeddings: [vector], metadatas: [meta ?? {}] });
    },
    async query(vector, k) {
      const coll = await collP;
      const res = await coll.query({ queryEmbeddings: [vector], nResults: k });
      return (res.ids?.[0] ?? []).map((id, i) => ({ id, score: res.distances?.[0]?.[i] ?? 0 }));
    },
  });
};
```

Adapters are small and testable. If you want local, persistent Chroma during dev, Chroma’s cookbook documents the persistent client. ([Chroma Cookbook][4])

---

# 3) Composition root (prod wiring only)

```ts
// src/compose/persistence.ts
import { MongoClient } from "mongodb";
import { ChromaClient } from "chromadb";
import { makeMongoDocStore } from "../adapters/mongo-doc-store.js";
import { makeChromaVectorStore } from "../adapters/chroma-vector-store.js";

export type Persistence = ReturnType<typeof buildPersistence>;

export const buildPersistence = async ({
  mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017",
  chromaUrl = process.env.CHROMA_URL ?? "
} = {}) => {
  const mongo = new MongoClient(mongoUri);
  await mongo.connect();

  const chroma = new ChromaClient({ path: chromaUrl });

  return Object.freeze({
    mongoClient: mongo,
    chromaClient: chroma,
    docStore: makeMongoDocStore(mongo),
    vectorStore: makeChromaVectorStore(chroma),
    async close() { await mongo.close(); /* chroma has no close */ },
  });
};
```

Business logic modules accept a `Persistence` (or just the specific ports) as parameters. No singletons; no test hooks. Pure dependency injection via function parameters keeps things functional and composable.

---

# 4) Business logic stays pure(ish)

```ts
// src/core/ingest.ts
import type { DocStore, VectorStore } from "../ports/persistence.js";

export const ingest = ({ docStore, vectorStore }: { docStore: DocStore; vectorStore: VectorStore }) =>
  async (doc: { id: string; text: string; embedding: number[] }) => {
    // transform, validate, etc.
    await docStore.insert({ id: doc.id, data: { text: doc.text } });
    await vectorStore.upsert(doc.id, doc.embedding, { len: doc.text.length });
    return { ok: true as const, id: doc.id };
  };
```

---

# 5) Unit tests: mock your **ports**, not Mongo/Chroma

You don’t need to reach into production modules or add `__set*ForTests` hooks. Supply fakes to `ingest` directly:

```ts
// test/ingest.unit.test.ts
import test from "ava";
import { ingest } from "../src/core/ingest.js";

const fakeDocStore = (): import("../src/ports/persistence.js").DocStore => {
  const store = new Map<string, unknown>();
  return Object.freeze({
    async insert(doc) { store.set(doc.id, doc.data); },
    async findById(id) { return store.get(id) ?? null; },
  });
};

const fakeVectorStore = (): import("../src/ports/persistence.js").VectorStore => Object.freeze({
  async upsert() { /* no-op */ },
  async query() { return []; },
});

test("ingest inserts doc and vector", async t => {
  const svc = ingest({ docStore: fakeDocStore(), vectorStore: fakeVectorStore() });
  const res = await svc({ id: "1", text: "hello", embedding: [0.1, 0.2] });
  t.deepEqual(res, { ok: true, id: "1" });
});
```

This aligns with “don’t mock what you don’t own.” You own the `DocStore`/`VectorStore` APIs. Mock them freely; leave Mongo/Chroma alone here. ([Hynek Schlawack][3], [8th Light][2])

---

# 6) Module-boundary mocking (when you really want it)

If you prefer to import your service already wired (without exposing DI at the call site), mock **your adapter module** at import time using `esmock`, which supports ESM and plays nicely with AVA:

```ts
// test/ingest.esmock.test.ts
import test from "ava";
import esmock from "esmock";

const makeMongoDocStore = () => ({
  insert: async () => {},
  findById: async () => null,
});
const makeChromaVectorStore = () => ({
  upsert: async () => {},
  query: async () => [],
});

test("ingest via composition works with mocked adapters", async t => {
  const { buildPersistence } = await esmock("../src/compose/persistence.js", {
    "../src/adapters/mongo-doc-store.js": { makeMongoDocStore },
    "../src/adapters/chroma-vector-store.js": { makeChromaVectorStore },
  });

  const p = await buildPersistence();
  const { ingest } = await esmock("../src/core/ingest.js"); // import the core normally

  const run = ingest({ docStore: makeMongoDocStore(), vectorStore: makeChromaVectorStore() });
  const res = await run({ id: "x", text: "ok", embedding: [0] });
  t.is(res.ok, true);
});
```

`esmock` provides native ESM import mocking and has examples for AVA. It avoids invasive “test hook” exports. ([NPM][5], [Skypack][6])

---

# 7) Integration tests: use real services in containers

For anything that must exercise Mongo/Chroma behavior, spin up real dependencies with **Testcontainers**. That gives repeatable, isolated tests without hand-rolled hooks:

```ts
// test/ingest.integration.test.ts
import test from "ava";
import { MongoDBContainer } from "@testcontainers/mongodb";
import { GenericContainer } from "testcontainers";
import { MongoClient } from "mongodb";
import { ChromaClient } from "chromadb";
import { makeMongoDocStore } from "../src/adapters/mongo-doc-store.js";
import { makeChromaVectorStore } from "../src/adapters/chroma-vector-store.js";
import { ingest } from "../src/core/ingest.js";

test("ingest against real Mongo + Chroma", async t => {
  const mongoC = await new MongoDBContainer().start();
  const chromaC = await new GenericContainer("ghcr.io/chroma-core/chroma:latest")
    .withExposedPorts(8000)
    .start();

  const mongo = new MongoClient(mongoC.getConnectionString());
  await mongo.connect();
  const chroma = new ChromaClient({ path: ` });

  const run = ingest({
    docStore: makeMongoDocStore(mongo),
    vectorStore: makeChromaVectorStore(chroma),
  });

  const res = await run({ id: "1", text: "hello", embedding: [0.1, 0.2] });
  t.true(res.ok);

  await mongo.close();
});
```

Testcontainers for Node has a MongoDB module and general guides; it’s built for exactly this kind of test. ([node.testcontainers.org][7], [Testcontainers][8])

---

## Why this is better than test hooks

* **No test code in prod paths.** Ports/DI keeps boundaries explicit.
* **Deterministic & parallel-friendly.** No shared module singletons leaking between tests.
* **Easier refactors.** Adapters are the only place that knows Mongo/Chroma APIs.
* **Right tool for each test level.** Fakes for unit speed; containers for realistic integration. The principle is well-established: mock *your* interfaces, not vendor clients. ([Hynek Schlawack][3], [8th Light][2])

---

## Migration plan $incremental, low-risk$

1. Extract minimal `DocStore`/`VectorStore` ports from current usage.
2. Wrap current `MongoClient`/`ChromaClient` calls in adapter functions.
3. Replace direct `getMongoClient()/getChromaClient()` with DI in the first core function you touch.
4. Delete `__set*ForTests` once all core modules accept injected ports.
5. Add a small `buildPersistence()` for prod/server start only.

---

If you want, I can refactor your current file into this layout and add a couple of AVA tests (one unit with fakes, one integration with Testcontainers).
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
