import { describe, it, expect } from "vitest";
import { normalize, type RawCollectorOutput } from "../src/normalize.js";
import { cluster } from "../src/cluster.js";
import { reduce } from "../src/snapshot-reducer.js";
import { radarSnapshotSchema } from "../src/snapshot-reducer.js";
import { signalEventSchema } from "../src/schema.js";

// ---------------------------------------------------------------------------
// Integration test: full collector → normalize → cluster → reduce pipeline
// ---------------------------------------------------------------------------

const NOW = new Date().toISOString();

/**
 * Simulates raw collector output as it would come from Bluesky/Reddit collectors.
 * These mimic the shape of data returned by radar_collect_bluesky and
 * radar_collect_reddit MCP tools.
 */
function makeBlueskyRaw(overrides: Partial<RawCollectorOutput> = {}): RawCollectorOutput {
  return {
    provenance: {
      source_type: "bluesky",
      author: "analyst.bsky.social",
      post_uri: "at://did:plc:abc/app.bsky.feed.post/123",
      confidence_class: "firsthand",
      retrieved_at: NOW,
    },
    text: "Military tensions rising near the strait. Sanctions tightening on energy exports. Diplomatic channels stalling.",
    title: "Geopolitical tension escalation",
    links: ["https://example.com/article-1"],
    domain_tags: ["geopolitical"],
    observed_at: NOW,
    ingested_at: NOW,
    metadata: { like_count: 100 },
    ...overrides,
  };
}

function makeRedditRaw(overrides: Partial<RawCollectorOutput> = {}): RawCollectorOutput {
  return {
    provenance: {
      source_type: "reddit",
      author: "u/techwatch",
      post_uri: "https://reddit.com/r/machinelearning/comments/xyz",
      confidence_class: "commentary",
      retrieved_at: NOW,
    },
    text: "New open source AI model released with impressive benchmarks. Community contributors are testing inference performance on consumer GPU hardware.",
    title: "Open source AI model release",
    links: ["https://github.com/example/model"],
    domain_tags: ["technology"],
    observed_at: NOW,
    ingested_at: NOW,
    metadata: { score: 500, subreddit: "machinelearning" },
    ...overrides,
  };
}

