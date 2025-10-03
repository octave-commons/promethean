import { PassThrough, Transform, TransformCallback } from "node:stream";
import { randomUUID } from "node:crypto";

import type { User } from "discord.js";

import { Transcriber, type TranscriptChunk } from "../transcriber.js";
import type { Speaker } from "../speaker.js";

import {
  EnsoClient,
  connectWebSocket,
  createNodeAudioCapture,
  pumpAudioFrames,
  type HelloCaps,
  type Envelope,
  type ChatMessage,
} from "@promethean/enso-protocol";

/**
 * Downmix 48k stereo PCM16LE to 16k mono PCM16LE using simple box filter decimation (3:1).
 * - Input: interleaved int16 [L,R] at 48000 Hz
 * - Output: int16 mono at 16000 Hz
 */
export class ToPcm16kMono extends Transform {
  private carry: Int16Array = new Int16Array(0);
  constructor() {
    super({
      readableHighWaterMark: 64 * 1024,
      writableHighWaterMark: 64 * 1024,
    });
  }
  override _transform(
    chunk: Buffer,
    _enc: BufferEncoding,
    cb: TransformCallback,
  ): void {
    // Interpret as int16 samples
    const inSamplesTotal = this.carry.length + (chunk.length >>> 1);
    // Each stereo frame = 2 samples; 3 frames -> 6 samples -> 1 output sample
    const usableSamples = Math.floor(inSamplesTotal / 6) * 6;
    // Merge carry + incoming into a single Int16Array view without extra copies when possible
    const incoming = new Int16Array(
      chunk.buffer,
      chunk.byteOffset,
      chunk.length >>> 1,
    );
    let merged: Int16Array;
    if (this.carry.length === 0) {
      merged = incoming;
    } else {
      merged = new Int16Array(this.carry.length + incoming.length);
      merged.set(this.carry, 0);
      merged.set(incoming, this.carry.length);
    }

    const outCount = Math.floor(usableSamples / 6);
    const out = new Int16Array(outCount);
    let oi = 0;
    for (let i = 0; i < usableSamples; i += 6) {
      // Three consecutive stereo frames: (L0,R0),(L1,R1),(L2,R2)
      const l0 = merged[i] ?? 0;
      const r0 = merged[i + 1] ?? 0;
      const l1 = merged[i + 2] ?? 0;
      const r1 = merged[i + 3] ?? 0;
      const l2 = merged[i + 4] ?? 0;
      const r2 = merged[i + 5] ?? 0;
      // Downmix each to mono then average across 3 samples for crude LPF before decimation
      const m0 = (l0 + r0) / 2;
      const m1 = (l1 + r1) / 2;
      const m2 = (l2 + r2) / 2;
      const averaged = (m0 + m1 + m2) / 3;
      // clamp to int16
      const clamped = Math.max(-32768, Math.min(32767, averaged));
      out[oi++] = clamped | 0;
    }
    // Save remainder into carry
    const rem = merged.length - usableSamples;
    if (rem > 0) {
      this.carry = merged.slice(usableSamples);
    } else {
      this.carry = new Int16Array(0);
    }
    cb(null, Buffer.from(out.buffer, out.byteOffset, out.byteLength));
  }
  override _flush(cb: TransformCallback): void {
    // Drop incomplete remainder; optional: output one more sample
    this.carry = new Int16Array(0);
    cb();
  }
}

export type EnsoTranscriberOptions = {
  /** ENSO ws:// URL. If omitted, defaults to process.env.ENSO_WS_URL or ws://localhost:7766 */
  url?: string;
  /** Room prefix for per-utterance isolation */
  roomPrefix?: string;
};

/**
 * Transcriber implementation that publishes PCM frames as ENSO `voice.frame` stream
 * and awaits a `content.post` with the transcript in the same room.
 */
