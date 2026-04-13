import { PermissionFlagsBits } from "discord.js";
import type { Client, Guild, TextChannel, DMChannel, Message } from "discord.js";

export interface DiscordApiConfig {
  token: string;
}

export interface DiscordMessage {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorIsBot: boolean;
  timestamp: Date;
  attachments: Array<{
    id: string;
    filename: string;
    contentType: string | null;
    size: number;
    url: string;
  }>;
  embeds: Array<{
    title: string | null;
    description: string | null;
    url: string | null;
  }>;
}

export interface DiscordServer {
  id: string;
  name: string;
  memberCount: number;
}

export interface DiscordChannel {
  id: string;
  name: string;
  guildId: string;
  type: string;
}

export class DiscordApiClient {
  private client: Client | null = null;
  private token: string;

  constructor(config: DiscordApiConfig) {
    this.token = config.token;
  }

  setClient(client: Client): void {
    this.client = client;
  }

  private ensureClient(): Client {
    if (!this.client) {
      throw new Error("Discord client not set");
    }
    return this.client;
  }

  async fetchChannelMessages(
    channelId: string,
    options: {
      limit?: number;
      before?: string;
      after?: string;
      around?: string;
    } = {}
  ): Promise<{ messages: DiscordMessage[]; count: number }> {
    const client = this.ensureClient();
    const channel = await client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      throw new Error(`Channel not found or not text-based: ${channelId}`);
    }

    const messages = await (channel as TextChannel).messages.fetch({
      limit: Math.min(options.limit ?? 50, 100),
      before: options.before,
      after: options.after,
      around: options.around,
    });