describe("integration: collector → normalize → cluster → reduce", () => {
  it("processes a mixed batch of Bluesky and Reddit signals through the full pipeline", () => {
    // Step 1: Simulate raw collector output (as from MCP tools)
    const rawSignals: RawCollectorOutput[] = [
      // Geopolitical cluster (Bluesky)
      makeBlueskyRaw({
        text: "Military conflict escalation with sanctions imposed on energy exports. Naval forces deployed near the strait.",
        title: "Military deployment near strait",
      }),
      makeBlueskyRaw({
        text: "Diplomatic negotiations stalled as sanctions tighten. Military posturing continues near critical waterway.",
        title: "Diplomacy stalled",
      }),
      makeBlueskyRaw({
        text: "Energy pipeline disrupted by geopolitical sanctions. Infrastructure concerns mount in the region.",
        title: "Pipeline disruption",
        domain_tags: ["geopolitical", "infrastructure"],
      }),
      // Technology/AI cluster (Reddit)
      makeRedditRaw({
        text: "New GPU chip announced for AI model training. Inference performance doubled on the latest semiconductor architecture.",
        title: "GPU chip for AI training",
      }),
      makeRedditRaw({
        text: "Open source community contributors release a new machine learning model with improved neural network training capabilities.",
        title: "ML model release",
        domain_tags: ["technology", "community"],
      }),
    ];

    // Step 2: Normalize all raw signals
    const normalized = rawSignals.map((raw) => normalize(raw));

    // Verify normalization produces valid SignalEvents
    expect(normalized).toHaveLength(5);
    for (const event of normalized) {
      const parsed = signalEventSchema.safeParse(event);
      expect(parsed.success).toBe(true);
      expect(event.id).toBeTruthy();
      expect(event.normalized_content).toBeTruthy();
      expect(event.category).toBeTruthy();
      expect(typeof event.quality_score).toBe("number");
    }

    // Verify categories were assigned based on content
    const categories = normalized.map((e) => e.category);
    expect(categories.filter((c) => c === "geopolitical").length).toBeGreaterThanOrEqual(2);
    expect(categories.filter((c) => c === "technology").length).toBeGreaterThanOrEqual(1);

    // Step 3: Cluster normalized signals into threads
    const threads = cluster(normalized);

    // Should produce at least 2 clusters (geopolitical and technology topics)
    expect(threads.length).toBeGreaterThanOrEqual(2);

    // Each thread should have valid structure
    for (const thread of threads) {
      expect(thread.id).toBeTruthy();
      expect(thread.title).toBeTruthy();
      expect(thread.members.length).toBeGreaterThan(0);
      expect(thread.confidence).toBeGreaterThanOrEqual(0);
      expect(thread.confidence).toBeLessThanOrEqual(1);
      expect(["event", "narrative", "local_opportunity"]).toContain(thread.kind);
      expect(["emerging", "active", "cooling", "archived"]).toContain(thread.status);
      expect(Object.keys(thread.source_distribution).length).toBeGreaterThan(0);
    }

    // Verify threads cover all input signals
    const allMemberIds = threads.flatMap((t) => t.members.map((m) => m.signal_event_id));
    for (const event of normalized) {
      expect(allMemberIds).toContain(event.id);
    }

    // Step 4: Reduce threads into a RadarSnapshot
    const snapshot = reduce(threads);

    // Validate against Zod schema
    const schemaResult = radarSnapshotSchema.safeParse(snapshot);
    expect(schemaResult.success).toBe(true);

    // Verify score ranges exist
    expect(snapshot.scoreRanges.length).toBeGreaterThan(0);
    for (const range of snapshot.scoreRanges) {
      expect(range.min).toBeLessThanOrEqual(range.max);
      expect(range.min).toBeGreaterThanOrEqual(0);
      expect(range.max).toBeLessThanOrEqual(1);
    }

    // Verify disagreement index
    expect(snapshot.disagreementIndex).toBeGreaterThanOrEqual(0);
    expect(snapshot.disagreementIndex).toBeLessThanOrEqual(1);

    // Verify narrative branches (2-4)
    expect(snapshot.narrativeBranches.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.narrativeBranches.length).toBeLessThanOrEqual(4);

    // Verify probability sum ≈ 1
    const probSum = snapshot.narrativeBranches.reduce((s, b) => s + b.probability, 0);
    expect(probSum).toBeCloseTo(1.0, 2);

    // Verify branch scoring dimensions use snake_case
    for (const branch of snapshot.narrativeBranches) {
      expect(branch.label.length).toBeGreaterThan(0);
      expect(branch.evidence.length).toBeGreaterThan(0);
      expect(typeof branch.realism).toBe("number");
      expect(typeof branch.fear).toBe("number");
      expect(typeof branch.public_benefit).toBe("number");
      expect(typeof branch.actionability).toBe("number");
      expect(typeof branch.polarization_risk).toBe("number");
      expect(typeof branch.compression_loss).toBe("number");
    }

    // Verify compression loss
    expect(snapshot.compressionLoss).toBeGreaterThanOrEqual(0);
    expect(snapshot.compressionLoss).toBeLessThanOrEqual(1);
  });

  it("deterministically reduces identical collector output regardless of signal order", () => {
    const rawSignals: RawCollectorOutput[] = [
      makeBlueskyRaw({
        id: "sig-geo-1",
        text: "Sanctions imposed on energy exports amid military conflict escalation",
        title: "Sanctions imposed",
      }),
      makeRedditRaw({
        id: "sig-tech-1",
        text: "Open source AI model with breakthrough neural network inference performance",
        title: "AI breakthrough",
      }),
      makeBlueskyRaw({
        id: "sig-geo-2",
        text: "Naval forces deployed near critical waterway as diplomatic channels close",
        title: "Naval deployment",
      }),
      makeRedditRaw({
        id: "sig-tech-2",
        text: "GPU chip semiconductor architecture enables faster machine learning model training",
        title: "GPU architecture",
      }),
    ];

    // Normalize in original order
    const normalizedA = rawSignals.map((raw) => normalize(raw));
    const threadsA = cluster(normalizedA);
    const snapshotA = reduce(threadsA);

    // Normalize in reversed order
    const normalizedB = [...rawSignals].reverse().map((raw) => normalize(raw));
    const threadsB = cluster(normalizedB);
    const snapshotB = reduce(threadsB);

    // Snapshots should be schema-valid
    expect(radarSnapshotSchema.safeParse(snapshotA).success).toBe(true);
    expect(radarSnapshotSchema.safeParse(snapshotB).success).toBe(true);

    // The reduce step is deterministic (it sorts by thread ID), so given the
    // same threads, output is identical. Clustering may produce different IDs,
    // but the structural properties should be consistent.
    expect(snapshotA.scoreRanges.length).toBe(snapshotB.scoreRanges.length);
    expect(snapshotA.narrativeBranches.length).toBe(snapshotB.narrativeBranches.length);
    expect(snapshotA.disagreementIndex).toBeCloseTo(snapshotB.disagreementIndex, 1);
  });

  it("handles signals from a single source type through the pipeline", () => {
    const rawSignals: RawCollectorOutput[] = [
      makeRedditRaw({
        text: "Community contributors are building open source developer tools for local AI inference",
        title: "OSS dev tools",
        domain_tags: ["community", "technology"],
      }),
      makeRedditRaw({
        text: "Local developer community organizing hackathon focused on open source AI collaboration",
        title: "AI hackathon",
        domain_tags: ["community"],
      }),
      makeRedditRaw({
        text: "Open source machine learning framework gains community contributor support for GPU inference",
        title: "ML framework growth",
        domain_tags: ["technology"],
      }),
    ];

    const normalized = rawSignals.map((raw) => normalize(raw));
    expect(normalized).toHaveLength(3);

    const threads = cluster(normalized);
    expect(threads.length).toBeGreaterThanOrEqual(1);

    // All source distribution should be 100% reddit
    for (const thread of threads) {
      expect(thread.source_distribution["reddit"]).toBeDefined();
    }

    const snapshot = reduce(threads);
    expect(radarSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(snapshot.narrativeBranches.length).toBeGreaterThanOrEqual(2);
  });

  it("rejects signals with empty text at the normalize step", () => {
    const raw = makeBlueskyRaw({ text: "" });
    expect(() => normalize(raw)).toThrow("Cannot normalize signal with empty text input");
  });
});
