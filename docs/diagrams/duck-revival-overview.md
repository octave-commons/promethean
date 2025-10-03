# Duck Revival — System Diagrams

## 1) Architecture (high level)
```mermaid
flowchart LR
  subgraph Browser[duck-web]
    MIC[Mic]
    WKLT[PCM16k Worklet 48k→16k]
    CONV[float32→PCM16 (duck-audio)]
    SEND[Throttled DataChannel Sender]
    WS[openWs()]
    FLAGS[DUCK feature flags]
  end
  subgraph Gateway[enso-browser-gateway]
    HS[Handshake Guard]
    VF[Voice Forwarder (seq/pts/EOF)]
  end
  subgraph Cephalon[cephalon/enso]
    EVAL[guardrail rationale (morganna@1)]
  end

  MIC --> WKLT --> CONV --> SEND
  SEND --> WS --> HS --> VF -->|frames| Srv[Server / ASR]
  FLAGS -.gate.-> MIC
  HS -.gates.-> WS
  EVAL --> HS
```

## 2) Handshake + privacy gating (sequence)
```mermaid
sequenceDiagram
  participant UI as duck-web UI
  participant WS as openWs()
  participant GW as gateway (HandshakeGuard)
  participant VF as VoiceForwarder

  UI->>WS: open(url, ["duck.v1", (bearer.token?)])
  WS->>GW: connect
  GW->>GW: guard.wait(timeout=ENSO_HANDSHAKE_TIMEOUT_MS)
  UI->>UI: privacy.accepted?
  alt accepted
    UI->>Mic: startMic()
    Mic->>WKLT: 48k float frames
    WKLT->>UI: 16k float frames
    UI->>UI: float32→pcm16
    UI->>WS: send when guard.isReady()
    GW->>VF: forward (seq, pts)
  else denied/timeout
    GW->>WS: send error + close(1011)
  end
```

## 3) Audio downsampling details
```mermaid
flowchart LR
  In[AudioWorklet input 48k] --> Box[Box filter over ratio window]
  Box --> Pos[Update fractional pos]
  Pos --> Out[Float32Array 16k]
  Out --> PCM[int16 via float32ToInt16]
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
