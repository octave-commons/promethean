# Handshake Guard

Gate I/O until ENSO is ready. Provides a `wait()` promise, `isReady()`, and caches readiness in callers via `ensureHandshake()`.

## Timeout
- Default: 10s
- Override: `ENSO_HANDSHAKE_TIMEOUT_MS` (integer milliseconds)

## Close semantics
- On failure, send `{ type: 'error', reason }` then `ws.close(1011, 'enso handshake failed')`.
- Optionally mirror a short `reason` in the close string for server logs.

## Sample cache pattern
```ts
let readyCached = false;
const ensureHandshake = async () => {
  if (readyCached || guard.isReady()) { readyCached = true; return true; }
  try { await guard.wait(); readyCached = true; return true; }
  catch { return false; }
};
```