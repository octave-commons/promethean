import "dotenv/config";
import { Bot } from "./bot.js";

async function main() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error("DISCORD_TOKEN is not set");
  }
  const bot = new Bot(token);
  await bot.start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
