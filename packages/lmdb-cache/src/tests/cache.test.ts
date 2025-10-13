import { rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import test from "ava";
import { sleep } from "@promethean/utils";

import { openLmdbCache } from "../index.js";

const TMP_ROOT = ".cache/tests-lmdb";

function tmpPath(name: string): string {
  const p = join(TMP_ROOT, `${name}-${Date.now()}-${process.pid}`);
  try {
    mkdirSync(TMP_ROOT, { recursive: true });
  } catch {}
  return p;
}

test("set/get/has basic", async (t) => {
  const path = tmpPath("basic");
  const cache = await openLmdbCache({ path, namespace: "n1" });
  await cache.set("a", 123);
  t.true(await cache.has("a"));
  t.is(await cache.get("a"), 123);
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("ttl expiry prunes on read", async (t) => {
  const path = tmpPath("ttl");
  const cache = await openLmdbCache({ path, namespace: "n1" });
  await cache.set("k", "v", { ttlMs: 500 });
  t.is(await cache.get("k"), "v");
  await sleep(800);
  t.is(await cache.get("k"), undefined);
  t.false(await cache.has("k"));
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("namespaces are isolated and composable", async (t) => {
  const path = tmpPath("ns");
  const cache = await openLmdbCache({ path, namespace: "root" });
  await cache.set("x", 1);
  const a = cache.withNamespace("a");
  const b = cache.withNamespace("b");
  await a.set("x", 2);
  await b.set("x", 3);
  t.is(await cache.get("x"), 1);
  t.is(await a.get("x"), 2);
  t.is(await b.get("x"), 3);
  const a1 = a.withNamespace("child");
  await a1.set("y", 42);
  t.is(await a1.get("y"), 42);
  t.is(await a.get("y"), undefined);
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("entries yields non-expired logical keys only", async (t) => {
  const path = tmpPath("entries");
  const cache = await openLmdbCache({ path, namespace: "ns" });
  await cache.batch([
    { type: "put", key: "a", value: 1 },
    { type: "put", key: "b", value: 2, ttlMs: 500 },
  ]);
  const first = [];
  for await (const [k, v] of cache.entries()) first.push([k, v]);
  t.deepEqual(first.sort(), [
    ["a", 1],
    ["b", 2],
  ]);
  await sleep(800);
  const second = [];
  for await (const [k, v] of cache.entries()) second.push([k, v]);
  t.deepEqual(second, [["a", 1]]);
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("batch operations work correctly", async (t) => {
  const path = tmpPath("batch");
  const cache = await openLmdbCache({ path });
  
  await cache.batch([
    { type: "put", key: "key1", value: "value1" },
    { type: "put", key: "key2", value: "value2", ttlMs: 1000 },
    { type: "del", key: "key3" }, // Should not error
  ]);
  
  t.is(await cache.get("key1"), "value1");
  t.is(await cache.get("key2"), "value2");
  t.is(await cache.get("key3"), undefined);
  
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("sweepExpired removes expired entries", async (t) => {
  const path = tmpPath("sweep");
  const cache = await openLmdbCache({ path });
  
  await cache.set("permanent", "keep");
  await cache.set("temporary", "delete", { ttlMs: 100 });
  
  // Verify both exist
  t.is(await cache.get("permanent"), "keep");
  t.is(await cache.get("temporary"), "delete");
  
  // Wait for expiry
  await sleep(200);
  
  // Sweep expired entries
  const deletedCount = await cache.sweepExpired();
  t.is(deletedCount, 1);
  
  // Verify only permanent remains
  t.is(await cache.get("permanent"), "keep");
  t.is(await cache.get("temporary"), undefined);
  
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("entries with limit works correctly", async (t) => {
  const path = tmpPath("entries-limit");
  const cache = await openLmdbCache({ path });
  
  // Add multiple entries
  for (let i = 0; i < 10; i++) {
    await cache.set(`key${i}`, `value${i}`);
  }
  
  const entries = [];
  for await (const [k, v] of cache.entries({ limit: 5 })) {
    entries.push([k, v]);
  }
  
  t.is(entries.length, 5);
  
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("concurrent operations work correctly", async (t) => {
  const path = tmpPath("concurrent");
  const cache = await openLmdbCache({ path });
  
  // Test concurrent writes
  const writePromises = [];
  for (let i = 0; i < 10; i++) {
    writePromises.push(cache.set(`key${i}`, `value${i}`));
  }
  
  await Promise.all(writePromises);
  
  // Test concurrent reads
  const readPromises = [];
  for (let i = 0; i < 10; i++) {
    readPromises.push(cache.get(`key${i}`));
  }
  
  const results = await Promise.all(readPromises);
  
  for (let i = 0; i < 10; i++) {
    t.is(results[i], `value${i}`);
  }
  
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("default TTL is applied correctly", async (t) => {
  const path = tmpPath("default-ttl");
  const cache = await openLmdbCache({ 
    path, 
    defaultTtlMs: 500 
  });
  
  await cache.set("key", "value"); // Should use default TTL
  t.is(await cache.get("key"), "value");
  
  await sleep(800);
  t.is(await cache.get("key"), undefined);
  
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("complex objects are handled correctly", async (t) => {
  const path = tmpPath("complex-objects");
  const cache = await openLmdbCache({ path });
  
  const complexObj = {
    string: "test",
    number: 42,
    array: [1, 2, 3],
    nested: { a: "b", c: "d" },
    date: new Date(),
  };
  
  await cache.set("complex", complexObj);
  const retrieved = await cache.get("complex");
  
  t.deepEqual(retrieved, complexObj);
  
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});