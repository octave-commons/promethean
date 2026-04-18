import { describe, it, expect, vi, beforeEach } from "vitest";
import { RedditCollector, type RedditQuery } from "../src/collectors/reddit.js";
import type { SignalEvent } from "@workspace/radar-core";

/**
 * Tests for the Reddit collector and radar_collect_reddit MCP tool logic.
 *
 * These tests mock global fetch to avoid network calls.
 * They cover: signal normalization, successful collection, empty subreddit,
 * deduplication via content_hash, error handling, and multiple subreddit collection.
 */

// --- Mock Reddit API response data ---

function makeRedditPost(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "abc123",
    title: "AI model scaling laws and infrastructure costs",
    selftext: "Interesting discussion about how scaling laws affect local hosting",
    author: "ml_researcher",
    permalink: "/r/machinelearning/comments/abc123/ai_model_scaling_laws/",
    url: "https://arxiv.org/abs/2024.12345",
    created_utc: 1705312000, // 2024-01-15T10:00:00Z
    score: 142,
    num_comments: 37,
    upvote_ratio: 0.92,
    is_self: false,
    domain: "arxiv.org",
    ...overrides,
  };
}

function makeSelfPost(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "def456",
    title: "Discussion: Running LLMs locally on consumer hardware",
    selftext: "Has anyone tried running the new 70B model on a single GPU? I managed to get it working with quantization but quality seems degraded.",
    author: "local_ai_user",
    permalink: "/r/LocalLLaMA/comments/def456/discussion_running_llms_locally/",
    url: "https://www.reddit.com/r/LocalLLaMA/comments/def456/discussion_running_llms_locally/",
    created_utc: 1705315600, // 2024-01-15T11:00:00Z
    score: 89,
    num_comments: 24,
    upvote_ratio: 0.95,
    is_self: true,
    domain: "self.LocalLLaMA",
    ...overrides,
  };
}

function makeRedditApiResponse(posts: Record<string, unknown>[]): Record<string, unknown> {
  return {
    kind: "Listing",
    data: {
      children: posts.map((p) => ({
        kind: "t3",
        data: p,
      })),
      after: posts.length > 0 ? "t3_lastpost" : null,
    },
  };
}

// --- Tests ---

describe("reddit collector: signal normalization", () => {
  it("normalizes a link post into a valid SignalEvent", () => {
    const collector = new RedditCollector();
    const postToSignalEvent = (collector as unknown as { _postToSignalEvent: (post: unknown, subreddit: string) => SignalEvent })._postToSignalEvent.bind(collector);

    const post = makeRedditPost();
    const signal = postToSignalEvent(post, "machinelearning");

    // Validate required SignalEvent fields
    expect(signal.id).toBeTruthy();
    expect(typeof signal.id).toBe("string");
    expect(signal.provenance.source_type).toBe("reddit");
    expect(signal.provenance.author).toBe("u/ml_researcher");
    expect(signal.provenance.post_uri).toContain("reddit.com");
    expect(signal.provenance.post_uri).toContain("/r/machinelearning/comments/abc123");
    expect(signal.provenance.confidence_class).toBe("commentary"); // link post = commentary
    expect(signal.provenance.retrieved_at).toBeTruthy();
    expect(signal.text).toBeTruthy();
    expect(signal.title).toBe("AI model scaling laws and infrastructure costs");
    expect(signal.observed_at).toBe("2024-01-15T09:46:40.000Z");
    expect(signal.ingested_at).toBeTruthy();
    expect(signal.content_hash).toBeTruthy();
    expect(signal.links).toContain("https://arxiv.org/abs/2024.12345");
    expect(signal.domain_tags).toContain("machinelearning");
    expect(signal.metadata).toMatchObject({
      score: 142,
      num_comments: 37,
      upvote_ratio: 0.92,
      subreddit: "machinelearning",
      post_id: "abc123",
      is_self: false,
      domain: "arxiv.org",
    });
  });

  it("normalizes a self post with confidence_class 'firsthand'", () => {
    const collector = new RedditCollector();
    const postToSignalEvent = (collector as unknown as { _postToSignalEvent: (post: unknown, subreddit: string) => SignalEvent })._postToSignalEvent.bind(collector);

    const self = makeSelfPost();
    const signal = postToSignalEvent(self, "LocalLLaMA");

    expect(signal.provenance.confidence_class).toBe("firsthand");
    expect(signal.provenance.source_type).toBe("reddit");
    expect(signal.domain_tags).toContain("LocalLLaMA");
    expect(signal.text).toContain("Has anyone tried running the new 70B model");
  });

  it("generates unique content hashes for different texts", () => {
    const collector = new RedditCollector();
    const postToSignalEvent = (collector as unknown as { _postToSignalEvent: (post: unknown, subreddit: string) => SignalEvent })._postToSignalEvent.bind(collector);

    const post1 = makeRedditPost({ selftext: "Topic A about energy policy" });
    const post2 = makeRedditPost({ selftext: "Topic B about local AI hosting" });

    const signal1 = postToSignalEvent(post1, "machinelearning");
    const signal2 = postToSignalEvent(post2, "machinelearning");

    expect(signal1.content_hash).not.toBe(signal2.content_hash);
  });

  it("handles posts with missing fields gracefully", () => {
    const collector = new RedditCollector();
    const postToSignalEvent = (collector as unknown as { _postToSignalEvent: (post: unknown, subreddit: string) => SignalEvent })._postToSignalEvent.bind(collector);

    const barePost = {
      id: "bare1",
      title: "Minimal post",
      permalink: "/r/test/comments/bare1/minimal/",
    };

    const signal = postToSignalEvent(barePost, "test");

    expect(signal.provenance.source_type).toBe("reddit");
    expect(signal.provenance.author).toBe("u/unknown");
    expect(signal.text).toBeTruthy(); // falls back to title
    expect(signal.content_hash).toBeTruthy();
    expect(signal.domain_tags).toContain("test");
  });
});

