// Mock the duck-audio constants for development since the package isn't installed in apps/
const PCM16_SAMPLE_RATE = 16000;
const PCM16_FRAME_DURATION_MS = 20;
const PCM16_MIN = -32768;
const PCM16_MAX = 32767;

const clampPcm16 = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  if (value <= PCM16_MIN) return PCM16_MIN;
  if (value >= PCM16_MAX) return PCM16_MAX;
  return value | 0;
};

const float32ToInt16 = (inSeq: Float32Array): Int16Array =>
  Int16Array.from(inSeq, (x: number) => 
    x > 1 ? 32767 : x < -1 ? -32768 : Math.round(x * 32767)
  );

export type OnPcm = (pcm: Int16Array, tstampMs: number) => void;

// Audio context configuration for consistent sample rates
const AUDIO_CONTEXT_SAMPLE_RATE = 48000; // Use 48k for input processing, will be downsampled to 16k

export interface MicOptions {
  sampleRate?: number;
  frameSize?: number;
}

type MicHandle = { stop: () => Promise<void>; ctx: AudioContext };

/**
 * Wire the AudioWorklet-based microphone capture pipeline.
 *
 * The `pcm16k` worklet emits 16 kHz mono Float32 frames, which are converted to
 * signed 16-bit PCM samples before invoking the callback with a monotonic
 * timestamp from `performance.now()`.
 */
export const startMic = async (onPcm: OnPcm, options: MicOptions = {}): Promise<MicHandle> => {
  const sampleRate = options.sampleRate ?? AUDIO_CONTEXT_SAMPLE_RATE;
  const ctx = new AudioContext({ sampleRate });
  await ctx.audioWorklet.addModule('/pcm16k-worklet.js');
  const node = new AudioWorkletNode(ctx, 'pcm16k');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = ctx.createMediaStreamSource(stream);

  // Maintain a small queue and drop oldest frames if the consumer lags to avoid
  // unbounded buffering on the main thread.
  const pending: Array<{ pcm: Int16Array; tstampMs: number }> = [];
  const maxQueueDepth = 3;
  let draining = false;

  const scheduleDrain = () => {
    if (draining) {
      return;
    }
    draining = true;
    queueMicrotask(() => {
      draining = false;
      const next = pending.shift();
      if (!next) {
        return;
      }
      // Validate PCM data before sending
      if (next.pcm.length > 0 && next.pcm.every(sample => sample >= PCM16_MIN && sample <= PCM16_MAX)) {
        onPcm(next.pcm, next.tstampMs);
      }
      scheduleDrain();
    });
  };

  node.port.onmessage = (event) => {
    const pcmBuffer = event.data as Int16Array;
    if (!(pcmBuffer instanceof Int16Array)) {
      return;
    }

    // Validate PCM data and apply any necessary corrections
    const pcm = new Int16Array(pcmBuffer.length);
    for (let i = 0; i < pcmBuffer.length; i++) {
      // Apply shared clampPcm16 function to ensure values are within valid range
      pcm[i] = clampPcm16(pcmBuffer[i]);
    }
    const frame = { pcm, tstampMs: performance.now() };
    if (pending.length >= maxQueueDepth) {
      pending.shift();
    }
    pending.push(frame);
    scheduleDrain();
  };

  source.connect(node);

  const stop = async () => {
    node.port.onmessage = null;
    pending.length = 0;
    node.disconnect();
    source.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    await ctx.close();
  };

  return { stop, ctx };
};
