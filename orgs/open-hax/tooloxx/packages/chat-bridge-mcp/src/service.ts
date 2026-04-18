import {
  formatConversationRef,
  parseConversationRef,
  parseMessageRef,
  toResourceJson,
  type ConversationSummary,
  type Message,
  type Participant,
  type PlatformCapabilities,
  type PlatformSummary,
  type WorkspaceSummary,
} from "./model.js";
import { IrcChatAdapter } from "./irc/adapter.js";

export interface ListConversationArgs {
  readonly platform?: string;
  readonly workspaceId?: string;
  readonly kind?: string;
  readonly limit?: number;
}

export interface ReadMessagesArgs {
  readonly conversationRef: string;
  readonly before?: string;
  readonly limit?: number;
  readonly includeReplies?: boolean;
}

export interface SendMessageArgs {
  readonly conversationRef: string;
  readonly text: string;
  readonly suppressMentions?: boolean;
}

export interface ReplyMessageArgs {
  readonly messageRef: string;
  readonly text: string;
  readonly suppressMentions?: boolean;
}

export class ChatBridgeService {
  private readonly irc: IrcChatAdapter;

  constructor(irc: IrcChatAdapter) {
    this.irc = irc;
  }

  async listPlatforms(): Promise<PlatformSummary[]> {
    return [
      {
        id: "irc",
        name: "IRC",
        workspaces: 1,
        capabilitiesUri: "chat://capabilities/irc",
      },
    ];
  }

  async listWorkspaces(platform: string): Promise<WorkspaceSummary[]> {
    if (platform !== "irc") {
      return [];
    }

    const conversation = this.irc.conversationSummary();
    return [
      {
        platform: "irc",
        workspaceId: conversation.workspaceId,
        title: `IRC ${conversation.workspaceId}`,
        description: `Network ${conversation.workspaceId} via ${conversation.title}`,
      },
    ];
  }

  async listConversations(args: ListConversationArgs): Promise<ConversationSummary[]> {
    if (args.platform && args.platform !== "irc") {
      return [];
    }

    const all = await this.irc.listConversations();
    const filtered = all.filter((conversation) => {
      if (args.workspaceId && conversation.workspaceId !== args.workspaceId) {
        return false;
      }
      if (args.kind && conversation.kind !== args.kind) {
        return false;
      }
      return true;
    });
    return filtered.slice(0, args.limit ?? filtered.length);
  }

  async readMessages(args: ReadMessagesArgs): Promise<Message[]> {
    const ref = parseConversationRef(args.conversationRef);
    if (ref.platform !== "irc") {
      throw new Error(`Unsupported platform for read_messages: ${ref.platform}`);
    }
    return this.irc.readMessages(args.limit ?? 50, args.before);
  }

  async sendMessage(args: SendMessageArgs): Promise<Message> {
    const ref = parseConversationRef(args.conversationRef);
    if (ref.platform !== "irc") {
      throw new Error(`Unsupported platform for send_message: ${ref.platform}`);
    }
    return this.irc.sendMessage(args.text, args.suppressMentions ?? false);
  }

  async replyMessage(args: ReplyMessageArgs): Promise<Message> {
    const ref = parseMessageRef(args.messageRef);
    if (ref.platform !== "irc") {
      throw new Error(`Unsupported platform for reply_message: ${ref.platform}`);
    }
    return this.irc.replyMessage(args.messageRef, args.text, args.suppressMentions ?? false);
  }

  async getMembers(conversationRef: string): Promise<Participant[]> {
    const ref = parseConversationRef(conversationRef);
    if (ref.platform !== "irc") {
      throw new Error(`Unsupported platform for get_members: ${ref.platform}`);
    }
    return this.irc.getMembers();
  }

  async getCapabilities(_target?: string): Promise<PlatformCapabilities> {
    return this.irc.capabilities();
  }

  async listConversationResourceUris(): Promise<Array<{ uri: string; name: string; mimeType: string }>> {
    const conversations = await this.listConversations({ platform: "irc" });
    return conversations.map((conversation) => ({
      uri: `chat://conversations/irc/${encodeURIComponent(conversation.workspaceId)}`,
      name: conversation.title,
      mimeType: "application/json",
    }));
  }

  async listMessageWindowUris(): Promise<Array<{ uri: string; name: string; mimeType: string }>> {
    const conversation = this.irc.conversationSummary();
    return [
      {
        uri: `chat://messages/irc/${encodeURIComponent(conversation.workspaceId)}/${encodeURIComponent(conversation.conversationId)}`,
        name: `${conversation.title} recent messages`,
        mimeType: "application/json",
      },
    ];
  }

  async listMessageUris(limit = 50): Promise<Array<{ uri: string; name: string; mimeType: string }>> {
    const conversation = this.irc.conversationSummary();
    const messages = await this.irc.readMessages(limit);
    return messages.map((message) => ({
      uri: `chat://message/irc/${encodeURIComponent(conversation.workspaceId)}/${encodeURIComponent(conversation.conversationId)}/${encodeURIComponent(message.messageId)}`,
      name: `${message.authorName}: ${message.text.slice(0, 40)}`,
      mimeType: "application/json",
    }));
  }

  async readResource(uri: string): Promise<{ uri: string; mimeType: string; text: string }> {
    if (uri === "chat://platforms") {
      return toResourceJson(uri, await this.listPlatforms());
    }

    if (uri === "chat://workspaces/irc") {
      return toResourceJson(uri, await this.listWorkspaces("irc"));
    }

    if (uri === "chat://capabilities/irc") {
      return toResourceJson(uri, await this.getCapabilities("irc"));
    }

    if (uri.startsWith("chat://conversations/irc/")) {
      const workspaceId = decodeURIComponent(uri.slice("chat://conversations/irc/".length));
      return toResourceJson(uri, await this.listConversations({ platform: "irc", workspaceId }));
    }

    if (uri.startsWith("chat://messages/irc/")) {
      const relative = uri.slice("chat://messages/irc/".length).split("/");
      const workspaceId = decodeURIComponent(relative[0] || "");
      const conversationId = decodeURIComponent(relative[1] || "");
      return toResourceJson(
        uri,
        await this.readMessages({
          conversationRef: formatConversationRef({ platform: "irc", workspaceId, conversationId }),
          limit: 50,
        }),
      );
    }

    if (uri.startsWith("chat://message/irc/")) {
      const relative = uri.slice("chat://message/irc/".length).split("/");
      const workspaceId = decodeURIComponent(relative[0] || "");
      const conversationId = decodeURIComponent(relative[1] || "");
      const messageId = decodeURIComponent(relative[2] || "");
      const messages = await this.readMessages({
        conversationRef: formatConversationRef({ platform: "irc", workspaceId, conversationId }),
        limit: 200,
      });
      const found = messages.find((message) => message.messageId === messageId);
      if (!found) {
        throw new Error(`Message not found for resource ${uri}`);
      }
      return toResourceJson(uri, found);
    }

    throw new Error(`Unsupported resource URI: ${uri}`);
  }
}
