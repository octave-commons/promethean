import { describe, it, expect } from "vitest";
import { reduce } from "../src/snapshot-reducer.js";
import { radarSnapshotSchema } from "../src/snapshot-reducer.js";
import type { Thread } from "../src/schema.js";

// ---------------------------------------------------------------------------
// Test helpers — create deterministic Thread fixtures
// ---------------------------------------------------------------------------

function makeThread(overrides: Partial<Thread> & { id: string }): Thread {
  return {
    id: overrides.id,
    kind: overrides.kind ?? "event",
    title: overrides.title ?? `Thread ${overrides.id}`,
    summary: overrides.summary,
    members: overrides.members ?? [
      {
        signal_event_id: `signal-${overrides.id}`,
        relevance: 1,
        added_at: "2025-01-01T00:00:00.000Z",
      },
    ],
    source_distribution: overrides.source_distribution ?? { bluesky: 0.6, reddit: 0.4 },
    confidence: overrides.confidence ?? 0.7,
    timeline: overrides.timeline ?? {
      first_seen: "2025-01-01T00:00:00.000Z",
      last_updated: "2025-01-02T00:00:00.000Z",
    },
    domain_tags: overrides.domain_tags ?? ["geopolitical"],
    status: overrides.status ?? "active",
  };
}

/**
 * Fisher-Yates shuffle — deterministic when given a seed-based random.
 * For test purposes, we use a simple PRNG seeded with a fixed value.
 */
