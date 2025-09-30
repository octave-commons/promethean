import test from "ava";
import { InMemoryEventBus } from "@promethean/event/memory.js";
import { GatewayPublisher } from "@promethean/discord";

test("publishes raw and normalized events to bus", async (t) => {
  const bus = new InMemoryEventBus();
  const pub = new GatewayPublisher(bus);
  let rawSeen = false;
  let normSeen = false;
  let resolveRaw!: () => void;
  const rawDelivered = new Promise<void>((resolve) => {
    resolveRaw = resolve;
  });
  let resolveNormalized!: () => void;
  const normalizedDelivered = new Promise<void>((resolve) => {
    resolveNormalized = resolve;
  });
  await bus.subscribe(
    "promethean.p.discord.t.duck.gateway.raw",
    "g1",
    async () => {
      rawSeen = true;
      resolveRaw();
    },
  );
  await bus.subscribe(
    "promethean.p.discord.t.duck.events.SocialMessageCreated",
    "g2",
    async () => {
      normSeen = true;
      resolveNormalized();
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
  await rawDelivered;
  await normalizedDelivered;
  t.true(rawSeen);
  t.true(normSeen);
});
