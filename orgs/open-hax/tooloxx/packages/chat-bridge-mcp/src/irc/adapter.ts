import net from "node:net";
import tls from "node:tls";
import { randomUUID } from "node:crypto";

import {
  formatConversationRef,
  formatMessageRef,
  type ConversationSummary,
  type Message,
  type Participant,
  type PlatformCapabilities,
} from "../model.js";

export interface IrcAdapterConfig {
  readonly host: string;
  readonly port: number;
  readonly tls: boolean;
  readonly tlsServerName?: string;
  readonly nick: string;
  readonly user: string;
  readonly realName: string;
  readonly workspaceId: string;
  readonly channel: string;
  readonly historyLimit: number;
}

export interface ParsedIrcLine {
  readonly prefix?: string;
  readonly command: string;
  readonly params: readonly string[];
}

const IRC_MESSAGE_BUFFER = 420;

export function parseIrcLine(line: string): ParsedIrcLine {
  let rest = line.trim();
  let prefix: string | undefined;
  if (rest.startsWith(":")) {
    const space = rest.indexOf(" ");
    prefix = rest.slice(1, space);
    rest = rest.slice(space + 1);
  }

  const params: string[] = [];
  while (rest.length > 0) {
    if (rest.startsWith(":")) {
      params.push(rest.slice(1));
      break;
    }

    const space = rest.indexOf(" ");
    if (space === -1) {
      params.push(rest);
      break;
    }

    params.push(rest.slice(0, space));
    rest = rest.slice(space + 1).replace(/^\s+/, "");
  }

  const [command = "", ...tail] = params;
  return {
    prefix,
    command: command.toUpperCase(),
    params: tail,
  };
}

function nickFromPrefix(prefix: string | undefined): string {
  if (!prefix) {
    return "server";
  }

  const bang = prefix.indexOf("!");
  return bang >= 0 ? prefix.slice(0, bang) : prefix;
}

function stripNickDecorators(name: string): string {
  return name.replace(/^[~&@%+]+/, "");
}

function normalizeOutgoingText(text: string, suppressMentions: boolean): string {
  const sanitized = suppressMentions ? text.replace(/@/g, "@\u200b") : text;
  return sanitized.length > IRC_MESSAGE_BUFFER ? `${sanitized.slice(0, IRC_MESSAGE_BUFFER - 1)}…` : sanitized;
}

function splitIntoLines(text: string): string[] {
  return text.split(/\r?\n/).filter((line) => line.length > 0);
}

export function createDefaultIrcConfig(env: NodeJS.ProcessEnv = process.env): IrcAdapterConfig {
  return {
    host: env.CHAT_BRIDGE_IRC_HOST || "irc.ussy.host",
    port: Number.parseInt(env.CHAT_BRIDGE_IRC_PORT || "6697", 10),
    tls: !/^(0|false|no|off)$/i.test(env.CHAT_BRIDGE_IRC_TLS || "true"),
    tlsServerName: env.CHAT_BRIDGE_IRC_TLS_SERVERNAME || undefined,
    nick: env.CHAT_BRIDGE_IRC_NICK || `chatbridge-${randomUUID().slice(0, 8)}`,
    user: env.CHAT_BRIDGE_IRC_USER || "chatbridge",
    realName: env.CHAT_BRIDGE_IRC_REALNAME || "chat-bridge-mcp",
    workspaceId: env.CHAT_BRIDGE_IRC_WORKSPACE || "ussy",
    channel: env.CHAT_BRIDGE_IRC_CHANNEL || "#ussycode",
    historyLimit: Number.parseInt(env.CHAT_BRIDGE_IRC_HISTORY_LIMIT || "200", 10),
  };
}

export class IrcChatAdapter {
  private readonly config: IrcAdapterConfig;
  private socket?: net.Socket | tls.TLSSocket;
  private connectPromise?: Promise<void>;
  private buffer = "";
  private joined = false;
  private currentNick: string;
  private readonly messages: Message[] = [];
  private readonly members = new Map<string, Participant>();
  private sequence = 0;

  constructor(config: IrcAdapterConfig) {
    this.config = config;
    this.currentNick = config.nick;
  }

  conversationSummary(): ConversationSummary {
    return {
      ref: formatConversationRef({
        platform: "irc",
        workspaceId: this.config.workspaceId,
        conversationId: this.config.channel,
      }),
      platform: "irc",
      workspaceId: this.config.workspaceId,
      conversationId: this.config.channel,
      kind: "channel",
      title: this.config.channel,
      topic: `Live IRC channel on ${this.config.host}`,
      capabilities: this.capabilities(),
    };
  }

  capabilities(): PlatformCapabilities {
    return {
      platform: "irc",
      threads: false,
      reactions: false,
      attachments: false,
      editMessage: false,
      reply: false,
      stableMessageIds: false,
      liveHistoryOnly: true,
      notes: [
        "IRC message history is live-only from the moment the adapter connects.",
        "Replies are emulated by prefixing the target author's nick.",
      ],
    };
  }

  async ensureConnected(): Promise<void> {
    if (this.joined && this.socket && !this.socket.destroyed) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const socket = this.config.tls
        ? tls.connect({ host: this.config.host, port: this.config.port, servername: this.config.tlsServerName || this.config.host })
        : net.connect({ host: this.config.host, port: this.config.port });

      this.socket = socket;
      this.joined = false;
      this.members.clear();
      this.buffer = "";

      const timeout = setTimeout(() => {
        reject(new Error(`Timed out connecting to IRC ${this.config.host}:${this.config.port}`));
      }, 12_000);

      const finish = (error?: Error) => {
        clearTimeout(timeout);
        if (error) {
          reject(error);
          return;
        }
        resolve();
      };

      socket.on("connect", () => {
        this.sendRaw(`NICK ${this.config.nick}`);
        this.sendRaw(`USER ${this.config.user} 0 * :${this.config.realName}`);
      });

      socket.on("data", (chunk) => {
        this.buffer += chunk.toString("utf8");
        const lines = this.buffer.split(/\r?\n/);
        this.buffer = lines.pop() ?? "";
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (line.length === 0) {
            continue;
          }
          this.handleLine(line, finish);
        }
      });

