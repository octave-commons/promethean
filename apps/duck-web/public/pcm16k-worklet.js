class PCM16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.pos = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) {
      return true;
    }

    const r = this.ratio;
    const avail = Math.max(0, input.length - this.pos);
    const outLen = Math.floor(avail / r);
    if (outLen <= 0) {
      this.pos = Math.min(input.length, Math.max(0, this.pos));
      return true;
    }

    const out = new Float32Array(outLen);
    for (let n = 0; n < outLen; n += 1) {
      const start = Math.floor(this.pos + n * r);
      const end = Math.min(input.length, Math.floor(this.pos + (n + 1) * r));
      let sum = 0;
      for (let k = start; k < end; k += 1) {
        sum += input[k] ?? 0;
      }
      out[n] = end > start ? sum / (end - start) : 0;
    }

    this.pos = Math.min(input.length, this.pos + Math.floor(outLen * r));

    this.port.postMessage(out);
    return true;
  }
}

registerProcessor("pcm16k", PCM16kProcessor);
