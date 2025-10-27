# enso-browser-gateway — Voice Forwarder (seq/pts, EOF)

Status: ✅ verified for WebRTC voice (2025-02-14).

Bridges PCM16 frames received on the `voice` RTCDataChannel into ENSO voice rooms. Maintains
monotonic sequence numbers and presentation timestamps (PTS) per frame and emits an EOF marker when
the browser closes the channel.

## Diagram
```mermaid
flowchart TD
  In[RTCDataChannel 'voice'] --> Norm[resolveFrameDurationMs(protocol)]
  Norm --> Loop[for each chunk]
  Loop --> Seq[seq++ per frame]
  Seq --> Pts[pts += frameDurationMs]
  Pts --> Send[client.voice.sendFrame({seq, pts, data, codec})]
  Close[onclose/onerror] --> EOF[send eof frame with empty payload]
```

## Notes
- `codec` defaults to `pcm16le/16000/1`; caller can override when wiring the forwarder.
- Frame duration is clamped into `[5, 200]` ms; invalid protocol values fall back to 20 ms.
- `handleChunk` accepts `Uint8Array` or `ArrayBuffer` and normalizes into a view without copying.
- EOF emission is idempotent to handle duplicate close/error events.

## Related
- Signaling bridge wires the forwarder when the `voice` channel is announced.
- duck-web capture pipeline produces PCM16 frames that match the negotiated cadence.
