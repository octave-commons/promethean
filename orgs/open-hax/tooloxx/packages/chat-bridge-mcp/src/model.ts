export type ChatPlatform = "irc" | "discord" | "slack";

export interface PlatformSummary {
  readonly id: ChatPlatform;
  readonly name: string;
  readonly workspaces: number;
  readonly capabilitiesUri: string;
}

export interface WorkspaceSummary {
  readonly platform: ChatPlatform;
  readonly workspaceId: string;
  readonly title: string;
  readonly description?: string;
}

export interface ConversationSummary {
  readonly ref: string;
  readonly platform: ChatPlatform;
  readonly workspaceId: string;
  readonly conversationId: string;
  readonly kind: "channel" | "dm" | "thread";
  readonly title: string;
  readonly topic?: string;
  readonly unreadCount?: number;
  readonly capabilities: PlatformCapabilities;
}

export interface Participant {
  readonly id: string;
  readonly displayName: string;
  readonly roles?: readonly string[];
}

export interface Message {
  readonly ref: string;
  readonly conversationRef: string;
  readonly platform: ChatPlatform;
  readonly workspaceId: string;
  readonly conversationId: string;
  readonly messageId: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly text: string;
  readonly timestamp: string;
  readonly replyToRef?: string;
  readonly threadRootRef?: string;
  readonly attachments?: readonly string[];
  readonly reactions?: readonly string[];
}

export interface PlatformCapabilities {
  readonly platform: ChatPlatform;
  readonly threads: boolean;
  readonly reactions: boolean;
  readonly attachments: boolean;
  readonly editMessage: boolean;
  readonly reply: boolean;
  readonly stableMessageIds: boolean;
  readonly liveHistoryOnly?: boolean;
  readonly notes?: readonly string[];
}

export interface ConversationRefParts {
  readonly platform: ChatPlatform;
  readonly workspaceId: string;
  readonly conversationId: string;
}

export interface MessageRefParts extends ConversationRefParts {
  readonly messageId: string;
}

const REF_PREFIX = "chat";

export function formatConversationRef(parts: ConversationRefParts): string {
  return [
    REF_PREFIX,
    parts.platform,
    encodeURIComponent(parts.workspaceId),
    encodeURIComponent(parts.conversationId),
  ].join(":");
}

export function parseConversationRef(value: string): ConversationRefParts {
  const parts = value.split(":");
  if (parts.length !== 4 || parts[0] !== REF_PREFIX) {
    throw new Error(`Invalid conversationRef: ${value}`);
  }

  const platform = parts[1];
  if (platform !== "irc" && platform !== "discord" && platform !== "slack") {
    throw new Error(`Unsupported platform in conversationRef: ${value}`);
  }

  return {
    platform,
    workspaceId: decodeURIComponent(parts[2] || ""),
    conversationId: decodeURIComponent(parts[3] || ""),
  };
}

export function formatMessageRef(parts: MessageRefParts): string {
  return `${formatConversationRef(parts)}:${encodeURIComponent(parts.messageId)}`;
}

export function parseMessageRef(value: string): MessageRefParts {
  const parts = value.split(":");
  if (parts.length !== 5 || parts[0] !== REF_PREFIX) {
    throw new Error(`Invalid messageRef: ${value}`);
  }

  const conversation = parseConversationRef(parts.slice(0, 4).join(":"));
  return {
    ...conversation,
    messageId: decodeURIComponent(parts[4] || ""),
  };
}

export function toResourceJson(uri: string, payload: unknown): { uri: string; mimeType: string; text: string } {
  return {
    uri,
    mimeType: "application/json",
    text: JSON.stringify(payload, null, 2),
  };
}
