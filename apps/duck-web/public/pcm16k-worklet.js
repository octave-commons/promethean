const TARGET_SAMPLE_RATE = 16_000;
const EPSILON = 1e-6;

class PCM16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / TARGET_SAMPLE_RATE;
    this.offset = 0;
    this.tail = new Float32Array(0);
  }

  process(inputs) {
    const channels = inputs[0];
    if (!channels || channels.length === 0) {
      return true;
    }

    const frameLength = channels[0]?.length ?? 0;
    if (!frameLength) {
      return true;
    }

    const mono = new Float32Array(frameLength);
    for (let frame = 0; frame < frameLength; frame += 1) {
      let sum = 0;
      let count = 0;
      for (let ch = 0; ch < channels.length; ch += 1) {
        const data = channels[ch];
        if (!data) {
          continue;
        }
        sum += data[frame] ?? 0;
        count += 1;
      }
      mono[frame] = count > 0 ? sum / count : 0;
    }

    let data;
    if (this.tail.length > 0) {
      data = new Float32Array(this.tail.length + mono.length);
      data.set(this.tail, 0);
      data.set(mono, this.tail.length);
    } else {
      data = mono;
    }

    let pos = this.offset;
    const total = data.length;
    const ratio = this.ratio;
    const frames = [];

    while (pos + ratio <= total + EPSILON) {
      let remaining = ratio;
      let cursor = pos;
      let acc = 0;

      while (remaining > 0 && cursor < total) {
        const index = Math.floor(cursor);
        const sample = data[index] ?? 0;
        const frac = cursor - index;
        const available = Math.min(1 - frac, remaining);
        acc += sample * available;
        remaining -= available;
        cursor = index + 1;
      }

      frames.push(acc / ratio);
      pos += ratio;
    }

    const keepIndex = Math.max(0, Math.floor(pos));
    if (keepIndex < total) {
      const tail = new Float32Array(total - keepIndex);
      tail.set(data.subarray(keepIndex));
      this.tail = tail;
      this.offset = pos - keepIndex;
    } else {
      this.tail = new Float32Array(0);
      this.offset = Math.max(0, pos - total);
    }

    if (frames.length > 0) {
      this.port.postMessage(new Float32Array(frames));
    }

    return true;
  }
}

registerProcessor("pcm16k", PCM16kProcessor);
