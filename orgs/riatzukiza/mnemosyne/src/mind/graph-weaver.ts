import { promises as fs } from "node:fs";
import path from "node:path";
import type { DiscordMessagePayload } from "../types/index.js";

export interface GraphNode {
  id: string;
  kind: string;
  label: string;
  weight: number;
  lastSeenAt: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: string;
  weight: number;
  lastSeenAt: number;
}

interface PersistedGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function urlsFromText(text: string): string[] {
  return Array.from(text.matchAll(/https?:\/\/[^\s>]+/gi)).map((match) => match[0]);
}

export class GraphWeaver {
  private nodes = new Map<string, GraphNode>();
  private edges = new Map<string, GraphEdge>();
  private persistTimer: NodeJS.Timeout | null = null;
  private readonly persistPath: string;

  constructor(baseDir = process.env.CEPHALON_STATE_DIR || "/cephalon/state") {
    this.persistPath = path.join(baseDir, "graph-weaver.json");
  }

  async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.persistPath, "utf-8");
      const parsed = JSON.parse(raw) as PersistedGraph;
      for (const node of parsed.nodes ?? []) {
        this.nodes.set(node.id, node);
      }
      for (const edge of parsed.edges ?? []) {
        this.edges.set(edge.id, edge);
      }
    } catch {
      // ignore missing state
    }
  }

  ingestDiscordMessage(payload: DiscordMessagePayload): void {
    const now = payload.timestamp ?? Date.now();
    const guildNode = this.upsertNode(`guild:${payload.guildId}`, "guild", payload.guildName || payload.guildId, now);
    const channelNode = this.upsertNode(`channel:${payload.channelId}`, "channel", payload.channelName || payload.channelId, now);
    const authorNode = this.upsertNode(`author:${payload.authorId}`, "author", payload.authorUsername || payload.authorId, now);
    const messageNode = this.upsertNode(`message:${payload.messageId}`, "message", payload.content.slice(0, 80) || payload.messageId, now);

    this.upsertEdge(guildNode.id, channelNode.id, "contains", now);
    this.upsertEdge(channelNode.id, messageNode.id, "contains", now);
    this.upsertEdge(authorNode.id, messageNode.id, "authored", now);

    for (const url of urlsFromText(payload.content || "")) {
      const urlNode = this.upsertNode(`url:${url}`, "url", url, now);
      this.upsertEdge(messageNode.id, urlNode.id, "links", now);
      this.upsertEdge(channelNode.id, urlNode.id, "mentions-url", now);
    }

    for (const attachment of Array.isArray(payload.attachments) ? payload.attachments : []) {
      const record = attachment as { url?: string; filename?: string };
      if (!record.url) continue;
      const attachmentNode = this.upsertNode(`asset:${record.url}`, "asset", record.filename || record.url, now);
      this.upsertEdge(messageNode.id, attachmentNode.id, "attaches", now);
    }

    this.schedulePersist();
  }

  ingestFeedItems(feedId: string, items: Array<{ title: string; link: string; publishedAt: number }>): void {
    const feedNode = this.upsertNode(`feed:${feedId}`, "feed", feedId, Date.now());
    for (const item of items) {
      const itemNode = this.upsertNode(`feed-item:${item.link}`, "feed-item", item.title, item.publishedAt);
      this.upsertEdge(feedNode.id, itemNode.id, "emits", item.publishedAt);
    }
    this.schedulePersist();
  }

  summarize(limit = 6): string {
    const topChannels = Array.from(this.nodes.values())
      .filter((node) => node.kind === "channel")
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit)
      .map((node) => `${node.label}(${node.weight.toFixed(1)})`);

    const hotUrls = Array.from(this.nodes.values())
      .filter((node) => node.kind === "url")
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((node) => node.label);

    return `Graph channels: ${topChannels.join(", ") || "none"}. Hot links: ${hotUrls.join(", ") || "none"}. Nodes=${this.nodes.size} Edges=${this.edges.size}.`;
  }

  async flush(): Promise<void> {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    await this.persist();
  }

  private upsertNode(id: string, kind: string, label: string, timestamp: number): GraphNode {
    const existing = this.nodes.get(id);
    if (existing) {
      existing.weight += 1;
      existing.lastSeenAt = timestamp;
      if (label) existing.label = label;
      return existing;
    }
    const created: GraphNode = { id, kind, label, weight: 1, lastSeenAt: timestamp };
    this.nodes.set(id, created);
    return created;
  }

  private upsertEdge(source: string, target: string, kind: string, timestamp: number): void {
    const id = `${source}|${kind}|${target}`;
    const existing = this.edges.get(id);
    if (existing) {
      existing.weight += 1;
      existing.lastSeenAt = timestamp;
      return;
    }
    this.edges.set(id, { id, source, target, kind, weight: 1, lastSeenAt: timestamp });
  }

  private schedulePersist(): void {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      void this.persist();
    }, 1_500);
  }

  private async persist(): Promise<void> {
    await fs.mkdir(path.dirname(this.persistPath), { recursive: true });
    const payload: PersistedGraph = {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
    await fs.writeFile(this.persistPath, JSON.stringify(payload, null, 2), "utf-8");
  }
}
