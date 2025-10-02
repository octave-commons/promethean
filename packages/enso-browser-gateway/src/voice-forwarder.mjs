const DEFAULT_FRAME_DURATION_MS = 20;
const MIN_FRAME_DURATION_MS = 5;
const MAX_FRAME_DURATION_MS = 200;

function normalizeFrameDurationMs(value) {
  if (!Number.isFinite(value)) return DEFAULT_FRAME_DURATION_MS;
  if (value < MIN_FRAME_DURATION_MS || value > MAX_FRAME_DURATION_MS) {
    return DEFAULT_FRAME_DURATION_MS;
  }
  return value;
}

export function resolveFrameDurationMs(channel) {
  if (!channel?.protocol) return DEFAULT_FRAME_DURATION_MS;
  const match = /frame(?:Duration)?(?:Ms)?=(\d+)/i.exec(channel.protocol);
  if (!match) return DEFAULT_FRAME_DURATION_MS;
  const value = Number.parseInt(match[1], 10);
  return normalizeFrameDurationMs(value);
}

export function createVoiceForwarder({
  client,
  streamId,
  room,
  frameDurationMs = DEFAULT_FRAME_DURATION_MS,
  codec = "pcm16le/16000/1",
}) {
  const resolvedFrameDurationMs = normalizeFrameDurationMs(frameDurationMs);

  client.voice.register(streamId, 0);
  let seq = 0;
  let pts = 0;
  let closed = false;

  async function send(frame) {
    await client.voice.sendFrame(
      {
        kind: "voice.frame",
        codec,
        streamId,
        ...frame,
      },
      { room },
    );
  }

  return {
    async handleChunk(chunk) {
      if (closed) return;
      const data = toUint8Array(chunk);
      if (data === null) return;
      const currentSeq = seq++;
      const currentPts = pts;
      pts += resolvedFrameDurationMs;
      await send({ seq: currentSeq, pts: currentPts, data });
    },
    async handleClose() {
      if (closed) return;
      closed = true;
      const data = new Uint8Array(0);
      await send({ seq: seq++, pts, data, eof: true });
    },
  };
}

function toUint8Array(chunk) {
  if (chunk instanceof Uint8Array) {
    const isBuffer = typeof Buffer !== "undefined" && Buffer.isBuffer?.(chunk);
    if (isBuffer) {
      return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    }
    return chunk;
  }
  if (chunk instanceof ArrayBuffer) {
    return new Uint8Array(chunk);
  }
  return null;
}
