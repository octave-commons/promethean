import { AtpAgent } from "@atproto/api";
import type { SignalEvent } from "@workspace/radar-core";
import { randomUUID } from "node:crypto";

export interface BlueskyCollectorConfig {
  service?: string;
  identifier?: string;
  password?: string;
}

export interface BlueskyFeedQuery {
  actor?: string;
  feed?: string;
  list?: string;
  limit?: number;
  searchQuery?: string;
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

export class BlueskyCollector {
  private agent: AtpAgent;
  private authenticated = false;

  constructor(config?: BlueskyCollectorConfig) {
    // Use public API endpoint by default for unauthenticated access
    // bsky.social requires auth; public.api.bsky.app does not
    const defaultService = (config?.identifier && config?.password)
      ? "https://bsky.social"
      : "https://public.api.bsky.app";
    this.agent = new AtpAgent({ service: config?.service ?? defaultService });
    if (config?.identifier && config?.password) {
      this._login(config.identifier, config.password).catch(() => {});
    }
  }

  private async _login(identifier: string, password: string): Promise<void> {
    try {
      await this.agent.login({ identifier, password });
      this.authenticated = true;
    } catch {
      this.authenticated = false;
    }
  }

  async collectFromFeed(query: BlueskyFeedQuery): Promise<SignalEvent[]> {
    const limit = Math.min(query.limit ?? 25, 100);
    const events: SignalEvent[] = [];

    try {
      if (query.searchQuery) {
        const result = await this.agent.app.bsky.feed.searchPosts({
          q: query.searchQuery,
          limit,
        });
        for (const post of result.data.posts) {
          events.push(this._postToSignalEvent(post));
        }
      } else if (query.feed) {
        const result = await this.agent.app.bsky.feed.getFeed({
          feed: query.feed,
          limit,
        });
        for (const item of result.data.feed) {
          events.push(this._postToSignalEvent(item.post));
        }
      } else if (query.list) {
        const result = await this.agent.app.bsky.feed.getListFeed({
          list: query.list,
          limit,
        });
        for (const item of result.data.feed) {
          events.push(this._postToSignalEvent(item.post));
        }
      } else if (query.actor) {
        const result = await this.agent.app.bsky.feed.getAuthorFeed({
          actor: query.actor,
          limit,
        });
        for (const item of result.data.feed) {
          events.push(this._postToSignalEvent(item.post));
        }
      }
    } catch (err) {
      console.error("[bluesky-collector] fetch error:", err);
    }

    return events;
  }

  private _postToSignalEvent(post: any): SignalEvent {
    const record = post.record as any;
    const text = String(record?.text ?? "");
    const author = post.author?.handle ?? post.author?.did ?? "unknown";
    const postUri = post.uri ?? "";

    const links: string[] = [];
    if (record?.facets) {
      for (const facet of record.facets) {
        for (const feature of facet.features ?? []) {
          if (feature.uri) links.push(feature.uri);
        }
      }
    }
    if (record?.embed?.external?.uri) {
      links.push(record.embed.external.uri);
    }

    const parentUri = record?.reply?.parent?.uri;

    return {
      id: randomUUID(),
      provenance: {
        source_type: "bluesky",
        author,
        post_uri: postUri,
        parent_uri: parentUri,
        confidence_class: parentUri ? "commentary" : "firsthand",
        retrieved_at: nowIso(),
      },
      text,
      title: record?.embed?.external?.title,
      links,
      domain_tags: [],
      observed_at: record?.createdAt ?? nowIso(),
      ingested_at: nowIso(),
      content_hash: hashContent(text),
      metadata: {
        like_count: post.likeCount ?? 0,
        repost_count: post.repostCount ?? 0,
        reply_count: post.replyCount ?? 0,
        author_did: post.author?.did,
      },
    };
  }
}
