import net from "node:net";
import tls from "node:tls";

export interface IrcApiConfig {
  host: string;
  port: number;
  tls: boolean;
  tlsServerName?: string;
  nick: string;
  user: string;
  realName: string;
  workspaceId: string;
  channel: string;
  historyLimit?: number;
}

export interface IrcMessage {
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

export interface IrcServer {
  id: string;
  name: string;
  memberCount: number;
}

export interface IrcChannel {
  id: string;
  name: string;
  guildId: string;
  type: string;
}

interface ParsedIrcLine {
  prefix?: string;
  command: string;
  params: string[];
}

interface SubscriberMessage {
  readonly message: IrcMessage;
  readonly channelId: string;
  readonly channelName: string;
  readonly workspaceId: string;
  readonly mentionUserIds: string[];
  readonly mentionsSelf: boolean;
  readonly replyTo?: string | null;
}

const DEFAULT_HISTORY_LIMIT = 200;
const IRC_MESSAGE_BUFFER = 420;

function parseIrcLine(line: string): ParsedIrcLine {
  let rest = line.trim();
  let prefix: string | undefined;

  if (rest.startsWith(":")) {
    const idx = rest.indexOf(" ");
    prefix = rest.slice(1, idx);
    rest = rest.slice(idx + 1);
  }

  const parts: string[] = [];
  while (rest.length > 0) {
    if (rest.startsWith(":")) {
      parts.push(rest.slice(1));
      break;
    }

    const idx = rest.indexOf(" ");
    if (idx === -1) {
      parts.push(rest);
      break;
    }

    parts.push(rest.slice(0, idx));
    rest = rest.slice(idx + 1).replace(/^\s+/, "");
  }

  const [command = "", ...params] = parts;
  return {
    prefix,
    command: command.toUpperCase(),
    params,
  };
}

function nickFromPrefix(prefix?: string): string {
  if (!prefix) {
    return "server";
  }

  const bang = prefix.indexOf("!");
  return bang >= 0 ? prefix.slice(0, bang) : prefix;
}

function stripNickDecorators(name: string): string {
  return name.replace(/^[~&@%+]+/, "");
}

function sanitizeOutgoing(text: string): string {
  const normalized = text.replace(/\r?\n/g, " ");
  return normalized.length > IRC_MESSAGE_BUFFER ? `${normalized.slice(0, IRC_MESSAGE_BUFFER - 1)}…` : normalized;
}

export function formatIrcServerId(workspaceId: string): string {
  return `irc:${encodeURIComponent(workspaceId)}`;
}

export function formatIrcChannelId(workspaceId: string, channel: string): string {
  return `irc:${encodeURIComponent(workspaceId)}:${encodeURIComponent(channel)}`;
}

export function isIrcChannelId(value: string): boolean {
  return value.startsWith("irc:");
}

export function parseIrcChannelId(value: string): { workspaceId: string; channel: string } {
  const parts = value.split(":");
  if (parts.length !== 3 || parts[0] !== "irc") {
    throw new Error(`Invalid IRC channel id: ${value}`);
  }

  return {
    workspaceId: decodeURIComponent(parts[1] || ""),
    channel: decodeURIComponent(parts[2] || ""),
  };
}

export function parseIrcServerId(value: string): { workspaceId: string } {
  const parts = value.split(":");
  if (parts.length !== 2 || parts[0] !== "irc") {
    throw new Error(`Invalid IRC server id: ${value}`);
  }

  return {
    workspaceId: decodeURIComponent(parts[1] || ""),
  };
}

export function createDefaultIrcApiConfig(env: NodeJS.ProcessEnv = process.env): IrcApiConfig {
  const stableNick = (env.CEPHALON_IRC_NICK
    || env.CEPHALON_NAME
    || "cephalon")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "cephalon";

  return {
    host: env.CEPHALON_IRC_HOST || env.CHAT_BRIDGE_IRC_HOST || "irc.ussy.host",
    port: Number.parseInt(env.CEPHALON_IRC_PORT || env.CHAT_BRIDGE_IRC_PORT || "6697", 10),
    tls: !/^(0|false|no|off)$/i.test(env.CEPHALON_IRC_TLS || env.CHAT_BRIDGE_IRC_TLS || "true"),
    tlsServerName: env.CEPHALON_IRC_TLS_SERVERNAME || env.CHAT_BRIDGE_IRC_TLS_SERVERNAME || undefined,
    nick: stableNick,
    user: env.CEPHALON_IRC_USER || "cephalon",
    realName: env.CEPHALON_IRC_REALNAME || `${env.CEPHALON_NAME || "Cephalon"} IRC bridge`,
    workspaceId: env.CEPHALON_IRC_WORKSPACE || env.CHAT_BRIDGE_IRC_WORKSPACE || "ussy",
    channel: env.CEPHALON_IRC_CHANNEL || env.CHAT_BRIDGE_IRC_CHANNEL || "#ussycode",
    historyLimit: Number.parseInt(env.CEPHALON_IRC_HISTORY_LIMIT || "200", 10),
  };
}

export class IrcApiClient {
  private readonly config: IrcApiConfig;
  private socket: net.Socket | tls.TLSSocket | null = null;
  private connectPromise: Promise<void> | null = null;
  private buffer = "";
  private joined = false;
  private currentNick: string;
  private sequence = 0;
  private readonly messages: IrcMessage[] = [];
  private readonly members = new Map<string, { id: string; displayName: string }>();
  private readonly subscribers = new Set<(message: SubscriberMessage) => void>();

