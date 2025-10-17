import test from "ava";
import { FlowController } from "../flow.js";
import type { StreamFrame } from "../types/streams.js";

function frame(overrides: Partial<StreamFrame> = {}): StreamFrame {
  return {
    streamId: "V1",
    codec: "opus/48000/2",
    seq: 1,
    pts: Date.now(),
    data: new Uint8Array([1]),
    ...overrides,
  };
}

test("flow controller emits nack for gaps", (t) => {
  const controller = new FlowController("lab");
  controller.register("V1", 1);

  t.deepEqual(controller.handleFrame(frame({ seq: 1 })), []);
  const events = controller.handleFrame(frame({ seq: 4 }));
  t.is(events.length, 1);
  t.is(events[0]?.type, "flow.nack");
  t.deepEqual(events[0]?.payload, { streamId: "V1", missing: [2, 3] });
});

test("flow controller pause and resume", (t) => {
  const controller = new FlowController("lab");
  controller.register("V1", 0);
  const pauseEnvelope = controller.pause("V1");
  t.truthy(pauseEnvelope);
  t.is(pauseEnvelope?.type, "flow.pause");
  const resumeEnvelope = controller.resume("V1");
  t.truthy(resumeEnvelope);
  t.is(resumeEnvelope?.type, "flow.resume");
});

test("flow controller marks degraded streams", (t) => {
  const controller = new FlowController("lab");
  controller.register("V1", 0);
  const degraded = controller.markDegraded("V1");
  t.truthy(degraded);
  t.is(degraded?.type, "state.patch");
  t.deepEqual(degraded?.payload, { room: "lab", voice: { V1: "degraded" } });
});
