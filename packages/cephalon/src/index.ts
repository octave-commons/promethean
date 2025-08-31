import "source-map-support/register.js";
import { Bot } from "./bot.js";
import { AGENT_NAME } from "@promethean/legacy/env.js";
import { HeartbeatClient } from "@promethean/legacy/heartbeat/index.js";

async function main() {
  console.log("Starting", AGENT_NAME, "Cephalon");
  const bot = new Bot({
    token: process.env.DISCORD_TOKEN as string,
    applicationId: process.env.DISCORD_CLIENT_USER_ID as string,
  });
  const hb = new HeartbeatClient();
  try {
    await hb.sendOnce();
  } catch (err) {
    console.error("failed to register heartbeat", err);
    process.exit(1);
  }
  hb.start();
  await bot.start();
  console.log(`Cephalon started for ${AGENT_NAME}`);
}

if (process.env.NODE_ENV !== "test") {
  main();
}