export class EnsoTranscriber extends Transcriber {
  private client: EnsoClient;
  private wsHandle: {
    close: (code?: number, reason?: string) => Promise<void>;
  } | null = null;
  private readonly url: string;
  private readonly roomPrefix: string;
  private readonly handshake: Promise<void>;

  constructor(opts: EnsoTranscriberOptions = {}) {
    // Provide a noop broker to avoid legacy broker wiring in base class
    super({
      broker: { enqueue() {}, subscribe() {}, connect: async () => {} } as any,
    });
    this.url = opts.url ?? process.env.ENSO_WS_URL ?? "ws://localhost:7766";
    this.roomPrefix = opts.roomPrefix ?? "voice";
    this.client = new EnsoClient();
    // Connect immediately; throw if handshake fails
    const hello: HelloCaps = {
      proto: "ENSO-1",
      caps: ["can.voice.stream", "can.send.text"],
      agent: { name: "cephalon-duck", version: "0.1.0" },
    };
    const handle = connectWebSocket(this.client, this.url, hello);
    this.handshake = handle.ready.catch((error) => {
      this.emit("error", error);
      throw error;
    });
    this.wsHandle = { close: handle.close };
  }

  override transcribePCMStream(
    startTime: number,
    speaker: Speaker,
    pcmStream: PassThrough,
  ) {
    this.emit("transcriptStart", { startTime, speaker });

    const streamId = randomUUID();
    const room = `${this.roomPrefix}:${speaker.user.id}:${startTime}`;

    const downmix = new ToPcm16kMono();
    const transformed = pcmStream.pipe(downmix);

    // Set up a one-shot listener for a transcript message in this room
    const off = this.client.on("event:content.post", (env: Envelope) => {
      if (env.room !== room) return;
      const payload = env.payload as { message?: ChatMessage } | undefined;
      const parts = payload?.message?.parts ?? [];
      const firstText = parts.find((p: any) => p?.kind === "text");
      const text = (firstText as any)?.text ?? "";
      const endTime = Date.now();
      const chunk: TranscriptChunk = { startTime, endTime, speaker, text };
      this.emit("transcriptChunk", chunk);
      this.emit("transcriptEnd", {
        startTime,
        endTime,
        speaker,
        user: speaker.user as unknown as User,
        userName: speaker.user.username,
        transcript: text,
        originalTranscript: text,
      });
      // ensure we don't handle multiple times for same utterance
      off();
    });

    // Capture and send frames
    const capture = createNodeAudioCapture({
      stream: transformed,
      streamId,
      codec: "pcm16le/16000/1",
      frameDurationMs: 20,
      bytesPerFrame: 640,
      emitEof: true,
    });

    const startPump = async () => {
      try {
        await this.handshake;
      } catch {
        off();
        const endTime = Date.now();
        this.emit("transcriptEnd", {
          startTime,
          endTime,
          speaker,
          user: speaker.user as any,
          userName: speaker.user.username,
          transcript: "",
          originalTranscript: "",
        });
        if (typeof (capture as any)?.destroy === "function") {
          (capture as any).destroy();
        }
        return;
      }
      // Register stream for flow control bookkeeping after handshake
      this.client.voice.register(streamId, 0);
      try {
        await pumpAudioFrames(capture, (frame) =>
          this.client.voice.sendFrame(frame, { room }),
        );
      } catch (err) {
        // Non-fatal: emit an end with empty transcript if upstream fails
        const endTime = Date.now();
        this.emit("transcriptEnd", {
          startTime,
          endTime,
          speaker,
          user: speaker.user as any,
          userName: speaker.user.username,
          transcript: "",
        });
        console.error("ENSO voice pump error", err);
      }
    };

    void startPump();

    return pcmStream;
  }

  async dispose(): Promise<void> {
    await this.wsHandle?.close();
    this.wsHandle = null;
  }
}

export function createEnsoTranscriber(opts: EnsoTranscriberOptions = {}) {
  return new EnsoTranscriber(opts);
}
