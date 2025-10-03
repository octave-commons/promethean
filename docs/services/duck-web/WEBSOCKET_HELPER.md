# duck-web — WebSocket Helper

Status: 🔧 under fix in PR #1446.

`openWs` constructs a WS with custom subprotocols: `duck.v1` and optional `bearer.<token>`. Includes a DI-friendly factory for testing.

## Diagram
```mermaid
flowchart LR
  A[openWs(mkWs)] --> B{bearer provided?}
  B -- yes --> C[protocols = [duck.v1, bearer.<token>]]
  B -- no --> D[protocols = [duck.v1]]
  C --> E[return mkWs(url, protocols)]
  D --> E
```

## Notes
- Guard empty/undefined bearer.
- Keep pure: `openWs` returns a function that closes over `mkWs`.

## Related
- Handshake guard expects `duck.v1`.