    return {
      messages: messages.map((m) => this.mapMessage(m)),
      count: messages.size,
    };
  }

  async scrollChannelMessages(
    channelId: string,
    oldestSeenId: string,
    limit = 50
  ): Promise<{ messages: DiscordMessage[]; count: number; oldestSeenId: string }> {
    const result = await this.fetchChannelMessages(channelId, {
      limit,
      before: oldestSeenId,
    });

    return {
      ...result,
      oldestSeenId,
    };
  }

  async fetchDMMessages(
    userId: string,
    options: {
      limit?: number;
      before?: string;
    } = {}
  ): Promise<{ messages: DiscordMessage[]; count: number; dmChannelId: string }> {
    const client = this.ensureClient();

    const user = await client.users.fetch(userId);
    const dmChannel = await user.createDM();

    const messages = await dmChannel.messages.fetch({
      limit: Math.min(options.limit ?? 50, 100),
      before: options.before,
    });

    return {
      messages: messages.map((m) => this.mapMessage(m)),
      count: messages.size,
      dmChannelId: dmChannel.id,
    };
  }

  async searchMessages(
    scope: "channel" | "dm",
    options: {
      channelId?: string;
      userId?: string;
      query?: string;
      limit?: number;
      before?: string;
      after?: string;
    }
  ): Promise<{ messages: DiscordMessage[]; count: number; source: string }> {
    let targetChannelId = options.channelId;

    if (scope === "dm" && options.userId) {
      const client = this.ensureClient();
      const user = await client.users.fetch(options.userId);
      const dmChannel = await user.createDM();
      targetChannelId = dmChannel.id;
    }

    if (!targetChannelId) {
      throw new Error("No channel_id or user_id provided");
    }

    const { messages } = await this.fetchChannelMessages(targetChannelId, {
      limit: 100,
      before: options.before,
      after: options.after,
    });

    let filteredMessages = messages;

    if (options.query) {
      const queryLower = options.query.toLowerCase();
      filteredMessages = messages.filter((m) =>
        m.content.toLowerCase().includes(queryLower)
      );
    }

    if (options.userId) {
      filteredMessages = messages.filter((m) => m.authorId === options.userId);
    }

    const limitedMessages = filteredMessages.slice(0, options.limit ?? 50);

    return {
      messages: limitedMessages,
      count: limitedMessages.length,
      source: "client_side_filter",
    };
  }

  async sendMessage(
    channelId: string,
    text: string,
    replyTo?: string
  ): Promise<{ messageId: string; channelId: string; sent: boolean; timestamp: string }> {
    const client = this.ensureClient();
    const channel = await client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      throw new Error(`Channel not found or not text-based: ${channelId}`);
    }

    const messageOptions: {
      content: string;
      reply?: { messageReference: string };
    } = { content: text };

    if (replyTo) {
      messageOptions.reply = { messageReference: replyTo };
    }

    const sentMessage = await (channel as TextChannel).send(messageOptions);

    return {
      messageId: sentMessage.id,
      channelId,
      sent: true,
      timestamp: sentMessage.createdAt.toISOString(),
    };
  }

  async listServers(): Promise<{ servers: DiscordServer[]; count: number }> {
    const client = this.ensureClient();

    const servers = client.guilds.cache.map((guild: Guild) => ({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
    }));

    return { servers, count: servers.length };
  }

  async listChannels(guildId?: string): Promise<{ channels: DiscordChannel[]; count: number }> {
    const client = this.ensureClient();

    if (guildId) {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        throw new Error(`Guild ${guildId} not found`);
      }

      const channels = this.collectGuildChannels(guild, await guild.channels.fetch());

      return { channels, count: channels.length };
    }

    const allChannels: DiscordChannel[] = [];
    for (const guild of client.guilds.cache.values()) {
      try {
        allChannels.push(...this.collectGuildChannels(guild, await guild.channels.fetch()));
      } catch {
        void 0;
      }
    }

    return { channels: allChannels, count: allChannels.length };
  }

  async listSendableChannels(guildId?: string): Promise<{ channels: DiscordChannel[]; count: number }> {
    const client = this.ensureClient();

    if (guildId) {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        throw new Error(`Guild ${guildId} not found`);
      }

      const channels = this.collectGuildChannels(guild, await guild.channels.fetch(), { sendableOnly: true });
      return { channels, count: channels.length };
    }

    const allChannels: DiscordChannel[] = [];
    for (const guild of client.guilds.cache.values()) {
      try {
        allChannels.push(...this.collectGuildChannels(guild, await guild.channels.fetch(), { sendableOnly: true }));
      } catch {
        void 0;
      }
    }

    return { channels: allChannels, count: allChannels.length };
  }

  private collectGuildChannels(
    guild: Guild,
    channels: Awaited<ReturnType<Guild["channels"]["fetch"]>>,
    options: { sendableOnly?: boolean } = {},
  ): DiscordChannel[] {
    const client = this.ensureClient();
    const selfId = client.user?.id;
    if (!selfId) {
      return [];
    }

    const result: DiscordChannel[] = [];
    for (const channel of channels.values()) {
      if (!channel || !channel.isTextBased() || channel.isDMBased()) {
        continue;
      }

      if (options.sendableOnly) {
        if (!("permissionsFor" in channel) || typeof channel.permissionsFor !== "function") {
          continue;
        }

        const permissions = channel.permissionsFor(selfId);
        if (!permissions?.has(PermissionFlagsBits.ViewChannel) || !permissions.has(PermissionFlagsBits.SendMessages)) {
          continue;
        }
      }

      result.push({
        id: channel.id,
        name: channel.name,
        guildId: guild.id,
        type: channel.type.toString(),
      });
    }

    return result;
  }

  private mapMessage(message: Message): DiscordMessage {
    return {
      id: message.id,
      content: message.content,
      authorId: message.author.id,
      authorUsername: message.author.username,
      authorIsBot: message.author.bot,
      timestamp: message.createdAt,
      attachments: message.attachments.map((a) => ({
        id: a.id,
        filename: a.name,
        contentType: a.contentType,
        size: a.size,
        url: a.url,
      })),
      embeds: message.embeds.map((e) => ({
        title: e.title,
        description: e.description,
        url: e.url,
      })),
    };
  }
}