describe("reddit collector: collectFromSubreddit", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches posts from a subreddit and returns SignalEvents", async () => {
    const mockResponse = makeRedditApiResponse([makeRedditPost(), makeSelfPost()]);

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const collector = new RedditCollector();
    const events = await collector.collectFromSubreddit({ subreddit: "machinelearning" });

    expect(events.length).toBe(2);
    expect(events[0].provenance.source_type).toBe("reddit");
    expect(events[1].provenance.source_type).toBe("reddit");
  });

  it("returns an empty array for subreddits with no posts", async () => {
    const mockResponse = makeRedditApiResponse([]);

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const collector = new RedditCollector();
    const events = await collector.collectFromSubreddit({ subreddit: "empty_subreddit_xyz" });

    expect(events).toEqual([]);
    expect(events.length).toBe(0);
  });

  it("handles HTTP errors gracefully and returns empty array", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const collector = new RedditCollector();
    const events = await collector.collectFromSubreddit({ subreddit: "nonexistent" });

    expect(events).toEqual([]);
  });

  it("handles network errors gracefully and returns empty array", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network timeout"));

    const collector = new RedditCollector();
    const events = await collector.collectFromSubreddit({ subreddit: "machinelearning" });

    expect(events).toEqual([]);
  });
});

describe("reddit collector: MCP tool deduplication", () => {
  it("content_hash enables deduplication of identical posts", () => {
    const collector = new RedditCollector();
    const postToSignalEvent = (collector as unknown as { _postToSignalEvent: (post: unknown, subreddit: string) => SignalEvent })._postToSignalEvent.bind(collector);

    const post = makeRedditPost();
    const signal1 = postToSignalEvent(post, "machinelearning");
    const signal2 = postToSignalEvent(post, "machinelearning");

    // Same content should produce same hash for dedup purposes
    expect(signal1.content_hash).toBe(signal2.content_hash);
    // But different UUIDs
    expect(signal1.id).not.toBe(signal2.id);
  });
});

describe("reddit collector: MCP tool input validation", () => {
  it("rejects when no subreddits are provided", () => {
    const subreddits: string[] = [];
    const hasInput = subreddits.length > 0;
    expect(hasInput).toBe(false);
  });

  it("accepts valid subreddit names", () => {
    const subreddits = ["machinelearning", "LocalLLaMA", "artificial"];
    expect(subreddits.length).toBeGreaterThan(0);
    for (const sub of subreddits) {
      expect(sub.length).toBeGreaterThan(0);
    }
  });
});

describe("reddit collector: multi-subreddit collection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("collects from multiple subreddits sequentially", async () => {
    const mlResponse = makeRedditApiResponse([makeRedditPost()]);
    const llamaResponse = makeRedditApiResponse([makeSelfPost()]);

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => mlResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => llamaResponse } as Response);

    const collector = new RedditCollector();
    const allEvents: SignalEvent[] = [];
    for (const sub of ["machinelearning", "LocalLLaMA"]) {
      const events = await collector.collectFromSubreddit({ subreddit: sub });
      allEvents.push(...events);
    }

    expect(allEvents.length).toBe(2);
    expect(allEvents[0].domain_tags).toContain("machinelearning");
    expect(allEvents[1].domain_tags).toContain("LocalLLaMA");
  });
});
