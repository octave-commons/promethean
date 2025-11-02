import test from "ava";
import { InMemoryEventBus } from "@promethean-os/event/memory.js";
import { GatewayPublisher } from "@promethean-os/discord";

test("publishes raw and normalized events to bus", async (t) => {
  const bus = new InMemoryEventBus();
  const pub = new GatewayPublisher(bus);
  let rawSeen = false;
  let normSeen = false;
  await bus.subscribe(
    "promethean.p.discord.t.duck.gateway.raw",
    "g1",
    async () => {
      rawSeen = true;
    },
  );
  await bus.subscribe(
    "promethean.p.discord.t.duck.events.SocialMessageCreated",
    "g2",
    async () => {
      normSeen = true;
    },
  );

  const raw = {
    id: "m1",
    author: { id: "u1" },
    channel_id: "c1",
    content: "hi",
    attachments: [],
    timestamp: new Date().toISOString(),
  };
  await pub.publishRaw("discord", "duck", raw);
  await pub.publishNormalized("discord", "duck", raw);
  t.true(rawSeen);
  t.true(normSeen);
});
