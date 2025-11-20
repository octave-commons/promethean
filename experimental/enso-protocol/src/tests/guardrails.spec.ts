import test from "ava";
import { randomUUID } from "node:crypto";
import { EnsoClient } from "../client.js";
import { EnsoServer } from "../server.js";
import { ContextRegistry } from "../registry.js";
import { connectLocal } from "../transport.js";
import type { Envelope } from "../types/envelope.js";
import { ACT_INTENT_DESCRIPTORS } from "../types/intents.js";

function toolCallEnvelope(callId: string) {
  return {
    id: randomUUID(),
    ts: new Date().toISOString(),
    room: "local",
    from: "tester",
    kind: "event" as const,
    type: "tool.call" as const,
    payload: {
      callId,
      provider: "native" as const,
      name: "demo",
      args: {},
    },
  } satisfies Envelope;
}

function intentEnvelope(callId: string) {
  return {
    id: randomUUID(),
    ts: new Date().toISOString(),
    room: "local",
    from: "tester",
    kind: "event" as const,
    type: "act.intent" as const,
    payload: {
      callId,
      intents: [ACT_INTENT_DESCRIPTORS.reduceSelfScope] as const,
    },
  } satisfies Envelope;
}

test("evaluation mode requires rationale and intent before tool call", async (t) => {
  const server = new EnsoServer();
  const client = new EnsoClient(new ContextRegistry());
  const toolCalls: Envelope[] = [];
  const violations: Envelope[] = [];
  server.register("tool.call", (_ctx, env) => {
    toolCalls.push(env);
  });
  client.on("event:guardrail.violation", (env) => violations.push(env));

  const connection = await connectLocal(client, server, {
    proto: "ENSO-1",
    caps: ["can.tool.call"],
    privacy: { profile: "pseudonymous" },
  });
  const { session } = connection;
  server.enableEvaluationMode(session.id, true);

  const callId = randomUUID();
  await client.send(toolCallEnvelope(callId));
  t.is(toolCalls.length, 0);
  t.is(violations.length, 1);
  t.like(violations[0]?.payload, { reason: "missing-rationale", callId });

  const rationaleEnvelope: Envelope<{ callId: string; rationale: string }> = {
    id: randomUUID(),
    ts: new Date().toISOString(),
    room: "local",
    from: "tester",
    kind: "event",
    type: "act.rationale",
    payload: { callId, rationale: "Need insight" },
  };
  await client.send(rationaleEnvelope);
  await client.send(toolCallEnvelope(callId));
  t.is(toolCalls.length, 0);
  t.is(violations.length, 2);
  t.like(violations[1]?.payload, { reason: "missing-intent", callId });

  await client.send(intentEnvelope(callId));
  await client.send(toolCallEnvelope(callId));
  t.is(toolCalls.length, 1);
  t.is(violations.length, 2);

  connection.disconnect();
});
