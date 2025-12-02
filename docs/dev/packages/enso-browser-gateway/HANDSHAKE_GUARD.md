# enso-browser-gateway — Signaling bridge

Status: ✅ refreshed for WebRTC voice streaming (2025-02-14).

The legacy "handshake guard" evolved into a WebSocket signaling bridge. It still performs
lightweight admission control (optional bearer token), but now its primary job is to bootstrap
a `wrtc` `RTCPeerConnection` for each browser client and wire the negotiated data channels into
ENSO.

## Diagram
```mermaid
sequenceDiagram
  participant UI as duck-web
  participant WS as /ws (WebSocket)
  participant PC as wrtc PeerConnection
  participant ENSO as EnsoClient

  UI->>WS: connect (?token optional)
  alt AUTH_TOKEN configured
    WS->>WS: validate query token
    opt invalid
      WS-->>UI: close(4403, "forbidden")
      return
    end
  end
  WS-->>UI: send {type:"ready"}
  UI->>WS: send {type:"offer", sdp}
  WS->>PC: setRemoteDescription(offer)
  WS->>PC: createAnswer()
  WS-->>UI: send {type:"answer", sdp}
  par ICE relay
    UI->>WS: {type:"ice", candidate}
    WS->>PC: addIceCandidate(candidate)
  and Data channels
    UI->>PC: createDataChannel('voice')
    PC-->>WS: ondatachannel('voice')
    WS->>ENSO: createVoiceForwarder(streamId, room)
    UI->>WS: PCM16 frames over 'voice'
    WS->>ENSO: forward(seq, pts, data)
    ENSO-->>WS: content.post events
    WS-->>UI: RTCDataChannel 'events'
  end
```

## Notes
- Gateway instantiates a dedicated `EnsoClient` per browser to isolate rooms and streams.
- Voice frames are expected as PCM16 mono 16 kHz; EOF is emitted when the `voice` channel closes.
- Optional `audio` data channel is reserved for future TTS streaming back to the browser.
- Closing the WebSocket tears down the peer connection and forwards EOF to ENSO.

## Related
- `resolveFrameDurationMs` reads the negotiated frame duration from `channel.protocol`.
- Voice forwarder (`VOICE_FORWARDER.md`) documents sequencing, PTS, and codec handling.
- Signaling helper (duck-web) aligns with the JSON protocol described here.
