// SPDX-License-Identifier: GPL-3.0-only
import { Client, GatewayIntentBits, Message } from "discord.js";

export class Bot {
  private client: Client;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
  }

  async start() {
    this.client.on("ready", () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
    });

    this.client.on("messageCreate", async (message: Message) => {
      if (message.author.bot) return;
      if (message.content === "!ping") {
        await message.reply("Pong!");
      }
    });

    await this.client.login(this.token);
  }
}
