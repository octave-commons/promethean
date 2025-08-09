import "source-map-support/register.js";
import { Client, GatewayIntentBits } from "discord.js";
import { BrokerClient } from "../../../../shared/js/brokerClient.js";

async function main() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });
  const broker = new BrokerClient({ url: process.env.BROKER_URL as string });
  await broker.connect();
  broker.subscribe("discord-outbound", async (event: any) => {
    const { channelId, content } = event.payload;
    const channel = await client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as any).send(content);
    }
  });
  client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    broker.enqueue("cephalon", {
      type: "discord-message",
      channelId: message.channel.id,
      content: message.content,
    });
  });
  await client.login(process.env.DISCORD_TOKEN as string);
}

if (process.env.NODE_ENV !== "test") {
  main();
}
