import "source-map-support/register.js";
import { Bot } from "./bot.js";

async function main() {
  const bot = new Bot({
    token: process.env.DISCORD_TOKEN as string,
    applicationId: process.env.DISCORD_APP_ID as string,
    brokerUrl: process.env.BROKER_URL as string,
  });
  await bot.start();
}

if (process.env.NODE_ENV !== "test") {
  main();
}
