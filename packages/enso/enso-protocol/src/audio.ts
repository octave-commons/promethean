import { Buffer } from "node:buffer";
import { Readable } from "node:stream";
import type { StreamFrame } from "./types/streams.js";

export interface AudioCapture {
  frames: AsyncIterable<StreamFrame>;
  stop(): Promise<void>;
}

export interface NodeAudioCaptureOptions {
  stream: Readable;
  streamId?: string;
  codec?: StreamFrame["codec"];
  frameDurationMs?: number;
  bytesPerFrame?: number;
  startSeq?: number;
  basePts?: number;
  emitEof?: boolean;
}

const DEFAULT_CODEC: StreamFrame["codec"] = "pcm16le/16000/1";
const DEFAULT_FRAME_BYTES = 640; // 20ms of PCM16 at 16kHz mono
const DEFAULT_FRAME_DURATION = 20;

function toUint8Array(chunk: unknown): Uint8Array {
  if (chunk instanceof Uint8Array) {
    return chunk;
  }
  if (typeof chunk === "string") {
    return Uint8Array.from(Buffer.from(chunk, "utf8"));
  }
  if (chunk instanceof ArrayBuffer) {
    return new Uint8Array(chunk);
  }
  if (Buffer.isBuffer(chunk)) {
    return Uint8Array.from(chunk);
  }
  return new Uint8Array(0);
}

function concatBuffers(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length === 0) {
    return b;
  }
  if (b.length === 0) {
    return a;
  }
  const merged = new Uint8Array(a.length + b.length);
  merged.set(a, 0);
  merged.set(b, a.length);
  return merged;
}

export function createNodeAudioCapture(
  options: NodeAudioCaptureOptions,
): AudioCapture {
  const streamId = options.streamId ?? "mic";
  const codec = options.codec ?? DEFAULT_CODEC;
  const bytesPerFrame = options.bytesPerFrame ?? DEFAULT_FRAME_BYTES;
  const frameDurationMs = options.frameDurationMs ?? DEFAULT_FRAME_DURATION;
  const startSeq = options.startSeq ?? 0;
  const basePts = options.basePts ?? 0;
  let stopped = false;

  const frames = (async function* (): AsyncGenerator<
    StreamFrame,
    void,
    unknown
  > {
    let buffer = new Uint8Array(0);
    let seq = startSeq;
    for await (const chunk of options.stream) {
      if (stopped) {
        break;
      }
      buffer = concatBuffers(buffer, toUint8Array(chunk));
      while (buffer.length >= bytesPerFrame && !stopped) {
        const slice = buffer.slice(0, bytesPerFrame);
        buffer = buffer.slice(bytesPerFrame);
        const pts = basePts + (seq - startSeq) * frameDurationMs;
        yield { streamId, codec, seq, pts, data: slice } satisfies StreamFrame;
        seq += 1;
      }
    }
    if (!stopped && buffer.length > 0) {
      const pts = basePts + (seq - startSeq) * frameDurationMs;
      yield {
        streamId,
        codec,
        seq,
        pts,
        data: buffer,
        eof: options.emitEof !== false,
      } satisfies StreamFrame;
      seq += 1;
    } else if (!stopped && options.emitEof) {
      const pts = basePts + (seq - startSeq) * frameDurationMs;
      yield {
        streamId,
        codec,
        seq,
        pts,
        data: new Uint8Array(0),
        eof: true,
      } satisfies StreamFrame;
    }
  })();

  const stop = async (): Promise<void> => {
    if (stopped) {
      return;
    }
    stopped = true;
    if (typeof options.stream.pause === "function") {
      options.stream.pause();
    }
  };

  return { frames, stop };
}

export function createStaticCapture(frames: StreamFrame[]): AudioCapture {
  let stopped = false;
  const iterator = (async function* (): AsyncGenerator<
    StreamFrame,
    void,
    unknown
  > {
    for (const frame of frames) {
      if (stopped) {
        break;
      }
      yield frame;
    }
  })();
  const stop = async (): Promise<void> => {
    stopped = true;
  };
  return { frames: iterator, stop };
}

export async function pumpAudioFrames(
  capture: AudioCapture,
  sender: (frame: StreamFrame) => Promise<void>,
): Promise<void> {
  for await (const frame of capture.frames) {
    await sender(frame);
  }
}
