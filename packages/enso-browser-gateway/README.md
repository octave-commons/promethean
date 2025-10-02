# @promethean/enso-browser-gateway

This gateway bridges browser WebRTC peers with an ENSO runtime over WebSockets.

## Handshake behaviour

On every browser connection the gateway opens an ENSO WebSocket session using
the `ENSO-1` protocol descriptor. The gateway waits for the ENSO handshake to
complete before delivering text or tool payloads to the browser data channels.

If the ENSO handshake fails or exceeds the readiness timeout, the gateway sends
an error envelope to the browser client before closing the WebSocket:

```json
{"type":"error","reason":"<error message>"}
```

The browser can rely on receiving this message before the socket closes when
handshake problems occur, allowing deterministic UI feedback for slow or failed
sessions.
