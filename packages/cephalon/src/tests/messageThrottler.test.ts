import test from "ava";
import { sleep } from "@promethean/utils";

import { AIAgent } from "../agent.js";
import type { Bot } from "../bot.js";
// avoid compile-time coupling to ContextStore type
import { initMessageThrottler } from "../messageThrottler.js";
process.env.DISABLE_AUDIO = "1";

// @ts-ignore dynamic import of JS module without types
const brokerModule = await import("@promethean/broker");
const { start: startBroker, stop: stopBroker } = brokerModule;

test.skip("throttles tick interval based on messages", async (t) => {
  const context = {} as any;
  const bot = { context } as unknown as Bot;
  const agent = new AIAgent({ bot, context });
  const broker = await startBroker(0);
  const port = broker.address().port;
  const client = await initMessageThrottler(agent, `ws://127.0.0.1:${port}`);

  // Ensure client is connected before publishing
  await new Promise((resolve) => client.socket?.once("open", resolve));

  for (let i = 0; i < 5; i++) {
    client.publish("test", {});
  }
  await sleep(1100);
  client.publish("test", {});
  t.true((agent as any).tickInterval > 100);

  // Cleanup
  if (client?.socket?.readyState === 1) client.disconnect();
  if (broker) await Promise.race([stopBroker(broker), sleep(1000)]);
  if ((agent as any).audioPlayer?.stop) (agent as any).audioPlayer.stop(true);
});
