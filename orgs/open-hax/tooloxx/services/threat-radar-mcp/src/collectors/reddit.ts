import { randomUUID } from "node:crypto";

type SignalEvent = {
  id: string;
  provenance: {
    source_type: string;
    author: string;
    post_uri: string;
    parent_uri?: string;
    confidence_class: string;
    retrieved_at: string;
  };
  text: string;
  title?: string;
  links: string[];
  domain_tags: string[];
  observed_at: string;
  ingested_at: string;
  content_hash: string;
  metadata: Record<string, unknown>;
};

export interface RedditCollectorConfig {
  userAgent?: string;
}

export interface RedditQuery {
  subreddit: string;
  sort?: "hot" | "new" | "top" | "rising";
  limit?: number;
  timeframe?: "hour" | "day" | "week" | "month" | "year" | "all";
}

function nowIso(): string {
  return new Date().toISOString();
}

function hashContent(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export class RedditCollector {
  private userAgent: string;

  constructor(config?: RedditCollectorConfig) {
    this.userAgent = config?.userAgent ?? "threat-radar-mcp/0.1.0";
  }

  async collectFromSubreddit(query: RedditQuery): Promise<SignalEvent[]> {
    const sort = query.sort ?? "hot";
    const limit = Math.min(query.limit ?? 25, 100);
    const events: SignalEvent[] = [];

    const url = new URL(`https://www.reddit.com/r/${query.subreddit}/${sort}.json`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("raw_json", "1");
    if (query.timeframe && (sort === "top")) {
      url.searchParams.set("t", query.timeframe);
    }

    try {
      const response = await fetch(url.toString(), {
        headers: { "User-Agent": this.userAgent },
      });
      if (!response.ok) {
        console.error(`[reddit-collector] HTTP ${response.status} for ${url}`);
        return events;
      }
      const data = await response.json() as any;
      const children = data?.data?.children ?? [];

      for (const child of children) {
        const post = child.data;
        if (!post) continue;
        events.push(this._postToSignalEvent(post, query.subreddit));
      }
    } catch (err) {
      console.error("[reddit-collector] fetch error:", err);
    }

    return events;
  }

  async collectFromThread(subreddit: string, threadId: string): Promise<SignalEvent[]> {
    const events: SignalEvent[] = [];
    const url = `https://www.reddit.com/r/${subreddit}/comments/${threadId}.json?raw_json=1&limit=50`;

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": this.userAgent },
      });
      if (!response.ok) return events;
      const data = await response.json() as any;

      if (Array.isArray(data) && data[0]?.data?.children?.[0]?.data) {
        const op = data[0].data.children[0].data;
        events.push(this._postToSignalEvent(op, subreddit));
      }

      if (Array.isArray(data) && data[1]?.data?.children) {
        for (const child of data[1].data.children) {
          if (child.kind !== "t1" || !child.data) continue;
          events.push(this._commentToSignalEvent(child.data, subreddit));
        }
      }
    } catch (err) {
      console.error("[reddit-collector] thread fetch error:", err);
    }

    return events;
  }

  private _postToSignalEvent(post: any, subreddit: string): SignalEvent {
    const text = String(post.selftext || post.title || "");
    const title = String(post.title || "");
    const links: string[] = [];
    if (post.url && post.url !== post.permalink) {
      links.push(post.url);
    }

    return {
      id: randomUUID(),
      provenance: {
        source_type: "reddit",
        author: `u/${post.author ?? "unknown"}`,
        post_uri: `https://reddit.com${post.permalink ?? ""}`,
        confidence_class: post.is_self ? "firsthand" : "commentary",
        retrieved_at: nowIso(),
      },
      text: text || title,
      title,
      links,
      domain_tags: [subreddit],
      observed_at: post.created_utc
        ? new Date(post.created_utc * 1000).toISOString()
        : nowIso(),
      ingested_at: nowIso(),
      content_hash: hashContent(text || title),
      metadata: {
        score: post.score ?? 0,
        num_comments: post.num_comments ?? 0,
        upvote_ratio: post.upvote_ratio ?? 0,
        subreddit,
        post_id: post.id,
        is_self: Boolean(post.is_self),
        domain: post.domain,
      },
    };
  }

  private _commentToSignalEvent(comment: any, subreddit: string): SignalEvent {
    const text = String(comment.body || "");
    return {
      id: randomUUID(),
      provenance: {
        source_type: "reddit",
        author: `u/${comment.author ?? "unknown"}`,
        post_uri: `https://reddit.com${comment.permalink ?? ""}`,
        parent_uri: comment.parent_id ? `reddit:${comment.parent_id}` : undefined,
        confidence_class: "commentary",
        retrieved_at: nowIso(),
      },
      text,
      links: [],
      domain_tags: [subreddit],
      observed_at: comment.created_utc
        ? new Date(comment.created_utc * 1000).toISOString()
        : nowIso(),
      ingested_at: nowIso(),
      content_hash: hashContent(text),
      metadata: {
        score: comment.score ?? 0,
        subreddit,
        comment_id: comment.id,
        depth: comment.depth ?? 0,
      },
    };
  }
}
