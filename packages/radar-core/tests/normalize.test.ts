import { describe, it, expect } from "vitest";
import {
  normalize,
  _cleanText,
  _assignCategory,
  _computeQualityScore,
  type RawCollectorOutput,
} from "../src/normalize.js";
import { signalEventSchema } from "../src/schema.js";

const NOW = new Date().toISOString();

// ---------------------------------------------------------------------------
// Helper to build minimal raw collector output
// ---------------------------------------------------------------------------

function makeRaw(overrides: Partial<RawCollectorOutput> = {}): RawCollectorOutput {
  return {
    provenance: {
      source_type: "bluesky",
      author: "alice.bsky.social",
      post_uri: "at://did:plc:abc/app.bsky.feed.post/123",
      confidence_class: "firsthand",
      retrieved_at: NOW,
    },
    text: "Breaking: major infrastructure disruption reported in the region.",
    title: "Infrastructure alert",
    links: ["https://example.com/article"],
    domain_tags: ["infrastructure"],
    observed_at: NOW,
    ingested_at: NOW,
    content_hash: "abc123",
    metadata: { like_count: 42 },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// normalize() — core function tests
// ---------------------------------------------------------------------------

describe("normalize", () => {
  it("produces a valid SignalEvent from Bluesky collector output", () => {
    const raw = makeRaw({
      provenance: {
        source_type: "bluesky",
        author: "alice.bsky.social",
        post_uri: "at://did:plc:abc/app.bsky.feed.post/123",
        confidence_class: "firsthand",
        retrieved_at: NOW,
      },
    });

    const result = normalize(raw);

    // Validate against Zod schema
    const parsed = signalEventSchema.safeParse(result);
    expect(parsed.success).toBe(true);

    // Check required fields are populated
    expect(result.id).toBeTruthy();
    expect(result.provenance.source_type).toBe("bluesky");
    expect(result.text).toBe(raw.text);
    expect(typeof result.normalized_content).toBe("string");
    expect(result.normalized_content!.length).toBeGreaterThan(0);
    expect(typeof result.category).toBe("string");
    expect(typeof result.quality_score).toBe("number");
    expect(result.quality_score!).toBeGreaterThanOrEqual(0);
    expect(result.quality_score!).toBeLessThanOrEqual(1);
  });

  it("produces a valid SignalEvent from Reddit collector output", () => {
    const raw = makeRaw({
      provenance: {
        source_type: "reddit",
        author: "u/testuser",
        post_uri: "https://reddit.com/r/machinelearning/comments/abc",
        confidence_class: "firsthand",
        retrieved_at: NOW,
      },
      text: "New open source AI model released with impressive benchmarks on machine learning tasks",
      title: "Open source AI breakthrough",
      domain_tags: ["machinelearning"],
      metadata: { score: 1500, num_comments: 200, subreddit: "machinelearning" },
    });

    const result = normalize(raw);
    const parsed = signalEventSchema.safeParse(result);
    expect(parsed.success).toBe(true);

    expect(result.provenance.source_type).toBe("reddit");
    expect(result.normalized_content).toBeTruthy();
    expect(result.category).toBe("technology");
  });

  it("generates a UUID id when none is provided", () => {
    const raw = makeRaw();
    // Remove id if set
    const { id: _id, ...rest } = raw as Record<string, unknown>;
    const result = normalize(rest as unknown as RawCollectorOutput);

    expect(result.id).toBeTruthy();
    // UUID v4 format check
    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("preserves an existing id when provided", () => {
    const raw = makeRaw({ id: "custom-id-999" });
    const result = normalize(raw);
    expect(result.id).toBe("custom-id-999");
  });

  it("throws for empty text input", () => {
    const raw = makeRaw({ text: "" });
    expect(() => normalize(raw)).toThrow("Cannot normalize signal with empty text input");
  });

  it("throws for whitespace-only text input", () => {
    const raw = makeRaw({ text: "   \n\t  " });
    expect(() => normalize(raw)).toThrow("Cannot normalize signal with empty text input");
  });

  it("handles missing optional fields with defaults", () => {
    const minimal: RawCollectorOutput = {
      provenance: {
        source_type: "bluesky",
        retrieved_at: NOW,
      },
      text: "Some signal content about energy grid outages",
    };

    const result = normalize(minimal);
    const parsed = signalEventSchema.safeParse(result);
    expect(parsed.success).toBe(true);

    // Defaults should be applied
    expect(result.links).toEqual([]);
    expect(result.domain_tags).toEqual([]);
    expect(result.metadata).toEqual({});
    expect(result.provenance.confidence_class).toBe("unknown");
    expect(result.observed_at).toBeTruthy();
    expect(result.ingested_at).toBeTruthy();
    expect(result.category).toBe("infrastructure"); // "energy grid outages"
  });

  it("cleans HTML tags and collapses whitespace in normalized_content", () => {
    const raw = makeRaw({
      text: "<p>Breaking   <b>news</b>:  energy   grid   failure</p>\n\n\tdetails here",
    });
    const result = normalize(raw);
    expect(result.normalized_content).toBe("Breaking news : energy grid failure details here");
    expect(result.normalized_content).not.toContain("<p>");
    expect(result.normalized_content).not.toContain("<b>");
  });

  it("assigns geopolitical category for military/conflict content", () => {
    const raw = makeRaw({
      text: "Military conflict escalation with sanctions imposed and missile deployment near the border",
    });
    const result = normalize(raw);
    expect(result.category).toBe("geopolitical");
  });

  it("assigns technology category for AI/compute content", () => {
    const raw = makeRaw({
      text: "New GPU chip announced for AI model training with improved inference performance at the data center",
    });
    const result = normalize(raw);
    expect(result.category).toBe("technology");
  });

  it("assigns general category when no keywords match", () => {
    const raw = makeRaw({
      text: "The cat sat on the mat and looked out the window",
    });
    const result = normalize(raw);
    expect(result.category).toBe("general");
  });

  it("computes higher quality score for content with links and long text", () => {
    const richRaw = makeRaw({
      text: "A ".repeat(300) + "detailed analysis of the current situation with extensive supporting evidence and multiple data points for consideration",
      links: ["https://source1.com", "https://source2.com"],
      title: "Comprehensive analysis",
      metadata: { score: 500, num_comments: 100 },
    });

    const poorRaw = makeRaw({
      text: "short",
      links: [],
      title: undefined,
      metadata: {},
    });

    const richResult = normalize(richRaw);
    const poorResult = normalize(poorRaw);

    expect(richResult.quality_score!).toBeGreaterThan(poorResult.quality_score!);
    expect(richResult.quality_score!).toBeGreaterThan(0.5);
    expect(poorResult.quality_score!).toBeLessThan(0.5);
  });

  it("quality_score is bounded between 0 and 1", () => {
    // Test extreme cases (empty text is now rejected, so start with minimal non-empty)
    const cases: RawCollectorOutput[] = [
      makeRaw({ text: "x", links: [], metadata: {}, title: undefined }),
      makeRaw({
        text: "A very long text ".repeat(100),
        links: Array.from({ length: 20 }, (_, i) => `https://link${i}.com`),
        title: "Big title",
        metadata: { a: 1, b: 2, c: 3 },
      }),
    ];

    for (const raw of cases) {
      const result = normalize(raw);
      expect(result.quality_score!).toBeGreaterThanOrEqual(0);
      expect(result.quality_score!).toBeLessThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// cleanText — internal helper tests
// ---------------------------------------------------------------------------

describe("cleanText", () => {
  it("strips HTML tags", () => {
    expect(_cleanText("<p>hello <b>world</b></p>")).toBe("hello world");
  });

  it("decodes HTML entities", () => {
    expect(_cleanText("cats &amp; dogs &lt;3")).toBe("cats & dogs <3");
  });

  it("collapses multiple whitespace", () => {
    expect(_cleanText("hello    world\n\nfoo\tbar")).toBe("hello world foo bar");
  });

  it("handles empty string", () => {
    expect(_cleanText("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// assignCategory — internal helper tests
// ---------------------------------------------------------------------------

describe("assignCategory", () => {
  it("assigns infrastructure for energy-related content", () => {
    expect(_assignCategory("energy grid outage reported in the region")).toBe("infrastructure");
  });

  it("assigns community for open source content", () => {
    expect(_assignCategory("open source community contributor discussion")).toBe("community");
  });

  it("assigns climate for emissions content", () => {
    expect(_assignCategory("carbon emissions rising with fossil fuel consumption")).toBe("climate");
  });

  it("assigns security for cyber content", () => {
    expect(_assignCategory("ransomware attack exploiting zero-day vulnerability")).toBe("security");
  });

  it("falls back to general for unrecognized content", () => {
    expect(_assignCategory("the quick brown fox jumped over the lazy dog")).toBe("general");
  });
});
