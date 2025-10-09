// Use the same target sample rate as shared constants
const TARGET_SAMPLE_RATE = 16000;
const EPSILON = 1e-6;

// Helper function to clamp PCM16 values to prevent overflow
const clampPCM16 = (value) => {
  if (value > 32767) return 32767;
  if (value < -32768) return -32768;
  return Math.round(value);
};

// Helper function to convert float to PCM16
const floatToPCM16 = (value) => {
  // Clamp to [-1, 1] first to prevent overflow
  const clamped = Math.max(-1, Math.min(1, value));
  return clampPCM16(clamped * 32767);
};

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
    }

    // Convert float32 array to PCM16 Int16 array using shared conversion logic
    const pcm16Array = new Int16Array(frames.length);
    for (let i = 0; i < frames.length; i++) {
      pcm16Array[i] = floatToPCM16(frames[i]);
    }
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
      // Send PCM16 Int16Array instead of Float32Array
      this.port.postMessage(pcm16Array);
    }

    return true;
  }
}

registerProcessor("pcm16k", PCM16kProcessor);
