import test from "ava";
import { randomUUID } from "node:crypto";

import { createEnsoChatAgent } from "../enso/chat-agent.js";

test("enso tool calls require rationales in evaluation mode", async (t) => {
  const agent = createEnsoChatAgent({ room: "duck:test:rationale" });
  await agent.connect();

  const server = agent.getLocalServer();
  t.truthy(server, "expected local Enso server when running in-memory");

  let sessionId = agent.getSessionId();

  // Wait a moment for session to be established
  if (!sessionId) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    sessionId = agent.getSessionId();
  }

  t.truthy(sessionId, "session id should be captured for evaluation toggles");

  const client: any = (agent as any).client;
  const violations: any[] = [];
  client.on("event:guardrail.violation", (env: any) => {
    violations.push(env);
  });

  const toolCalls: any[] = [];
  server!.register("tool.call", (_ctx, env) => {
    toolCalls.push(env);
  });

  server!.enableEvaluationMode(sessionId!, true);
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.true(agent.isEvaluationMode(), "agent should observe evaluation mode flag");

  const violatingCallId = randomUUID();
  await client.send({
    id: randomUUID(),
    ts: new Date().toISOString(),
    room: "duck:test:rationale",
    from: "spec",
    kind: "event",
    type: "tool.call",
    payload: {
      callId: violatingCallId,
      provider: "native",
      name: "duck.ping",
      args: {},
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 10));
  t.is(
    toolCalls.length,
    0,
    "guardrail should block tool call without rationale",
  );
  t.is(violations.length, 1, "missing rationale should raise violation");
  t.is(violations[0]?.payload?.callId, violatingCallId);

  violations.length = 0;

  const compliantCallId = await agent.callTool({
    provider: "native",
    name: "duck.ping",
    args: { echo: "eval" },
    reason: "Verify connectivity for evaluation request.",
  });

  await new Promise((resolve) => setTimeout(resolve, 10));

  t.is(violations.length, 0, "compliant call should not raise violations");
  t.true(
    toolCalls.some((env) => env.payload?.callId === compliantCallId),
    "server should receive compliant tool call",
  );

  const rationaleEnvelope = server!
    .getComplianceLog()
    .find(
      (env) =>
        env.type === "act.rationale" &&
        (env.payload as any)?.callId === compliantCallId,
    );
  t.truthy(rationaleEnvelope, "compliant call should log rationale envelope");
  const rationaleText = (rationaleEnvelope?.payload as any)?.rationale ?? "";
  t.true(
    rationaleText.includes("Morganna guardrail decision rubric"),
    "rationale text should reference Morganna decision rubric",
  );

  await agent.dispose();
});