  constructor(config: IrcApiConfig) {
    this.config = config;
    this.currentNick = config.nick;
  }

  onMessage(callback: (message: SubscriberMessage) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  async start(): Promise<void> {
    console.log(`[IRC] Connecting ${this.config.nick} to ${this.config.host}:${this.config.port} ${this.config.channel}`);
    await this.ensureConnected();
  }

  async stop(): Promise<void> {
    if (this.socket && !this.socket.destroyed) {
      this.sendRaw("QUIT :cephalon stopping");
      this.socket.end();
    }
    this.socket = null;
    this.joined = false;
    this.connectPromise = null;
  }

  async fetchChannelMessages(
    channelId: string,
    options: { limit?: number; before?: string } = {},
  ): Promise<{ messages: IrcMessage[]; count: number }> {
    await this.ensureConnected();
    const { channel } = parseIrcChannelId(channelId);
    if (channel !== this.config.channel) {
      throw new Error(`IRC channel not configured: ${channel}`);
    }

    const source = [...this.messages];
    if (!options.before) {
      const messages = source.slice(-Math.min(options.limit ?? 50, source.length)).reverse();
      return { messages, count: messages.length };
    }

    const index = source.findIndex((message) => message.id === options.before);
    const bounded = index >= 0 ? source.slice(Math.max(0, index - (options.limit ?? 50)), index) : source.slice(-(options.limit ?? 50));
    const messages = bounded.reverse();
    return { messages, count: messages.length };
  }

  async searchMessages(
    channelId: string,
    options: { query?: string; userId?: string; limit?: number; before?: string } = {},
  ): Promise<{ messages: IrcMessage[]; count: number; source: string }> {
    const { messages } = await this.fetchChannelMessages(channelId, {
      limit: Math.max(options.limit ?? 50, 100),
      before: options.before,
    });

    let filtered = messages;
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter((message) => message.content.toLowerCase().includes(query));
    }

    if (options.userId) {
      filtered = filtered.filter((message) => message.authorId === options.userId);
    }

    const limited = filtered.slice(0, options.limit ?? 50);
    return { messages: limited, count: limited.length, source: "client_side_filter" };
  }

  async sendMessage(
    channelId: string,
    text: string,
    replyTo?: string,
  ): Promise<{ messageId: string; channelId: string; sent: boolean; timestamp: string }> {
    await this.ensureConnected();
    const { channel } = parseIrcChannelId(channelId);
    const replyTarget = replyTo ? this.messages.find((message) => message.id === replyTo) : undefined;
    const content = replyTarget ? `${replyTarget.authorUsername}: ${text}` : text;
    const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
    const firstLineId = this.appendMessage(this.currentNick, lines[0] || "", false).id;
    for (const line of lines) {
      const sanitized = sanitizeOutgoing(line);
      console.log(`[IRC] send ${channel}: ${sanitized.slice(0, 180)}`);
      this.sendRaw(`PRIVMSG ${channel} :${sanitized}`);
    }
    const message = this.appendMessage(this.currentNick, content, false);
    return {
      messageId: message.id,
      channelId,
      sent: true,
      timestamp: message.timestamp.toISOString(),
    };
  }

  async listServers(): Promise<{ servers: IrcServer[]; count: number }> {
    await this.ensureConnected().catch(() => undefined);
    const servers: IrcServer[] = [{
      id: formatIrcServerId(this.config.workspaceId),
      name: this.config.workspaceId,
      memberCount: this.members.size,
    }];
    return { servers, count: servers.length };
  }

