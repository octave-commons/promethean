# Duck Revival — System Diagrams

## 1) Architecture (high level)
```mermaid
flowchart LR
  subgraph Browser[duck-web]
    MIC[Mic capture (MediaStream)]
    DSP[ScriptProcessor 48k → 16k mono]
    PCM[duck-audio float→PCM16]
    VOICE[RTCDataChannel 'voice']
    EVENTS[RTCDataChannel 'events']
    SIGNAL[WebSocket signaling]
    AUDIO[RTCDataChannel 'audio' (optional playback)]
  end
  subgraph Gateway[enso-browser-gateway]
    WS[Signaling WS (token?)]
    PC[wrtc RTCPeerConnection]
    VF[Voice Forwarder (seq/pts)]
    ENSO[EnsoClient voice/text]
  end
  subgraph Cephalon[cephalon/enso]
    ROOM[voice room + timeline]
  end

  MIC --> DSP --> PCM --> VOICE
  SIGNAL --> WS --> PC
  VOICE --> PC
  PC --> VF --> ENSO --> ROOM
  ENSO -->|content.post| EVENTS
  PC --> AUDIO
```

## 2) Signaling + media negotiation (sequence)
```mermaid
sequenceDiagram
  participant UI as duck-web UI
  participant WS as signaling WebSocket
  participant PC as wrtc PeerConnection
  participant GW as gateway bridge

  UI->>WS: new WebSocket(url[?token])
  GW-->>WS: onopen → send {type:"ready"}
  UI->>PC: createOffer()
  UI->>WS: send {type:"offer", sdp}
  WS->>GW: JSON message
  GW->>PC: setRemoteDescription(offer)
  GW->>PC: createAnswer()
  GW->>WS: send {type:"answer", sdp}
  WS->>UI: JSON answer
  UI->>PC: setRemoteDescription(answer)
  par ICE
    UI->>WS: send {type:"ice", candidate}
    WS->>GW: relay candidate
    GW->>PC: addIceCandidate(candidate)
  and Voice channel
    UI->>PC: createDataChannel('voice')
    PC->>GW: ondatachannel('voice')
    GW->>VF: bind streamId/room
    UI->>GW: send PCM16 chunks
    GW->>VF: forward(seq, pts, data)
  end
```

## 3) Audio capture + downsampling
```mermaid
flowchart LR
  Start[MediaStream 48k stereo] --> Ctx[AudioContext + ScriptProcessor]
  Ctx --> Win[Iterate 4096-frame buffers]
  Win --> Avg[Average stereo → mono frames]
  Avg --> Dec[Decimate by factor 3]
  Dec --> Clamp[clampUnitFloat]
  Clamp --> PCM[floatToPcm16 → Int16Array]
  PCM --> Chunk[enqueue Uint8Array to ReadableStream]
```

## 4) Process-as-code pipeline
```mermaid
flowchart LR
  TASKS[tasks/*.md frontmatter]
  CLI[kanban CLI]
  BOARD[boards/*.md]
  GH[GitHub API]
  PRs[Pull Requests]
  CI[.github/workflows/kanban-sync.yml]

  TASKS --> CLI --> BOARD
  CI --> CLI
  CLI --> GH --> PRs
  CLI -.checklists.-> PRs
```
