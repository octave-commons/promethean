import { rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import test from "ava";
import { sleep } from "@promethean-os/utils";

import { openLevelCache } from "../index.js";

const TMP_ROOT = ".cache/tests-level";

function tmpPath(name: string): string {
  const p = join(TMP_ROOT, `${name}-${Date.now()}-${process.pid}`);
  try {
    mkdirSync(TMP_ROOT, { recursive: true });
  } catch {}
  return p;
}

test("set/get/has basic", async (t) => {
  const path = tmpPath("basic");
  const cache = await openLevelCache({ path, namespace: "n1" });
  await cache.set("a", 123);
  t.true(await cache.has("a"));
  t.is(await cache.get("a"), 123);
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test("ttl expiry prunes on read", async (t) => {
  const path = tmpPath("ttl");
  const cache = await openLevelCache({ path, namespace: "n1" });
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
  const cache = await openLevelCache({ path, namespace: "root" });
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
  const cache = await openLevelCache({ path, namespace: "ns" });
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
