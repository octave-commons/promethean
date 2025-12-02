# duck-web — Throttled DataChannel Sender

Status: 🔧 under fix in PR #1445.

Backpressure-aware `RTCDataChannel` sender that waits on `bufferedamountlow` before sending more.

## Diagram
```mermaid
sequenceDiagram
  participant App
  participant Ch as RTCDataChannel
  App->>Ch: set bufferedAmountLowThreshold = T
  loop send loop
    App->>Ch: if bufferedAmount > T then wait for event
    Ch-->>App: bufferedamountlow
    App->>Ch: send(chunk)
  end
```

## Notes
- Default threshold ~1 MiB (`1<<20`); make configurable.
- Pure factory returns an async function; ignore sends if channel not open.

## Related
- Voice forwarder frames pipeline.
