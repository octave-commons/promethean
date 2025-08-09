import {
  ApplicationCommandOptionType,
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  TextChannel,
  type Message,
} from "discord.js";
import { BrokerClient } from "../../../../shared/js/brokerClient.js";

interface BotOptions {
  token: string;
  applicationId: string;
  brokerUrl: string;
}

export class Bot {
  client: Client;
  broker: BrokerClient;
  captureChannel?: TextChannel;

  constructor(private options: BotOptions) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
    this.broker = new BrokerClient({ url: options.brokerUrl });
  }

  async start() {
    await this.broker.connect();
    this.broker.subscribe("discord-outbound", async (event: any) => {
      const { channelId, content } = event.payload;
      const channel = await this.client.channels.fetch(channelId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send(content);
      }
    });
    await this.client.login(this.options.token);
    await this.registerInteractions();
    this.client.on(Events.MessageCreate, (m) => this.handleMessage(m));
    this.client.on(Events.InteractionCreate, (i) => this.handleInteraction(i));
  }

  async handleInteraction(interaction: any) {
    if (!interaction.inCachedGuild() || !interaction.isChatInputCommand())
      return;
    this.broker.enqueue("cephalon", {
      type: "discord-interaction",
      interaction: {
        id: interaction.id,
        commandName: interaction.commandName,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
        userId: interaction.user.id,
        options: interaction.options.data,
      },
    });
    if (interaction.commandName === "setcapturechannel") {
      const channel = interaction.options.getChannel("channel", true);
      if (!channel.isTextBased()) {
        await interaction.reply("Channel must be text-based.");
        return;
      }
      this.captureChannel = channel as TextChannel;
      await interaction.reply(`Capture channel set to ${channel.id}`);
    }
  }

  async registerInteractions() {
    const commands = [
      {
        name: "setcapturechannel",
        description: "Sets the channel where captured media will be stored",
        options: [
          {
            name: "channel",
            description: "Target text channel",
            type: ApplicationCommandOptionType.Channel,
            required: true,
          },
        ],
      },
    ];
    const rest = new REST().setToken(this.options.token);
    const guilds = await this.client.guilds.fetch();
    for (const [, guild] of guilds) {
      await rest.put(
        Routes.applicationGuildCommands(this.options.applicationId, guild.id),
        { body: commands },
      );
    }
  }

  async handleMessage(message: Message) {
    if (message.author.bot) return;
    this.broker.enqueue("cephalon", {
      type: "discord-message",
      channelId: message.channel.id,
      content: message.content,
    });
    if (!this.captureChannel) return;
    const images = [...message.attachments.values()].filter(
      (att) => att.contentType?.startsWith("image/"),
    );
    if (!images.length) return;
    const files = images.map((att) => ({
      attachment: att.url,
      name: att.name,
    }));
    await this.captureChannel.send({ files });
  }
}
