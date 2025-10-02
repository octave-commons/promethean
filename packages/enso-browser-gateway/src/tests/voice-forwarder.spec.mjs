import test from "ava";
import {
  createVoiceForwarder,
  DEFAULT_FRAME_DURATION_MS,
} from "../voice-forwarder.mjs";

test("forwarder adds seq and monotonic pts for each frame", async (t) => {
  const frames = [];
  const client = {
    voice: {
      register: () => {},
      sendFrame: async (frame) => {
        frames.push(frame);
      },
    },
  };

  const forwarder = createVoiceForwarder({
    client,
    streamId: "stream-1",
    room: "room-1",
    frameDurationMs: 20,
  });

  await forwarder.handleChunk(Buffer.from([0, 1]));
  await forwarder.handleChunk(Buffer.from([2, 3]));
  await forwarder.handleClose();

  t.is(frames.length, 3);

  const [first, second, eof] = frames;
  t.deepEqual(first.data, new Uint8Array([0, 1]));
  t.is(first.seq, 0);
  t.is(first.pts, 0);

  t.deepEqual(second.data, new Uint8Array([2, 3]));
  t.is(second.seq, 1);
  t.is(second.pts, 20);
  t.true(second.pts > first.pts);

  t.is(eof.eof, true);
  t.is(eof.seq, 2);
  t.is(eof.pts, 40);
  t.deepEqual(eof.data, new Uint8Array(0));

  t.is(forwarder.getFrameDurationMs(), DEFAULT_FRAME_DURATION_MS);
});
