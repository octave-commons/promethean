import { float32ToInt16 } from "@promethean/duck-audio/src/pcm.js";

export type OnPcm = (pcm: Int16Array, tstampMs: number) => void;

type MicHandle = { stop: () => Promise<void>; ctx: AudioContext };

/**
 * Wire the AudioWorklet-based microphone capture pipeline.
 *
 * The `pcm16k` worklet emits 16 kHz mono Float32 frames, which are converted to
 * signed 16-bit PCM samples before invoking the callback with a monotonic
 * timestamp from `performance.now()`.
 */
export const startMic = async (onPcm: OnPcm): Promise<MicHandle> => {
  const ctx = new AudioContext({ sampleRate: 48000 });
  await ctx.audioWorklet.addModule("/pcm16k-worklet.js");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, "pcm16k");

  node.port.onmessage = (event) => {
    const floatBuffer = event.data as Float32Array;
    if (!(floatBuffer instanceof Float32Array)) {
      return;
    }

    const pcm = float32ToInt16(floatBuffer);
    onPcm(pcm, performance.now());
  };

  source.connect(node);

  const stop = async () => {
    node.port.onmessage = null;
    node.disconnect();
    source.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    await ctx.close();
  };

  return { stop, ctx };
};