      socket.on("error", (error) => {
        finish(error instanceof Error ? error : new Error(String(error)));
      });

      socket.on("close", () => {
        this.socket = undefined;
        this.joined = false;
      });
    }).finally(() => {
      this.connectPromise = undefined;
    });

    return this.connectPromise;
  }

  async listConversations(): Promise<ConversationSummary[]> {
    await this.ensureConnected().catch(() => undefined);
    return [this.conversationSummary()];
  }

  async readMessages(limit = 50, before?: string): Promise<Message[]> {
    await this.ensureConnected().catch(() => undefined);
    const source = [...this.messages];
    if (!before) {
      return source.slice(-limit).reverse();
    }

    const index = source.findIndex((message) => message.messageId === before || message.ref === before);
    if (index < 0) {
      return source.slice(-limit).reverse();
    }

    return source.slice(Math.max(0, index - limit), index).reverse();
  }

  async sendMessage(text: string, suppressMentions = false): Promise<Message> {
    await this.ensureConnected();
    const lines = splitIntoLines(text);
    for (const line of lines) {
      const outgoing = normalizeOutgoingText(line, suppressMentions);
      this.sendRaw(`PRIVMSG ${this.config.channel} :${outgoing}`);
    }
    return this.appendMessage({
      authorId: this.currentNick,
      authorName: this.currentNick,
      text,
      timestamp: new Date().toISOString(),
    });
  }

  async replyMessage(targetRef: string, text: string, suppressMentions = false): Promise<Message> {
    const target = this.messages.find((message) => message.ref === targetRef || message.messageId === targetRef);
    const prefix = target ? `${target.authorName}: ` : "reply: ";
    const sent = await this.sendMessage(`${prefix}${text}`, suppressMentions);
    return {
      ...sent,
      replyToRef: target?.ref,
    };
  }

  async getMembers(): Promise<Participant[]> {
    await this.ensureConnected();
    this.sendRaw(`NAMES ${this.config.channel}`);
    return [...this.members.values()].sort((left, right) => left.displayName.localeCompare(right.displayName));
  }

  async close(): Promise<void> {
    if (this.socket && !this.socket.destroyed) {
      this.sendRaw("QUIT :chat-bridge-mcp shutting down");
      this.socket.end();
    }
    this.socket = undefined;
    this.joined = false;
  }

  private sendRaw(line: string): void {
    this.socket?.write(`${line}\r\n`);
  }

  private handleLine(line: string, finish: (error?: Error) => void): void {
    const parsed = parseIrcLine(line);

    if (parsed.command === "PING") {
      this.sendRaw(`PONG :${parsed.params[0] || this.config.host}`);
      return;
    }

    if (parsed.command === "001") {
      this.sendRaw(`JOIN ${this.config.channel}`);
      return;
    }

    if (parsed.command === "353") {
      const names = (parsed.params[3] || "").split(/\s+/).filter(Boolean);
      for (const rawName of names) {
        const clean = stripNickDecorators(rawName);
        this.members.set(clean, { id: clean, displayName: clean });
      }
      return;
    }

    if (parsed.command === "366") {
      this.joined = true;
      finish();
      return;
    }

    if (parsed.command === "JOIN") {
      const nick = nickFromPrefix(parsed.prefix);
      this.members.set(nick, { id: nick, displayName: nick });
      if (nick === this.currentNick) {
        this.joined = true;
        this.sendRaw(`NAMES ${this.config.channel}`);
        finish();
      }
      return;
    }

    if (parsed.command === "PART" || parsed.command === "QUIT") {
      const nick = nickFromPrefix(parsed.prefix);
      this.members.delete(nick);
      return;
    }

    if (parsed.command === "NICK") {
      const oldNick = nickFromPrefix(parsed.prefix);
      const nextNick = parsed.params[0] || oldNick;
      if (this.members.has(oldNick)) {
        this.members.delete(oldNick);
      }
      this.members.set(nextNick, { id: nextNick, displayName: nextNick });
      if (oldNick === this.currentNick) {
        this.currentNick = nextNick;
      }
      return;
    }

    if (parsed.command === "PRIVMSG") {
      const target = parsed.params[0] || "";
      if (target !== this.config.channel) {
        return;
      }
      const nick = nickFromPrefix(parsed.prefix);
      this.members.set(nick, { id: nick, displayName: nick });
      this.appendMessage({
        authorId: nick,
        authorName: nick,
        text: parsed.params[1] || "",
        timestamp: new Date().toISOString(),
      });
    }
  }

  private appendMessage(input: {
    authorId: string;
    authorName: string;
    text: string;
    timestamp: string;
  }): Message {
    this.sequence += 1;
    const messageId = `${Date.now()}-${this.sequence}`;
    const conversationRef = this.conversationSummary().ref;
    const message: Message = {
      ref: formatMessageRef({
        platform: "irc",
        workspaceId: this.config.workspaceId,
        conversationId: this.config.channel,
        messageId,
      }),
      conversationRef,
      platform: "irc",
      workspaceId: this.config.workspaceId,
      conversationId: this.config.channel,
      messageId,
      authorId: input.authorId,
      authorName: input.authorName,
      text: input.text,
      timestamp: input.timestamp,
    };

    this.messages.push(message);
    while (this.messages.length > this.config.historyLimit) {
      this.messages.shift();
    }
    return message;
  }
}
