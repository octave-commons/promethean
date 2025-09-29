import test from "ava";
import { EnsoClient } from "../client.js";
import { EnsoServer } from "../server.js";
import { ContextRegistry } from "../registry.js";
import { connectLocal } from "../transport.js";
import { DEFAULT_PRIVACY_PROFILE } from "../types/privacy.js";
import type { HelloCaps } from "../types/privacy.js";
import type { Envelope } from "../types/envelope.js";

const HELLO: HelloCaps = {
  proto: "ENSO-1",
  caps: ["can.send.text"],
  privacy: { profile: "pseudonymous" },
};

const HELLO_WITHOUT_PRIVACY: HelloCaps = {
  proto: "ENSO-1",
  caps: ["can.send.text"],
};

test("local transport negotiates capabilities and emits presence", async (t) => {
  const server = new EnsoServer();
  const client = new EnsoClient(new ContextRegistry());
  const acceptedEvents: Envelope[] = [];
  const presenceEvents: Envelope[] = [];
  const presenceParts: Envelope[] = [];
  const handshakes: HelloCaps[] = [];
  server.on("handshake", (result: unknown) => {
    const { hello } = result as { hello: HelloCaps };
    handshakes.push(hello);
  });
  client.on("event:privacy.accepted", (env) => acceptedEvents.push(env));
  client.on("event:presence.join", (env) => presenceEvents.push(env));
  client.on("event:presence.part", (env) => presenceParts.push(env));

  const connection = await connectLocal(client, server, HELLO, {
    adjustCapabilities: (caps) => [...caps, "can.context.apply"],
    privacyProfile: "persistent",
    wantsE2E: true,
  });
  const { session } = connection;

  t.deepEqual(handshakes, [HELLO]);
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
  t.deepEqual(sessionInfo?.capabilities, [
    "can.send.text",
    "can.context.apply",
  ]);
  t.is(sessionInfo?.privacy, "persistent");

  const received: Envelope[] = [];
  server.register("content.post", (_ctx, env) => {
    received.push(env);
  });

  await client.post({
    role: "human",
    parts: [{ kind: "text", text: "hello" }],
  });
  t.is(received.length, 1);

  connection.disconnect();
  t.is(server.getSessionInfo(session.id), undefined);
  t.is(presenceParts.length, 1);
  t.like(presenceParts[0]?.payload, { session: session.id });
});

test("local transport preserves capability enforcement", async (t) => {
  const server = new EnsoServer();
  const client = new EnsoClient(new ContextRegistry());
  const connection = await connectLocal(client, server, HELLO);
  await t.throwsAsync(() => client.assets.putFile("/tmp/demo", "text/plain"), {
    message: /missing capability: can.asset.put/,
  });
  connection.disconnect();
});

test("local transport defaults privacy profile when omitted", async (t) => {
  const server = new EnsoServer();
  const client = new EnsoClient(new ContextRegistry());
  const acceptedEvents: Envelope[] = [];

  client.on("event:privacy.accepted", (env) => acceptedEvents.push(env));

  const connection = await connectLocal(client, server, HELLO_WITHOUT_PRIVACY);

  t.is(connection.accepted.payload.profile, DEFAULT_PRIVACY_PROFILE);
  t.false(connection.accepted.payload.wantsE2E);
  t.is(client.getPrivacyProfile(), DEFAULT_PRIVACY_PROFILE);
  const sessionInfo = server.getSessionInfo(connection.session.id);
  t.truthy(sessionInfo);
  t.is(sessionInfo?.privacy, DEFAULT_PRIVACY_PROFILE);

  const forwarded = acceptedEvents[0];
  t.truthy(forwarded);
  if (forwarded) {
    const payload = forwarded.payload as { profile: string };
    t.is(payload.profile, DEFAULT_PRIVACY_PROFILE);
  }

  connection.disconnect();
});

test("client connect emits default privacy when omitted", async (t) => {
  const client = new EnsoClient(new ContextRegistry());
  const acceptedEvents: Envelope[] = [];
  client.on("event:privacy.accepted", (env) => acceptedEvents.push(env));

  await client.connect(HELLO_WITHOUT_PRIVACY);

  t.is(client.getPrivacyProfile(), DEFAULT_PRIVACY_PROFILE);
  const accepted = acceptedEvents[0];
  t.truthy(accepted);
  if (accepted) {
    const payload = accepted.payload as {
      requested: HelloCaps;
      profile: string;
    };
    t.is(payload.profile, DEFAULT_PRIVACY_PROFILE);
    t.deepEqual(payload.requested.privacy, {
      profile: DEFAULT_PRIVACY_PROFILE,
    });
  }
});
