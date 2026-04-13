import type { GraphWeaver } from "./graph-weaver.js";

export interface FeedItem {
  title: string;
  link: string;
  publishedAt: number;
}

function parseRssItems(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  for (const block of itemMatches.slice(0, 12)) {
    const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "untitled").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
    const link =
      (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || block.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] || "").trim();
    const publishedRaw =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] ||
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1] ||
      block.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1] ||
      "";
    items.push({
      title,
      link,
      publishedAt: Date.parse(publishedRaw) || Date.now(),
    });
  }
  return items.filter((item) => item.link);
}

export class RssPoller {
  private readonly feeds: string[];
  private readonly graphWeaver?: GraphWeaver;
  private readonly items = new Map<string, FeedItem[]>();
  private timer: NodeJS.Timeout | null = null;
  private readonly pollMs: number;

  constructor(graphWeaver?: GraphWeaver) {
    this.graphWeaver = graphWeaver;
    this.feeds = (process.env.CEPHALON_RSS_FEEDS || "")
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    this.pollMs = Number(process.env.CEPHALON_RSS_POLL_MS || 900_000);
  }

  async start(): Promise<void> {
    if (this.feeds.length === 0) return;
    await this.pollAll();
    this.timer = setInterval(() => {
      void this.pollAll();
    }, this.pollMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async pollAll(): Promise<void> {
    for (const feed of this.feeds) {
      try {
        const response = await fetch(feed, { headers: { "User-Agent": "CephalonRSS/1.0" } });
        if (!response.ok) continue;
        const xml = await response.text();
        const parsed = parseRssItems(xml);
        this.items.set(feed, parsed.slice(0, 8));
        this.graphWeaver?.ingestFeedItems(feed, parsed.slice(0, 8));
      } catch {
        // ignore transient feed failures
      }
    }
  }

  summary(): string {
    const top = Array.from(this.items.entries())
      .flatMap(([feed, items]) => items.slice(0, 2).map((item) => `${item.title} <${item.link}>`));
    return top.length > 0 ? `RSS: ${top.join(" | ")}` : "RSS: none";
  }
}
