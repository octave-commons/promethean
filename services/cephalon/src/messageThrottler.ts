import { BrokerClient } from "@promethean-os/legacy/brokerClient.js";

import type { AIAgent } from "./agent.js";

export async function initMessageThrottler(agent: AIAgent, url?: string) {
  const client = new BrokerClient(url ? { url } : {});
  let count = 0;
  let windowStart = Date.now();
  const base = 100;
  const publish = client.publish.bind(client);
  client.publish = (type: string, payload: any, opts: any = {}) => {
    count++;
    const now = Date.now();
    const elapsed = now - windowStart;
    if (elapsed >= 1000) {
      const rate = count / (elapsed / 1000);
      const delay = Math.min(1000, base + Math.round(rate));
      agent.updateTickInterval(delay);
      count = 0;
      windowStart = now;
    }
    return publish(type, payload, opts);
  };
  await client.connect();
  return client;
}
