# duck-web — PCM16k AudioWorklet + Mic Glue

Status: 🔧 under fix in PR #1443.

Downsamples float32 @48kHz to mono 16kHz using a box filter per output sample; emits variable-length chunks to main thread for PCM16 conversion.

## Diagram
```mermaid
flowchart TD
  A[Mic @48kHz stereo?] --> B[AudioWorkletNode('pcm16k')]
  B --> C[Processor: ratio=48k/16k, pos += outLen*ratio]
  C --> D[box-filter average over input window]
  D --> E[postMessage(Float32Array mono @16k)]
  E --> F[Main thread: float32ToInt16 -> Int16Array]
  F --> G[Voice pipeline (seq/pts)]
```

## Notes
- Track fractional `pos` to avoid drift.
- Clamp & convert via `duck-audio` helpers.
- Timestamp with `performance.now()` for stability.

## Related
- duck-audio helpers — `clamp16`, `float32ToInt16`.
- Voice forwarder expects PCM16 chunks.