  async listChannels(serverId?: string): Promise<{ channels: IrcChannel[]; count: number }> {
    await this.ensureConnected().catch(() => undefined);
    if (serverId) {
      const parsed = parseIrcServerId(serverId);
      if (parsed.workspaceId !== this.config.workspaceId) {
        return { channels: [], count: 0 };
      }
    }

    const channels: IrcChannel[] = [{
      id: formatIrcChannelId(this.config.workspaceId, this.config.channel),
      name: this.config.channel,
      guildId: formatIrcServerId(this.config.workspaceId),
      type: "irc-channel",
    }];
    return { channels, count: channels.length };
  }

  async getMembers(channelId: string): Promise<{ members: Array<{ id: string; name: string }>; count: number }> {
    await this.ensureConnected();
    const { channel } = parseIrcChannelId(channelId);
    if (channel !== this.config.channel) {
      throw new Error(`IRC channel not configured: ${channel}`);
    }

    this.sendRaw(`NAMES ${channel}`);
    const members = Array.from(this.members.values())
      .map((member) => ({ id: member.id, name: member.displayName }))
      .sort((left, right) => left.name.localeCompare(right.name));
    return { members, count: members.length };
  }

  getDefaultChannelId(): string {
    return formatIrcChannelId(this.config.workspaceId, this.config.channel);
  }

  private async ensureConnected(): Promise<void> {
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
      this.buffer = "";

      const timeout = setTimeout(() => {
        reject(new Error(`Timed out connecting to IRC ${this.config.host}:${this.config.port}`));
      }, 12000);

      const finish = (error?: Error): void => {
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
          if (line.length > 0) {
            this.handleLine(line, finish);
          }
        }
      });

      socket.on("error", (error) => {
        finish(error instanceof Error ? error : new Error(String(error)));
      });

      socket.on("close", () => {
        this.socket = null;
        this.joined = false;
      });
    }).finally(() => {
      this.connectPromise = null;
    });

    return this.connectPromise;
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
        const nick = stripNickDecorators(rawName);
        this.members.set(nick, { id: nick, displayName: nick });
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
        console.log(`[IRC] Joined ${this.config.channel} as ${this.currentNick}`);
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
      const previousNick = nickFromPrefix(parsed.prefix);
      const nextNick = parsed.params[0] || previousNick;
      if (this.members.has(previousNick)) {
        this.members.delete(previousNick);
      }
      this.members.set(nextNick, { id: nextNick, displayName: nextNick });
      if (previousNick === this.currentNick) {
        this.currentNick = nextNick;
      }
      return;
    }

    if (parsed.command !== "PRIVMSG") {
      return;
    }

    const target = parsed.params[0] || "";
    if (target !== this.config.channel) {
      return;
    }

    const nick = nickFromPrefix(parsed.prefix);
    this.members.set(nick, { id: nick, displayName: nick });
    const message = this.appendMessage(nick, parsed.params[1] || "", nick === this.currentNick);
    console.log(`[IRC] recv ${nick} ${target}: ${message.content.slice(0, 180)}`);

    const mentionPattern = new RegExp(`(^|[^a-z0-9_-])${this.escapeRegExp(this.currentNick)}([^a-z0-9_-]|$)`, "i");
    const mentionsSelf = mentionPattern.test(message.content);
    const mentionUserIds = mentionsSelf ? [this.currentNick] : [];

    for (const callback of this.subscribers) {
      callback({
        message,
        channelId: this.getDefaultChannelId(),
        channelName: this.config.channel,
        workspaceId: this.config.workspaceId,
        mentionUserIds,
        mentionsSelf,
        replyTo: null,
      });
    }
  }

  private appendMessage(authorId: string, content: string, authorIsBot: boolean): IrcMessage {
    this.sequence += 1;
    const message: IrcMessage = {
      id: `${Date.now()}-${this.sequence}`,
      content,
      authorId,
      authorUsername: authorId,
      authorIsBot,
      timestamp: new Date(),
      attachments: [],
      embeds: [],
    };
    this.messages.push(message);
    while (this.messages.length > (this.config.historyLimit ?? DEFAULT_HISTORY_LIMIT)) {
      this.messages.shift();
    }
    return message;
  }

  private sendRaw(line: string): void {
    this.socket?.write(`${line}\r\n`);
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
