# enso-browser-gateway — Voice Forwarder (seq/pts, EOF)

Status: ✅ implemented in PR #1448.

Maintains monotonic sequence numbers and presentation timestamps (PTS) for voice frames; emits EOF frame when stream completes.

## Diagram
```mermaid
flowchart TD
  A[RTC Track Frame] --> B{Parse frameDurationMs
from channel.protocol}
  B -- valid (5-200ms) --> C[use parsed value]
  B -- invalid/missing --> D[default 20ms]
  C --> E[calc PTS += frameDuration]
  D --> E
  E --> F[emit {seq, pts, payload}]
  G[stop/close] --> H[emit EOF]
```

## Notes
- Document the protocol expectation; browsers may not set `channel.protocol` consistently.
- Clamp parsed duration into [5,200]ms; else fallback to 20ms.

## Related
- PCM16k worklet + mic glue (duck-web).
- Handshake guard — gating start.
