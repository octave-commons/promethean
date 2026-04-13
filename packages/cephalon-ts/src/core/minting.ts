import type {
  Memory,
  UUID,
  CephalonEvent,
  DiscordMessagePayload,
  ToolCallPayload,
  ToolResultPayload,
} from "../types/index.js";
import type { MemoryStore } from "./memory-store.js";
import { MemoryFactory } from "./memory-factory.js";

export interface MemoryMintingConfig {
  cephalonId: string;
  sessionId: string;
  schemaVersion: number;
}

interface Attachment {
  id?: string;
  filename?: string;
  contentType?: string;
  size?: number;
  url?: string;
}

function parseAttachments(rawAttachments: unknown): Attachment[] {
  if (!Array.isArray(rawAttachments)) {
    return [];
  }

  return rawAttachments
    .filter(
      (att): att is Record<string, unknown> =>
        att !== null && typeof att === "object",
    )
    .map((att) => ({
      id: typeof att.id === "string" ? att.id : undefined,
      filename:
        typeof att.filename === "string" ? att.filename : undefined,
      contentType:
        typeof att.contentType === "string" ? att.contentType : undefined,
      size: typeof att.size === "number" ? att.size : undefined,
      url: typeof att.url === "string" ? att.url : undefined,
    }));
}

export async function mintFromDiscordEvent(
  store: MemoryStore,
  event: CephalonEvent,
  config: MemoryMintingConfig,
): Promise<Memory | null> {
  const factory = new MemoryFactory(config);
  const payload = event.payload as DiscordMessagePayload;
  const platform = payload.platform === "irc" ? "irc" : "discord";
  const normalizedText = (
    payload as { normalized?: { normalizedText?: string } }
  )?.normalized?.normalizedText;

  const messageExternalId = `${platform}:${payload.guildId}:${payload.channelId}:${payload.messageId}`;

  const memory = factory.createUserMessageMemory(
    payload.content,
    {
      type: platform,
      guildId: payload.guildId,
      channelId: payload.channelId,
      authorId: payload.authorId,
      authorIsBot: payload.authorIsBot,
    },
    {
      eventId: event.id,
      normalizedText: normalizedText || payload.content,
      timestamp: event.timestamp,
      externalId: messageExternalId,
    },
  );

  const existing = await store.findById(memory.id);
  if (existing) {
    console.log(`[Minting] Memory ${memory.id} already exists, skipping`);
    return existing;
  }

  await store.insert(memory);

  const attachments = parseAttachments(payload.attachments);

  for (let i = 0; i < attachments.length; i++) {
    const att = attachments[i];

    const isImage =
      att.contentType?.startsWith("image/") ||
      att.filename?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);

    const attachmentExternalId = `${platform}-attachment:${payload.messageId}:${att.id ?? i}`;

    if (isImage && att.url) {
      const imageMemory = factory.createImageMemory(
        att.filename || "unnamed",
        att.url,
        att.size,
        {
          type: platform,
          guildId: payload.guildId,
          channelId: payload.channelId,
          authorId: payload.authorId,
          authorIsBot: payload.authorIsBot,
        },
        {
          eventId: event.id,
          timestamp: event.timestamp,
          externalId: attachmentExternalId,
          parentMemoryId: memory.id,
        },
      );

      await store.insert(imageMemory);
    }
  }

  return memory;
}

export async function mintFromLLMResponse(
  store: MemoryStore,
  responseContent: string,
  config: MemoryMintingConfig,
): Promise<Memory> {
  const factory = new MemoryFactory(config);
  const memory = factory.createAssistantMemory(responseContent);
  await store.insert(memory);
  return memory;
}

export async function mintFromToolCall(
  store: MemoryStore,
  callPayload: ToolCallPayload,
  resultPayload: ToolResultPayload,
  config: MemoryMintingConfig,
  metadata?: {
    eventId?: UUID;
    timestamp?: number;
    channelId?: string;
  },
): Promise<{ callMemory: Memory; resultMemory: Memory }> {
  const factory = new MemoryFactory(config);

  const callExternalId = `tool-call:${callPayload.callId}`;
  const resultExternalId = `tool-result:${callPayload.callId}`;

  const callMemory = factory.createToolCallMemory(
    callPayload.toolName,
    callPayload.args,
    callPayload.callId,
    {
      timestamp: metadata?.timestamp,
      externalId: callExternalId,
      eventId: metadata?.eventId,
    },
  );

  const resultMemory = factory.createToolResultMemory(
    callPayload.toolName,
    resultPayload.result,
    resultPayload.error,
    callPayload.callId,
    {
      timestamp: metadata?.timestamp,
      externalId: resultExternalId,
      eventId: metadata?.eventId,
    },
  );

  await store.insert(callMemory);
  await store.insert(resultMemory);

  return { callMemory, resultMemory };
}

export async function mintSummary(
  store: MemoryStore,
  summaryContent: string,
  sourceMemoryIds: UUID[],
  config: MemoryMintingConfig,
): Promise<Memory> {
  const factory = new MemoryFactory(config);

  const uniqueSourceIds = [...new Set(sourceMemoryIds)];

  const memory = factory.createSummaryMemory(
    summaryContent,
    uniqueSourceIds,
  );
  await store.insert(memory);
  return memory;
}
