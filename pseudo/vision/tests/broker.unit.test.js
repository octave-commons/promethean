import test from "ava";
import {
  getMemoryBroker,
  resetMemoryBroker,
} from "@promethean/test-utils/broker.js";

test("memory broker task produces vision-capture event", async (t) => {
  resetMemoryBroker("vision");
  process.env.NODE_ENV = "test"; // keep heartbeat off
  process.env.VISION_STUB = "1"; // use stub capture
  process.env.BROKER_URL = "memory://vision";
  process.env.VISION_ENABLE_BROKER_TEST = "1";

  const { start, stop } = await import("../index.js");
  try {
    await start(0);
    const broker = getMemoryBroker("vision");
    broker.enqueue("vision-capture", { test: 1 });
    await new Promise((r) => setTimeout(r, 20));
    const pub = broker.logs.find(
      (l) => l.action === "publish" && l.data.type === "vision-capture",
    );
    t.truthy(pub, "published vision-capture event");
    t.is(pub.data.type, "vision-capture");
    t.is(pub.data.payload?.image, Buffer.from("stub").toString("base64"));
  } finally {
    const { stop } = await import("../index.js");
    await stop();
  }
});
