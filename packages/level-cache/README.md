# @promethean/level-cache

A tiny, embedded, **functional-style** cache on top of `level`:
- **No server**, no daemon.
- **TTL** via per-record expiry.
- **Lazy eviction** + explicit `sweepExpired()`.
- **Namespaces** without extra deps.
- Pure helpers; no hidden stateful loops.

## Install

```bash
pnpm -r add @promethean/level-cache

## Example

```typescript
import { openLevelCache } from "@promethean/level-cache";

const cache = await openLevelCache<{ foo: string }>({
  path: ".cache/level-cache",
  defaultTtlMs: 60_000,
  namespace: "docops"
});

await cache.set("k1", { foo: "bar" }, { ttlMs: 5_000 });
console.log(await cache.get("k1")); // { foo: 'bar' }

const userNs = cache.withNamespace("users");
await userNs.set("u:123", { foo: "baz" });

for await (const [k, v] of userNs.entries()) {
  console.log(k, v);
}

const removed = await cache.sweepExpired();
console.log({ removed });

await cache.close();

```
