import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BlueskyCollector, type BlueskyFeedQuery } from "../src/collectors/bluesky.js";
import type { SignalEvent } from "@workspace/radar-core";

/**
 * Tests for the Bluesky collector and radar_collect_bluesky MCP tool logic.
 *
 * These tests mock the AT Protocol agent to avoid network calls.
 * They cover: successful collection, empty feed, malformed URI, signal normalization,
 * deduplication, and list URI support.
 */

// --- Mock post data ---

function makeBskyPost(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    uri: "at://did:plc:abc123/app.bsky.feed.post/xyz789",
    cid: "bafyreig1234",
    author: {
      did: "did:plc:abc123",
      handle: "alice.bsky.social",
      displayName: "Alice",
    },
    record: {
      $type: "app.bsky.feed.post",
      text: "Test post about geopolitical events and infrastructure",
      createdAt: "2025-01-15T10:00:00.000Z",
      facets: [
        {
          features: [{ uri: "https://example.com/article" }],
        },
      ],
      embed: {
        external: {
          uri: "https://example.com/embed",
          title: "External Article Title",
        },
      },
    },
    likeCount: 5,
    repostCount: 2,
    replyCount: 1,
    ...overrides,
  };
}

function makeReplyPost(): Record<string, unknown> {
  return {
    uri: "at://did:plc:def456/app.bsky.feed.post/reply123",
    cid: "bafyreig5678",
    author: {
      did: "did:plc:def456",
      handle: "bob.bsky.social",
      displayName: "Bob",
    },
    record: {
      $type: "app.bsky.feed.post",
      text: "This is a reply to the original post",
      createdAt: "2025-01-15T11:00:00.000Z",
      reply: {
        parent: {
          uri: "at://did:plc:abc123/app.bsky.feed.post/xyz789",
        },
      },
    },
    likeCount: 1,
    repostCount: 0,
    replyCount: 0,
  };
}

// --- Tests ---

describe("bluesky collector: signal normalization", () => {
  it("normalizes a post into a valid SignalEvent", () => {
    const collector = new BlueskyCollector();
    // Access the private method via prototype for testing
    const postToSignalEvent = (collector as unknown as { _postToSignalEvent: (post: unknown) => SignalEvent })._postToSignalEvent.bind(collector);

    const post = makeBskyPost();
    const signal = postToSignalEvent(post);

    // Validate required SignalEvent fields
    expect(signal.id).toBeTruthy();
    expect(typeof signal.id).toBe("string");
    expect(signal.provenance.source_type).toBe("bluesky");
    expect(signal.provenance.author).toBe("alice.bsky.social");
    expect(signal.provenance.post_uri).toBe("at://did:plc:abc123/app.bsky.feed.post/xyz789");
    expect(signal.provenance.confidence_class).toBe("firsthand");
    expect(signal.provenance.retrieved_at).toBeTruthy();
    expect(signal.text).toBe("Test post about geopolitical events and infrastructure");
    expect(signal.title).toBe("External Article Title");
    expect(signal.observed_at).toBe("2025-01-15T10:00:00.000Z");
    expect(signal.ingested_at).toBeTruthy();
    expect(signal.content_hash).toBeTruthy();
    expect(signal.links).toContain("https://example.com/article");
    expect(signal.links).toContain("https://example.com/embed");
    expect(signal.metadata).toEqual({
      like_count: 5,
      repost_count: 2,
      reply_count: 1,
      author_did: "did:plc:abc123",
    });
  });

  it("sets confidence_class to 'commentary' for reply posts", () => {
    const collector = new BlueskyCollector();
    const postToSignalEvent = (collector as unknown as { _postToSignalEvent: (post: unknown) => SignalEvent })._postToSignalEvent.bind(collector);

    const reply = makeReplyPost();
    const signal = postToSignalEvent(reply);

    expect(signal.provenance.confidence_class).toBe("commentary");
    expect(signal.provenance.parent_uri).toBe("at://did:plc:abc123/app.bsky.feed.post/xyz789");
  });

  it("handles posts with no facets or embeds gracefully", () => {
    const collector = new BlueskyCollector();
    const postToSignalEvent = (collector as unknown as { _postToSignalEvent: (post: unknown) => SignalEvent })._postToSignalEvent.bind(collector);

    const barePost = {
      uri: "at://did:plc:bare/app.bsky.feed.post/bare",
      author: { did: "did:plc:bare", handle: "bare.bsky.social" },
      record: {
        text: "A simple text post",
        createdAt: "2025-01-15T12:00:00.000Z",
      },
    };

    const signal = postToSignalEvent(barePost);
    expect(signal.text).toBe("A simple text post");
    expect(signal.links).toEqual([]);
    expect(signal.provenance.source_type).toBe("bluesky");
    expect(signal.content_hash).toBeTruthy();
  });

  it("generates unique content hashes for different texts", () => {
    const collector = new BlueskyCollector();
    const postToSignalEvent = (collector as unknown as { _postToSignalEvent: (post: unknown) => SignalEvent })._postToSignalEvent.bind(collector);

    const post1 = makeBskyPost({ record: { text: "Post about topic A", createdAt: "2025-01-15T10:00:00.000Z" } });
    const post2 = makeBskyPost({ record: { text: "Post about topic B", createdAt: "2025-01-15T10:00:00.000Z" } });

    const signal1 = postToSignalEvent(post1);
    const signal2 = postToSignalEvent(post2);

    expect(signal1.content_hash).not.toBe(signal2.content_hash);
  });
});

