import type { EventBus } from "@promethean-os/event";

import type { CephalonEventType } from "../types/index.js";
import { IrcApiClient } from "./api-client.js";

export interface IrcIntegrationConfig {
  enabled: boolean;
}

export class IrcIntegration {
  private unsubscribe: (() => void) | null = null;
  private running = false;

  constructor(
    private readonly eventBus: EventBus,
    private readonly ircApiClient: IrcApiClient,
    private readonly config: IrcIntegrationConfig,
  ) {}

  async start(): Promise<void> {
    if (!this.config.enabled || this.running) {
      return;
    }

    await this.ircApiClient.start();
    this.unsubscribe = this.ircApiClient.onMessage(({ message, channelId, channelName, workspaceId, mentionUserIds, mentionsSelf, replyTo }) => {
      void this.eventBus.publish("discord.message.created" satisfies CephalonEventType, {
        platform: "irc",
        guildId: workspaceId,
        channelId,
        messageId: message.id,
        authorId: message.authorId,
        authorIsBot: message.authorIsBot,
        authorUsername: message.authorUsername,
        authorDiscriminator: "0000",
        guildName: workspaceId,
        channelName,
        content: message.content,
        normalized: { normalizedText: message.content },
        mentionUserIds,
        mentionsCephalon: mentionsSelf,
        embeds: [],
        attachments: [],
        timestamp: message.timestamp.getTime(),
        replyTo: replyTo ?? null,
      });
    });
    this.running = true;
    console.log(`[IRC] Connected to ${workspaceIdForLog(this.ircApiClient.getDefaultChannelId())}`);
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.unsubscribe?.();
    this.unsubscribe = null;
    await this.ircApiClient.stop();
    this.running = false;
  }
}

function workspaceIdForLog(channelId: string): string {
  return channelId;
}
