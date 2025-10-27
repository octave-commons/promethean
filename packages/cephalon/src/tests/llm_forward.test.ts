import { EventEmitter } from "events";

import test from "ava";
// import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Use memory broker via BrokerClient
// @ts-ignore dynamic import of JS modules

const clientModule = await import("@promethean-os/legacy/brokerClient.js");
const { BrokerClient } = clientModule;

const { AIAgent } = await import("../agent/index.js");
const { LLMService } = await import("../llm-service.js");
const { ContextStore } = await import(
  "@promethean-os/persistence/contextStore.js"
);

class StubBot extends EventEmitter {
  applicationId = "app";
  context = new ContextStore();
  currentVoiceSession = undefined;
}

test("AIAgent forwards prompt to LLM service via broker", async (t) => {
  process.env.NO_SCREENSHOT = "1";
  let received: any = null;
  process.env.BROKER_URL = "memory://llm";
  const worker = new BrokerClient({
    url: process.env.BROKER_URL,
    id: "llm-worker",
  });
  await worker.connect();
  worker.onTaskReceived(async (task: any) => {
    received = task.payload;
    await worker.ack(task.id);
    await worker.publish(task.payload.replyTopic, {
      reply: "ok",
      taskId: task.id,
    });
    await worker.ready(task.queue);
  });
  await worker.ready("llm.generate");

  const llm = new LLMService({ brokerUrl: process.env.BROKER_URL });
  const agent = new AIAgent({
    bot: new StubBot() as any,
    context: new ContextStore(),
    llm,
  });

  const reply = await agent.generateTextResponse("hello", {
    context: [{ role: "user", content: "hi" }],
  });
  t.is(reply, "ok");
  t.deepEqual(received.context[0].content, "hi");
  t.deepEqual(received.tools, []);

  worker.socket?.close();
});
