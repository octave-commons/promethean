import test from "ava";
import { EnsoClient } from "../client.js";
import { EnsoServer } from "../server.js";
import { ContextRegistry } from "../registry.js";
import { connectLocal } from "../transport.js";
import type { HelloCaps } from "../types/privacy.js";
import type { Envelope } from "../types/envelope.js";

const HELLO: HelloCaps = {
  proto: "ENSO-1",
  caps: ["can.send.text"],
  privacy: { profile: "pseudonymous" },
};

test("local transport negotiates capabilities and emits presence", async (t) => {
  const server = new EnsoServer();
  const client = new EnsoClient(new ContextRegistry());
  const acceptedEvents: Envelope[] = [];
  const presenceEvents: Envelope[] = [];
  const presenceParts: Envelope[] = [];
  client.on("event:privacy.accepted", (env) => acceptedEvents.push(env));
  client.on("event:presence.join", (env) => presenceEvents.push(env));
  client.on("event:presence.part", (env) => presenceParts.push(env));

  const connection = connectLocal(client, server, HELLO, {
    adjustCapabilities: (caps) => [...caps, "can.context.apply"],
    privacyProfile: "persistent",
    wantsE2E: true,
  });
  const { session } = connection;

  t.is(acceptedEvents.length, 1);
  t.is(presenceEvents.length, 1);
  const accepted = acceptedEvents[0]!;
  t.like(accepted.payload, {
    profile: "persistent",
    wantsE2E: true,
    negotiatedCaps: ["can.send.text", "can.context.apply"],
  });
  t.deepEqual(presenceEvents[0]?.payload, {
    session: session.id,
    caps: ["can.send.text", "can.context.apply"],
  });

  const sessionInfo = server.getSessionInfo(session.id);
  t.truthy(sessionInfo);
  t.deepEqual(sessionInfo?.capabilities, ["can.send.text", "can.context.apply"]);
  t.is(sessionInfo?.privacy, "persistent");

  const received: Envelope[] = [];
  server.register("content.post", (_ctx, env) => {
    received.push(env);
  });

  await client.post({ role: "human", parts: [{ kind: "text", text: "hello" }] });
  t.is(received.length, 1);

  connection.disconnect();
  t.is(server.getSessionInfo(session.id), undefined);
  t.is(presenceParts.length, 1);
  t.like(presenceParts[0]?.payload, { session: session.id });
});

test("local transport preserves capability enforcement", async (t) => {
  const server = new EnsoServer();
  const client = new EnsoClient(new ContextRegistry());
  const connection = connectLocal(client, server, HELLO);
  await t.throwsAsync(() => client.assets.putFile("/tmp/demo", "text/plain"), {
    message: /missing capability: can.asset.put/,
  });
  connection.disconnect();
});
