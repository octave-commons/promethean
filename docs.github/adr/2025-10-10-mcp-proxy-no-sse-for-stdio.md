# ADR: 2025-10-10 - MCP Proxy: No SSE for stdio endpoints

## Status

Accepted

## Context

The MCP Fastify transport supports two distinct endpoint types:

1. **Registry endpoints** - In-process MCP servers that support streaming events via Server-Sent Events (SSE)
2. **Proxy endpoints** - stdio child processes that speak JSON-RPC via LSP framing and return finite responses

### Problem

Prior to this change, proxy endpoints were incorrectly forced into SSE negotiation:

1. **Proxy handlers** included `text/event-stream` in their Accept headers
2. **Headers replacement** - The entire `headers` object was replaced after `reply.hijack()`
3. **Brittle JSON parsing** - Invalid JSON was silently converted to `undefined`, causing proxy stdio peers to wait forever
4. **Open method support** - Proxy endpoints accepted GET/DELETE methods that don't make sense for JSON-RPC

This caused:
- **Response timeouts** - Clients would wait indefinitely due to SSE negotiation on endpoints that never send events
- **Poor error handling** - Malformed JSON was not caught early
- **Confusing API** - Methods that should only work with registry endpoints were available on proxy endpoints

## Decision

### 1. SSE Negotiation Separation

- **Registry endpoints**: Continue to negotiate SSE (`Accept: application/json, text/event-stream`)
- **Proxy endpoints**: Force JSON-only (`Accept: application/json`)

### 2. Headers Mutation Strategy

Instead of replacing the entire headers object:

```ts
// OLD (replaces entire object)
const normalizedHeaders = {
  ...rawReq.headers,
  accept: acceptHeader,
  'content-type': rawReq.headers['content-type'] ?? 'application/json',
};
await proxy.handle(withHeaders(rawReq, normalizedHeaders), rawRes, normalizedBody);

// NEW (patches specific keys only)
rawReq.headers['accept'] = acceptHeader;
rawReq.headers['content-type'] = rawReq.headers['content-type'] ?? 'application/json';
await proxy.handle(rawReq, rawRes, normalizedBody);
```

### 3. Strict JSON Parsing

Proxy endpoints now use strict JSON parsing with immediate 400 responses on parse errors:

```ts
let normalizedBody: unknown;
try {
  normalizedBody = ensureInitializeDefaults(mustParseJson(request.body));
} catch {
  rawRes.writeHead(400).end(JSON.stringify({
    jsonrpc: '2.0',
    error: { code: -32700, message: 'Parse error' },
    id: null,
  }));
  return;
}
```

### 4. Method Restrictions

- **Registry endpoints**: Support POST, GET, DELETE (existing behavior)
- **Proxy endpoints**: Support POST, GET (+ OPTIONS for CORS)
  - GET requests return health/discovery information
  - POST requests handle JSON-RPC protocol

### 5. API Surface Changes

Modified `ensureAcceptHeader()` to accept `includeSse` parameter:

```ts
const ensureAcceptHeader = (headers: IncomingMessage['headers'], includeSse = true): string => {
  // ... implementation
};
```

## Consequences

### Positive

1. **Eliminated timeouts** - Proxy endpoints now complete immediately instead of hanging for SSE
2. **Better error handling** - Invalid JSON returns 400 Parse error immediately
3. **Clear API boundaries** - Registry supports streaming, proxy supports request/response
4. **Improved observability** - Clear logging and error responses for debugging
5. **Reduced confusion** - Method restrictions align with endpoint capabilities

### Negative

1. **Breaking change** - Clients expecting SSE from proxy endpoints will no longer receive it
2. **Stricter validation** - Previously tolerated invalid JSON now returns 400 errors
3. **GET request behavior change** - GET requests to proxy endpoints now return health info instead of 404

### Neutral

1. **Registry behavior unchanged** - Existing streaming functionality preserved
2. **Performance improvement** - Reduced unnecessary SSE negotiation overhead

## Implementation Details

### Files Changed

- `packages/mcp/src/core/transports/fastify.ts`
  - Modified `ensureAcceptHeader()` to support SSE control
  - Updated `createProxyHandler()` to use strict JSON parsing and direct header mutation
  - Updated `registerRoute()` to support method restrictions
  - Added `PROXY_METHODS` constant

### Tests Added

- `src/tests/fastify-proxy-negative.test.ts` - Unit tests for negative scenarios
- `src/tests/fastify-proxy-registry-integration.test.ts` - Integration tests comparing behavior

### Migration Guide

#### For Proxy Endpoint Users

Before:
```ts
// This would hang waiting for SSE
const response = await fetch('/proxy', {
  method: 'POST',
  headers: { 'accept': 'application/json, text/event-stream' },
  body: '{"jsonrpc": "2.0", ...}'
});
```

After:
```ts
// This completes immediately with JSON response
const response = await fetch('/proxy', {
  method: 'POST',
  headers: { 'accept': 'application/json' },
  body: '{"jsonrpc": "2.0", ...}'
});
```

#### For Invalid JSON Handling

Before:
```ts
// Invalid JSON would hang as proxy waits forever
const response = await fetch('/proxy', {
  method: 'POST',
  body: '{"incomplete": json'
});
// Timeout...
```

After:
```ts
// Invalid JSON returns immediate 400 error
const response = await fetch('/proxy', {
  method: 'POST',
  body: '{"incomplete": json'
});
// Response: 400 { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }
```

## Future Considerations

1. **Metrics collection** - Add observability for proxy vs registry usage patterns
2. **Connection pooling** - Consider connection reuse for high-throughput proxy scenarios
3. **Timeout configuration** - Make proxy timeouts configurable per endpoint
4. **Streaming proxies** - If future proxy types need streaming, add endpoint-level configuration

## References

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Server-Sent Events specification](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification)

---