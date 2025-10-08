# duck-web — Signaling helper

Status: ✅ aligned with WebRTC signaling (2025-02-14).

`connectSignaling` opens a JSON WebSocket connection to the gateway, optionally appending
`?token=...` for bearer auth. It exposes a tiny event emitter (`on`) plus a guarded `send`
that no-ops unless the socket is open.

## Diagram
```mermaid
flowchart LR
  A[connectSignaling(url, token?)] --> B[compute url + optional ?token]
  B --> C[new WebSocket(resolvedUrl)]
  C --> D[install onmessage → dispatch(JSON.parse(msg.type))]
  D --> E[{send,type,data}]
  D --> F[{on,type,fn}]
  D --> G[{close()}]
```

## Notes
- All signaling payloads are JSON objects with a `type` discriminator.
- Token is appended as a query parameter to match the gateway's AUTH_TOKEN check.
- `send` verifies `readyState === 1` (OPEN) before emitting to avoid DOMExceptions.

## Related
- Gateway signaling loop expects `{type:"offer"|"answer"|"ice"|"text", ...}`.
- Voice channel is negotiated after `ready` and `answer` events land.
