/**
 * Discord integration for Cephalon
 *
 * Connects to Discord gateway, normalizes messages, publishes to event bus
 */

import {
  Client,
  GatewayIntentBits,
  Events,
  Message,
  TextChannel
} from 'discord.js';
import type { EventBus } from '@promethean-os/event';
import { normalizeDiscordMessage } from '../normalization/discord-message.js';
import type { CephalonPolicy, CephalonEventType } from '../types/index.js';

export interface DiscordConfig {
  token: string;
  forcedChannels: string[]; // Channel IDs to monitor
}

export class DiscordIntegration {
  private client!: Client;
  private eventBus: EventBus;
  private policy: CephalonPolicy;
  private config: DiscordConfig;
  private isRunning = false;
  private accessibleChannels: Map<string, { id: string; name: string; guildId: string; type: string }> = new Map();
  private specialChannels: Set<string> = new Set();
  private readyPromise?: Promise<void>;

  constructor(eventBus: EventBus, policy: CephalonPolicy, config: DiscordConfig) {
    this.eventBus = eventBus;
    this.policy = policy;
    this.config = config;
  }

  /**
   * Setup ready promise that resolves when Discord client is ready
   */
  private setupReadyPromise(): void {
    this.readyPromise = new Promise<void>((resolve) => {
      this.client.once(Events.ClientReady, async () => {
        console.log(`[Discord] Logged in as ${this.client.user?.tag}`);
        console.log('[Discord] Client ready event fired');

        // Discover all accessible channels
        await this.discoverChannels();

        console.log(`[Discord] Monitoring ${this.accessibleChannels.size} total channels`);
        console.log(`[Discord] Special channels: ${this.specialChannels.size}`);
        console.log('[Discord] Channel discovery complete');

        resolve();
      });
    });
  }

   /**
    * Get a promise that resolves when Discord client is ready
    */
  async waitForReady(): Promise<void> {
    console.log('[Discord] Waiting for client to be ready...');
    if (!this.readyPromise) {
      this.setupReadyPromise();
    }
    return await this.readyPromise!;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('[Discord] Already running');
      return;
    }

    // Special channels are the "home" channels
    this.specialChannels = new Set(this.config.forcedChannels);

    // Initialize client
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    // Setup ready promise and event handlers
    this.setupReadyPromise();
    this.setupEventHandlers();

    // Login to Discord
    await this.client.login(this.config.token);
    this.isRunning = true;
    console.log('[Discord] Started and waiting for ready event...');
  }

   private setupEventHandlers(): void {
    // Ready event - set up handlers when client is ready
    this.client.on(Events.ClientReady, async () => {
      console.log(`[Discord] Logged in as ${this.client.user?.tag}`);

      // Discover all accessible channels
      await this.discoverChannels();

      console.log(`[Discord] Monitoring ${this.accessibleChannels.size} total channels`);
      console.log(`[Discord] Special channels: ${this.specialChannels.size}`);
    });

    // Message create event
    this.client.on(Events.MessageCreate, async (message) => {
      await this.handleMessage(message, 'discord.message.created');
    });

    // Message update event
    this.client.on(Events.MessageUpdate, async (_oldMessage, newMessage) => {
      await this.handleMessage(newMessage as Message, 'discord.message.edited');
    });

    // Message delete event
    this.client.on(Events.MessageDelete, async (message) => {
      if (!this.shouldProcessChannel(message.channelId || null)) return;

      await this.eventBus.publish('discord.message.deleted', {
        guildId: message.guildId || '',
        channelId: message.channelId || '',
        messageId: message.id,
        authorId: message.author?.id || '',
        authorIsBot: message.author?.bot || false,
        content: message.content || '',
        embeds: [],
        attachments: []
      });
    });

    // Error handling
    this.client.on(Events.Error, (error) => {
      console.error('[Discord] Client error:', error);
    });

    this.client.on(Events.Warn, (warning) => {
      console.warn('[Discord] Warning:', warning);
    });
  }

  private async handleMessage(message: Message, eventType: CephalonEventType): Promise<void> {
    // Ignore messages from bots (including self)
    if (message.author.bot) return;

    // Ignore messages from channels we don't monitor
    if (!this.shouldProcessChannel(message.channelId)) return;

    const selfId = this.client.user?.id;
    const mentionUserIds = Array.from(message.mentions.users.keys());
    const mentionsCephalon = selfId ? mentionUserIds.includes(selfId) : false;

    // Normalize message
    const normalized = normalizeDiscordMessage(
      {
        guildId: message.guildId || '',
        channelId: message.channelId,
        messageId: message.id,
        authorId: message.author.id,
        authorIsBot: message.author.bot,
        content: message.content || '',
        embeds: message.embeds.map(e => ({
          title: e.title || '',
          description: e.description || '',
          url: e.url || ''
        })),
        attachments: message.attachments.map(a => ({
          id: a.id,
          filename: a.name,
          contentType: a.contentType ?? undefined,
          size: a.size,
          url: a.url
        }))
      },
      { volatileRewrites: [], stripTrackingParams: true }
    );

    // Publish to event bus
    await this.eventBus.publish(eventType, {
      guildId: message.guildId || '',
      channelId: message.channelId,
      messageId: message.id,
      authorId: message.author.id,
      authorIsBot: message.author.bot,
      authorUsername: message.author.username,
      authorDiscriminator: message.author.discriminator,
      guildName: message.guild?.name || '',
      channelName: 'name' in message.channel ? (message.channel.name || '') : '',
      content: message.content || '',
      normalized,
      mentionUserIds,
      mentionsCephalon,
      embeds: message.embeds.map(e => ({
        title: e.title || '',
        description: e.description || '',
        fields: e.fields?.map(f => ({ name: f.name, value: f.value })) || []
      })),
      attachments: message.attachments.map(a => ({
        id: a.id,
        filename: a.name,
        contentType: a.contentType,
        size: a.size,
        url: a.url
      })),
      timestamp: message.createdAt.getTime(),
      replyTo: message.reference?.messageId || null
    });
  }

   private async discoverChannels(): Promise<void> {
    this.accessibleChannels.clear();

    for (const guild of this.client.guilds.cache.values()) {
      try {
        const channels = await guild.channels.fetch();

        for (const channel of channels.values()) {
          if (channel && channel.isTextBased() && !channel.isDMBased()) {
            this.accessibleChannels.set(channel.id, {
              id: channel.id,
              name: channel.name,
              guildId: guild.id,
              type: channel.type.toString()
            });
          }
        }
      } catch (error) {
        console.error(`[Discord] Error fetching channels for guild ${guild.name}:`, error);
      }
    }
  }

  private shouldProcessChannel(channelId: string | null): boolean {
    if (!channelId) return false;
    // Process all accessible channels, not just forced ones
    return this.accessibleChannels.has(channelId);
  }

  getAccessibleChannels(): Array<{ id: string; name: string; guildId: string; type: string }> {
    return Array.from(this.accessibleChannels.values());
  }

  getSpecialChannels(): Array<{ id: string; name: string; guildId: string; type: string }> {
    return Array.from(this.specialChannels)
      .map(id => this.accessibleChannels.get(id))
      .filter((c): c is { id: string; name: string; guildId: string; type: string } => c !== undefined);
  }

  getClient(): any {
    console.log('[Discord] getClient() returning client:', this.client?.user?.tag || 'undefined');
    return this.client;
  }

  async sendMessage(channelId: string, content: string): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Channel not found or not text-based: ${channelId}`);
    }

    await (channel as TextChannel).send(content);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log('[Discord] Stopping integration...');
    await this.client.destroy();
    this.isRunning = false;
  }
}
