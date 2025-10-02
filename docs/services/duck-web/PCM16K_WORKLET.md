# PCM16k Audio Worklet

Downsample 48 kHz mono float frames to 16 kHz using box filtering with a carried fractional position to avoid drift.

## Contract
- Input: `Float32Array` (48kHz mono) from `AudioWorkletProcessor` inputs[0][0]
- Output: `Float32Array` (16kHz mono), variable chunk size, posted via `port.postMessage`
- Consumer converts to `Int16Array` via `float32ToInt16` from `@promethean/duck-audio`

## Minimal Processor
```js
class PCM16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.pos = 0;
  }
  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    const ratio = this.ratio;
    const outLen = Math.floor((input.length - this.pos) / ratio);
    if (outLen <= 0) return true;
    const out = new Float32Array(outLen);
    for (let n = 0; n < outLen; n++) {
      const start = Math.floor(this.pos + n * ratio);
      const end = Math.floor(this.pos + (n + 1) * ratio);
      let sum = 0; let count = 0;
      for (let k = start; k < end; k++) { sum += input[k] || 0; count++; }
      out[n] = count ? sum / count : 0;
    }
    this.pos += outLen * ratio;
    if (this.pos >= input.length) this.pos -= input.length;
    this.port.postMessage(out);
    return true;
  }
}
registerProcessor('pcm16k', PCM16kProcessor);
```

## Mic glue (browser)
```ts
node.port.onmessage = (evt) => {
  const float = evt.data as Float32Array;
  const pcm = float32ToInt16(float);
  onPcm(pcm, performance.now());
};
```

### Notes
- Track the fractional read position (`pos`) to prevent long-run drift.
- Keep all helpers **pure** and colocate types for reuse across Node/Web.