import { float32ToInt16 } from "@promethean/duck-audio/src/pcm.js";

export type OnPcm = (pcm: Int16Array, tstampMs: number) => void;

type MicHandle = { stop: () => Promise<void>; ctx: AudioContext };

/**
 * Wire the AudioWorklet-based microphone capture pipeline.
 *
 * The `pcm16k` worklet emits 16 kHz mono Float32 frames (chunk size may vary,
 * but frames are sequential with no gaps), which are converted to signed
 * 16-bit PCM samples before invoking the callback with a monotonic timestamp
 * from `performance.now()`.
 */
export const startMic = async (onPcm: OnPcm): Promise<MicHandle> => {
  const ctx = new AudioContext({ sampleRate: 48000 });
  await ctx.audioWorklet.addModule("/pcm16k-worklet.js");
  node.port.onmessage = (event) => {
    const floatBuffer = event.data as Float32Array;
    if (!(floatBuffer instanceof Float32Array)) return;
    const pcm = float32ToInt16(floatBuffer);
    // TODO: consider queueing if onPcm is slow
    onPcm(pcm, performance.now());
  };
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, "pcm16k");

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
      onPcm(next.pcm, next.tstampMs);
      scheduleDrain();
    });
  };

  node.port.onmessage = (event) => {
    const floatBuffer = event.data as Float32Array;
    if (!(floatBuffer instanceof Float32Array)) {
      return;
    }

    const pcm = float32ToInt16(floatBuffer);
    // TODO: consider queueing if onPcm is slow to avoid dropping frames.
    onPcm(pcm, performance.now());
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
