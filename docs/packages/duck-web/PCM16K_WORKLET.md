# duck-web — PCM16k capture pipeline

Status: ✅ updated for WebRTC streaming (2025-02-14).

Captures microphone audio at 48 kHz stereo, downsamples to 16 kHz mono via a `ScriptProcessorNode`,
then converts frames to PCM16 using `@promethean/duck-audio` utilities before enqueueing them into a
`ReadableStream` consumed by the `voice` RTCDataChannel.

## Diagram
```mermaid
flowchart TD
  Mic[MediaStream @48kHz stereo] --> Proc[AudioContext + ScriptProcessorNode(4096)]
  Proc --> Loop[for each onaudioprocess buffer]
  Loop --> Avg[averageStereoFrame(left,right)]
  Avg --> Dec[decimate by PCM48_TO_16_DECIMATION]
  Dec --> Clamp[clampUnitFloat(sample)]
  Clamp --> PCM[floatToPcm16 → Int16Array]
  PCM --> Chunk[enqueue Uint8Array into ReadableStream]
  Chunk --> Voice[RTCDataChannel 'voice']
```

## Notes
- ScriptProcessorNode keeps compatibility across browsers until AudioWorklets are rolled out.
- Fractional positions are implicit in buffer stepping; 4096 frames cleanly divide into 320-sample chunks.
- `floatToPcm16` wraps the guard rails from `duck-audio` so peaks stay within int16 bounds.
- Callers close the processor + `AudioContext` when the mic pump aborts.

## Related
- duck-audio helpers — `averageStereoFrame`, `clampUnitFloat`, `floatToPcm16`.
- Voice forwarder expects PCM16 chunks sized for the negotiated frame duration.
