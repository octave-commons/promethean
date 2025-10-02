# Voice Forwarder

Small utility in `enso-browser-gateway` to forward audio frames with sequence numbers, presentation timestamps (PTS), and EOF framing.

## Frame duration detection
We attempt to read a `frameDurationMs=<N>` token from the channel protocol string. When unavailable or out of range, we **fallback to 20ms**.

```ts
const value = Number.parseInt(match[1], 10);
if (!Number.isFinite(value) || value < 5 || value > 200) return 20;
return value;
```

## Lifecycle
- Register the stream with the client immediately: `client.voice.register(streamId, 0)`.
- Emit EOF when done. If the protocol supports deregistration, call it on completion.

## Notes
- Browser support for `RTCDataChannel.protocol` varies; document the fallback and keep metrics to confirm the observed frame cadence.
