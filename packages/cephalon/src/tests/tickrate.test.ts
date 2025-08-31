import test from "ava";
process.env.DISABLE_AUDIO = "1";
import { AIAgent } from "../agent.js";
import type { Bot } from "../bot.js";
//

test.skip("agent updates tick interval", (t) => {
  const context = {} as any;
  const bot = { context } as unknown as Bot;
  const agent = new AIAgent({ bot, context });
  t.is((agent as any).tickInterval, 100);
  agent.updateTickInterval(250);
  t.is((agent as any).tickInterval, 250);
  // stop audio player to let AVA exit cleanly
  if ((agent as any).audioPlayer?.stop) (agent as any).audioPlayer.stop(true);
});