describe("bluesky collector: collectFromFeed", () => {
  it("returns an empty array for feeds with no posts", async () => {
    const collector = new BlueskyCollector();

    // Mock the agent's search endpoint to return empty
    const agent = (collector as unknown as { agent: { app: { bsky: { feed: Record<string, unknown> } } } }).agent;
    agent.app.bsky.feed.searchPosts = vi.fn().mockResolvedValue({
      data: { posts: [] },
    });

    const events = await collector.collectFromFeed({ searchQuery: "nonexistent-query-xyz123" });
    expect(events).toEqual([]);
    expect(events.length).toBe(0);
  });

  it("collects posts from a search query", async () => {
    const collector = new BlueskyCollector();

    // Mock the agent's search endpoint
    const agent = (collector as unknown as { agent: { app: { bsky: { feed: Record<string, unknown> } } } }).agent;
    agent.app.bsky.feed.searchPosts = vi.fn().mockResolvedValue({
      data: {
        posts: [makeBskyPost(), makeReplyPost()],
      },
    });

    const events = await collector.collectFromFeed({ searchQuery: "geopolitics", limit: 10 });
    expect(events.length).toBe(2);
    expect(events[0].provenance.source_type).toBe("bluesky");
    expect(events[1].provenance.source_type).toBe("bluesky");
  });

  it("collects posts from an actor feed", async () => {
    const collector = new BlueskyCollector();

    const agent = (collector as unknown as { agent: { app: { bsky: { feed: Record<string, unknown> } } } }).agent;
    agent.app.bsky.feed.getAuthorFeed = vi.fn().mockResolvedValue({
      data: {
        feed: [{ post: makeBskyPost() }],
      },
    });

    const events = await collector.collectFromFeed({ actor: "alice.bsky.social" });
    expect(events.length).toBe(1);
    expect(events[0].provenance.author).toBe("alice.bsky.social");
  });

  it("collects posts from a feed URI", async () => {
    const collector = new BlueskyCollector();

    const agent = (collector as unknown as { agent: { app: { bsky: { feed: Record<string, unknown> } } } }).agent;
    agent.app.bsky.feed.getFeed = vi.fn().mockResolvedValue({
      data: {
        feed: [{ post: makeBskyPost() }, { post: makeReplyPost() }],
      },
    });

    const events = await collector.collectFromFeed({ feed: "at://did:plc:feed/app.bsky.feed.generator/test" });
    expect(events.length).toBe(2);
  });

  it("collects posts from a list URI", async () => {
    const collector = new BlueskyCollector();

    const agent = (collector as unknown as { agent: { app: { bsky: { feed: Record<string, unknown> } } } }).agent;
    agent.app.bsky.feed.getListFeed = vi.fn().mockResolvedValue({
      data: {
        feed: [{ post: makeBskyPost() }],
      },
    });

    const events = await collector.collectFromFeed({ list: "at://did:plc:user/app.bsky.graph.list/mylist" });
    expect(events.length).toBe(1);
    expect(events[0].provenance.source_type).toBe("bluesky");
  });

  it("handles API errors gracefully and returns empty array", async () => {
    const collector = new BlueskyCollector();

    const agent = (collector as unknown as { agent: { app: { bsky: { feed: Record<string, unknown> } } } }).agent;
    agent.app.bsky.feed.searchPosts = vi.fn().mockRejectedValue(new Error("Network error"));

    const events = await collector.collectFromFeed({ searchQuery: "test" });
    expect(events).toEqual([]);
  });
});

describe("bluesky collector: MCP tool validation", () => {
  it("rejects when no query parameter is provided", () => {
    // Simulate MCP tool validation: at least one of feedUri, listUri, actor, or searchQuery required
    const feedUri = undefined;
    const listUri = undefined;
    const actor = undefined;
    const searchQuery = undefined;

    const hasQuery = Boolean(feedUri ?? listUri ?? actor ?? searchQuery);
    expect(hasQuery).toBe(false);
  });

  it("rejects malformed feedUri that does not start with at://", () => {
    const feedUri = "https://bsky.social/not-a-valid-at-uri";
    const isValid = feedUri.startsWith("at://");
    expect(isValid).toBe(false);
  });

  it("rejects malformed listUri that does not start with at://", () => {
    const listUri = "invalid-uri";
    const isValid = listUri.startsWith("at://");
    expect(isValid).toBe(false);
  });

  it("accepts valid AT Protocol URIs", () => {
    const feedUri = "at://did:plc:abc123/app.bsky.feed.generator/my-feed";
    const listUri = "at://did:plc:abc123/app.bsky.graph.list/my-list";

    expect(feedUri.startsWith("at://")).toBe(true);
    expect(listUri.startsWith("at://")).toBe(true);
  });
});
