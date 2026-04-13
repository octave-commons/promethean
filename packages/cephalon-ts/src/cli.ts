#!/usr/bin/env node

import { createCephalonApp } from "./app.js";
import { getBotConfig, getBotIdFromEnv } from "./config/bots.js";

async function run(): Promise<void> {
  const botId = getBotIdFromEnv();
  const bot = getBotConfig(botId);

  console.log(`[CLI] Starting ${bot.cephalonId} cephalon (${botId})...`);

  const app = await createCephalonApp({ botId });
  await app.start();

  const graceful = async (signal: string) => {
    try {
      await app.stop(signal);
      process.exit(0);
    } catch (err) {
      console.error("[Shutdown] Error:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => graceful("SIGINT"));
  process.on("SIGTERM", () => graceful("SIGTERM"));
}

run().catch((err) => {
  console.error("[Fatal]", err);
  process.exit(1);
});
