export function resolveFrameDurationMs(channel) {
  if (!channel?.protocol) return 20;
  const match = /frame(?:Duration)?(?:Ms)?=(\d+)/i.exec(channel.protocol);
  if (!match) return 20;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) && value > 0 ? value : 20;
}

export function createVoiceForwarder({
  client,
  streamId,
  room,
  frameDurationMs = 20,
  codec = "pcm16le/16000/1",
}) {
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
      pts += frameDurationMs;
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