function shuffle<T>(arr: ReadonlyArray<T>, seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    // Simple PRNG: linear congruential generator
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("reduce", () => {
  it("throws on empty input", () => {
    expect(() => reduce([])).toThrow("Cannot reduce empty threads array");
  });

  it("produces a valid RadarSnapshot from a single thread", () => {
    const thread = makeThread({
      id: "thread-001",
      kind: "event",
      confidence: 0.8,
      domain_tags: ["geopolitical", "security"],
      source_distribution: { bluesky: 1.0 },
    });

    const snapshot = reduce([thread]);

    // Validate against Zod schema
    const result = radarSnapshotSchema.safeParse(snapshot);
    expect(result.success).toBe(true);

    // Should have score ranges for each domain tag
    expect(snapshot.scoreRanges.length).toBeGreaterThanOrEqual(1);

    // Single thread → disagreement should be 0
    expect(snapshot.disagreementIndex).toBe(0);

    // Should have 2-4 narrative branches
    expect(snapshot.narrativeBranches.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.narrativeBranches.length).toBeLessThanOrEqual(4);

    // Compression loss should be a valid number between 0 and 1
    expect(snapshot.compressionLoss).toBeGreaterThanOrEqual(0);
    expect(snapshot.compressionLoss).toBeLessThanOrEqual(1);
  });

  it("produces a valid RadarSnapshot from multiple threads with different categories", () => {
    const threads: Thread[] = [
      makeThread({
        id: "t-geo",
        kind: "event",
        confidence: 0.9,
        domain_tags: ["geopolitical"],
        source_distribution: { bluesky: 0.5, reddit: 0.5 },
      }),
      makeThread({
        id: "t-tech",
        kind: "narrative",
        confidence: 0.6,
        domain_tags: ["technology"],
        source_distribution: { reddit: 1.0 },
      }),
      makeThread({
        id: "t-comm",
        kind: "local_opportunity",
        confidence: 0.5,
        domain_tags: ["community"],
        source_distribution: { bluesky: 0.7, reddit: 0.3 },
      }),
    ];

    const snapshot = reduce(threads);
    const result = radarSnapshotSchema.safeParse(snapshot);
    expect(result.success).toBe(true);

    // Should have score ranges for at least 3 dimensions
    expect(snapshot.scoreRanges.length).toBeGreaterThanOrEqual(3);

    // Should have 2-4 branches
    expect(snapshot.narrativeBranches.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.narrativeBranches.length).toBeLessThanOrEqual(4);

    // Disagreement should be > 0 since confidence values differ
    expect(snapshot.disagreementIndex).toBeGreaterThan(0);
  });

  it("DETERMINISM: shuffled inputs produce identical outputs", () => {
    const threads: Thread[] = [
      makeThread({
        id: "d-001",
        kind: "event",
        confidence: 0.9,
        domain_tags: ["geopolitical", "security"],
        source_distribution: { bluesky: 0.6, reddit: 0.4 },
        status: "active",
      }),
      makeThread({
        id: "d-002",
        kind: "narrative",
        confidence: 0.6,
        domain_tags: ["technology", "community"],
        source_distribution: { reddit: 1.0 },
        status: "emerging",
      }),
      makeThread({
        id: "d-003",
        kind: "local_opportunity",
        confidence: 0.4,
        domain_tags: ["community"],
        source_distribution: { bluesky: 0.3, reddit: 0.7 },
        status: "cooling",
      }),
      makeThread({
        id: "d-004",
        kind: "event",
        confidence: 0.75,
        domain_tags: ["infrastructure"],
        source_distribution: { bluesky: 1.0 },
        status: "active",
      }),
      makeThread({
        id: "d-005",
        kind: "narrative",
        confidence: 0.5,
        domain_tags: ["economic", "geopolitical"],
        source_distribution: { bluesky: 0.5, reddit: 0.5 },
        status: "emerging",
      }),
    ];

    // Run 3 times with different shuffled orders
    const baseline = reduce(threads);
    const shuffled1 = reduce(shuffle(threads, 42));
    const shuffled2 = reduce(shuffle(threads, 12345));
    const shuffled3 = reduce(shuffle(threads, 99999));

    // All outputs must be identical
    expect(shuffled1).toEqual(baseline);
    expect(shuffled2).toEqual(baseline);
    expect(shuffled3).toEqual(baseline);
  });

  it("DETERMINISM: reversed input produces identical output", () => {
    const threads: Thread[] = [
      makeThread({ id: "r-01", kind: "event", confidence: 0.8, domain_tags: ["geopolitical"] }),
      makeThread({ id: "r-02", kind: "narrative", confidence: 0.3, domain_tags: ["technology"] }),
      makeThread({ id: "r-03", kind: "local_opportunity", confidence: 0.6, domain_tags: ["community"] }),
    ];

    const forward = reduce(threads);
    const reversed = reduce([...threads].reverse());

    expect(reversed).toEqual(forward);
  });

  it("computes disagreement index correctly", () => {
    // All threads with identical confidence → disagreement = 0
    const sameConfidence: Thread[] = [
      makeThread({ id: "same-1", confidence: 0.5, domain_tags: ["tech"] }),
      makeThread({ id: "same-2", confidence: 0.5, domain_tags: ["tech"] }),
      makeThread({ id: "same-3", confidence: 0.5, domain_tags: ["tech"] }),
    ];
    const snapshotSame = reduce(sameConfidence);
    expect(snapshotSame.disagreementIndex).toBe(0);

    // Threads with high variance → disagreement > 0
    const mixedConfidence: Thread[] = [
      makeThread({ id: "mix-1", confidence: 0.1, domain_tags: ["tech"] }),
      makeThread({ id: "mix-2", confidence: 0.9, domain_tags: ["tech"] }),
    ];
    const snapshotMixed = reduce(mixedConfidence);
    expect(snapshotMixed.disagreementIndex).toBeGreaterThan(0);
    expect(snapshotMixed.disagreementIndex).toBeLessThanOrEqual(1);

    // Extreme disagreement: 0.0 vs 1.0 → should be high
    const extreme: Thread[] = [
      makeThread({ id: "ext-1", confidence: 0.0, domain_tags: ["tech"] }),
      makeThread({ id: "ext-2", confidence: 1.0, domain_tags: ["tech"] }),
    ];
    const snapshotExtreme = reduce(extreme);
    expect(snapshotExtreme.disagreementIndex).toBeGreaterThanOrEqual(0.9);
  });

  it("generates narrative branches with probabilities summing to ~1", () => {
    const threads: Thread[] = [
      makeThread({ id: "b-1", kind: "event", confidence: 0.8, domain_tags: ["geopolitical"] }),
      makeThread({ id: "b-2", kind: "narrative", confidence: 0.6, domain_tags: ["technology"] }),
      makeThread({ id: "b-3", kind: "local_opportunity", confidence: 0.4, domain_tags: ["community"] }),
      makeThread({ id: "b-4", kind: "event", confidence: 0.7, domain_tags: ["security"] }),
    ];

    const snapshot = reduce(threads);

    // Check branch count
    expect(snapshot.narrativeBranches.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.narrativeBranches.length).toBeLessThanOrEqual(4);

    // Probabilities should sum to approximately 1
    const probSum = snapshot.narrativeBranches.reduce(
      (sum, b) => sum + b.probability,
      0,
    );
    expect(probSum).toBeCloseTo(1.0, 2);

    // Each branch should have a non-empty label and evidence
    for (const branch of snapshot.narrativeBranches) {
      expect(branch.label.length).toBeGreaterThan(0);
      expect(branch.evidence.length).toBeGreaterThan(0);
    }
  });

  it("generates branches with at least 4 scoring dimensions", () => {
    const threads: Thread[] = [
      makeThread({ id: "sc-1", kind: "event", confidence: 0.8, domain_tags: ["geopolitical"] }),
      makeThread({ id: "sc-2", kind: "narrative", confidence: 0.5, domain_tags: ["technology"] }),
    ];

    const snapshot = reduce(threads);

    for (const branch of snapshot.narrativeBranches) {
      // Count how many of the 6 dimension scores are present and numeric
      const dimensions = [
        branch.realism,
        branch.fear,
        branch.public_benefit,
        branch.actionability,
        branch.polarization_risk,
        branch.compression_loss,
      ];
      const validDimensions = dimensions.filter(
        (d) => typeof d === "number" && isFinite(d),
      );
      expect(validDimensions.length).toBeGreaterThanOrEqual(4);

      // All scores should be in [0, 100]
      for (const score of dimensions) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("compression loss increases when diverse viewpoints are combined", () => {
    // Homogeneous: all threads same category and source
    const homogeneous: Thread[] = [
      makeThread({
        id: "h-1",
        kind: "event",
        confidence: 0.7,
        domain_tags: ["geopolitical"],
        source_distribution: { bluesky: 1.0 },
      }),
      makeThread({
        id: "h-2",
        kind: "event",
        confidence: 0.8,
        domain_tags: ["geopolitical"],
        source_distribution: { bluesky: 1.0 },
      }),
    ];

    // Diverse: threads with many different categories and sources
    const diverse: Thread[] = [
      makeThread({
        id: "dv-1",
        kind: "event",
        confidence: 0.9,
        domain_tags: ["geopolitical", "security"],
        source_distribution: { bluesky: 0.5, reddit: 0.5 },
      }),
      makeThread({
        id: "dv-2",
        kind: "narrative",
        confidence: 0.6,
        domain_tags: ["technology", "economic"],
        source_distribution: { reddit: 1.0 },
      }),
      makeThread({
        id: "dv-3",
        kind: "local_opportunity",
        confidence: 0.4,
        domain_tags: ["community", "climate"],
        source_distribution: { bluesky: 0.3, reddit: 0.7 },
      }),
      makeThread({
        id: "dv-4",
        kind: "event",
        confidence: 0.75,
        domain_tags: ["infrastructure"],
        source_distribution: { bluesky: 1.0 },
      }),
    ];

    const snapshotHomogeneous = reduce(homogeneous);
    const snapshotDiverse = reduce(diverse);

    // Diverse viewpoints should have higher compression loss
    expect(snapshotDiverse.compressionLoss).toBeGreaterThan(
      snapshotHomogeneous.compressionLoss,
    );
  });

  it("score ranges have valid min <= max bounds", () => {
    const threads: Thread[] = [
      makeThread({ id: "sr-1", confidence: 0.3, domain_tags: ["technology"] }),
      makeThread({ id: "sr-2", confidence: 0.9, domain_tags: ["technology"] }),
      makeThread({ id: "sr-3", confidence: 0.5, domain_tags: ["geopolitical"] }),
      makeThread({ id: "sr-4", confidence: 0.6, domain_tags: ["technology", "geopolitical"] }),
    ];

    const snapshot = reduce(threads);

    // Every score range must have min <= median <= max
    for (const range of snapshot.scoreRanges) {
      expect(range.min).toBeLessThanOrEqual(range.max);
      expect(range.min).toBeLessThanOrEqual(range.median);
      expect(range.median).toBeLessThanOrEqual(range.max);
      // All values between 0 and 1
      expect(range.min).toBeGreaterThanOrEqual(0);
      expect(range.max).toBeLessThanOrEqual(1);
    }
  });

  it("snapshot validates against Zod schema", () => {
    const threads: Thread[] = [
      makeThread({
        id: "zod-1",
        kind: "event",
        confidence: 0.8,
        domain_tags: ["geopolitical"],
        source_distribution: { bluesky: 0.6, reddit: 0.4 },
      }),
      makeThread({
        id: "zod-2",
        kind: "narrative",
        confidence: 0.5,
        domain_tags: ["technology"],
        source_distribution: { reddit: 1.0 },
      }),
      makeThread({
        id: "zod-3",
        kind: "local_opportunity",
        confidence: 0.6,
        domain_tags: ["community"],
        source_distribution: { bluesky: 1.0 },
      }),
    ];

    const snapshot = reduce(threads);
    const result = radarSnapshotSchema.safeParse(snapshot);
    expect(result.success).toBe(true);
  });

  it("handles threads with no domain tags (uses kind as dimension)", () => {
    const threads: Thread[] = [
      makeThread({ id: "nd-1", kind: "event", confidence: 0.7, domain_tags: [] }),
      makeThread({ id: "nd-2", kind: "narrative", confidence: 0.5, domain_tags: [] }),
    ];

    const snapshot = reduce(threads);

    // Should still produce valid score ranges using thread kind as dimension
    expect(snapshot.scoreRanges.length).toBeGreaterThanOrEqual(1);

    // Validate overall snapshot
    const result = radarSnapshotSchema.safeParse(snapshot);
    expect(result.success).toBe(true);
  });

  it("handles many threads (>4 categories) by merging into max 4 branches", () => {
    const threads: Thread[] = [
      makeThread({ id: "mc-1", domain_tags: ["geopolitical"], confidence: 0.9 }),
      makeThread({ id: "mc-2", domain_tags: ["technology"], confidence: 0.8 }),
      makeThread({ id: "mc-3", domain_tags: ["community"], confidence: 0.7 }),
      makeThread({ id: "mc-4", domain_tags: ["economic"], confidence: 0.6 }),
      makeThread({ id: "mc-5", domain_tags: ["infrastructure"], confidence: 0.5 }),
      makeThread({ id: "mc-6", domain_tags: ["climate"], confidence: 0.4 }),
      makeThread({ id: "mc-7", domain_tags: ["security"], confidence: 0.3 }),
    ];

    const snapshot = reduce(threads);

    // Should not exceed 4 branches
    expect(snapshot.narrativeBranches.length).toBeLessThanOrEqual(4);
    expect(snapshot.narrativeBranches.length).toBeGreaterThanOrEqual(2);

    // Probabilities should still sum to ~1
    const probSum = snapshot.narrativeBranches.reduce(
      (sum, b) => sum + b.probability,
      0,
    );
    expect(probSum).toBeCloseTo(1.0, 2);
  });
});
