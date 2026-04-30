import { describe, it, expect } from "vitest";
import { cluster } from "../src/cluster.js";
import type { SignalEvent } from "../src/schema.js";
import { threadSchema } from "../src/schema.js";

const NOW = new Date().toISOString();

// ---------------------------------------------------------------------------
// Helper to build minimal SignalEvent fixtures
// ---------------------------------------------------------------------------

function makeSignal(overrides: Partial<SignalEvent> & { id: string; text: string }): SignalEvent {
  return {
    provenance: {
      source_type: "bluesky",
      author: "test.bsky.social",
      retrieved_at: NOW,
      confidence_class: "unknown",
    },
    links: [],
    domain_tags: [],
    observed_at: NOW,
    ingested_at: NOW,
    metadata: {},
    normalized_content: overrides.text.toLowerCase(),
    category: "general",
    quality_score: 0.5,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// cluster() — core tests
// ---------------------------------------------------------------------------

describe("cluster", () => {
  it("returns an empty array when given no signals", () => {
    const result = cluster([]);
    expect(result).toEqual([]);
  });

  it("creates a single thread for a single signal", () => {
    const signal = makeSignal({
      id: "sig-1",
      text: "Major GPU shortage reported at semiconductor factories",
      normalized_content: "major gpu shortage reported at semiconductor factories",
      category: "technology",
    });

    const result = cluster([signal]);
    expect(result).toHaveLength(1);

    const thread = result[0];
    expect(thread.id).toBeTruthy();
    expect(thread.title).toBeTruthy();
    expect(thread.members).toHaveLength(1);
    expect(thread.members[0].signal_event_id).toBe("sig-1");
    expect(thread.timeline.first_seen).toBeTruthy();
    expect(thread.timeline.last_updated).toBeTruthy();

    // Validate against Zod schema
    const parsed = threadSchema.safeParse(thread);
    expect(parsed.success).toBe(true);
  });

  it("groups similar signals into the same thread", () => {
    const signals: SignalEvent[] = [
      makeSignal({
        id: "sig-a1",
        text: "GPU chip shortage causing delays in AI model training infrastructure",
        normalized_content: "gpu chip shortage causing delays in ai model training infrastructure",
        category: "technology",
      }),
      makeSignal({
        id: "sig-a2",
        text: "Semiconductor chip shortage impacts GPU production and AI training schedules",
        normalized_content: "semiconductor chip shortage impacts gpu production and ai training schedules",
        category: "technology",
      }),
      makeSignal({
        id: "sig-a3",
        text: "Global chip shortage delays GPU shipments to data centers for AI model training",
        normalized_content: "global chip shortage delays gpu shipments to data centers for ai model training",
        category: "technology",
      }),
    ];

    const result = cluster(signals);

    // All 3 signals share GPU/chip/shortage/AI/training terms — should cluster together
    expect(result.length).toBeGreaterThanOrEqual(1);

    // Find the thread containing our signals
    const allMemberIds = result.flatMap((t) => t.members.map((m) => m.signal_event_id));
    expect(allMemberIds).toContain("sig-a1");
    expect(allMemberIds).toContain("sig-a2");
    expect(allMemberIds).toContain("sig-a3");

    // The similar signals should be in the same thread
    const threadWithA1 = result.find((t) =>
      t.members.some((m) => m.signal_event_id === "sig-a1")
    );
    expect(threadWithA1).toBeDefined();
    const memberIds = threadWithA1!.members.map((m) => m.signal_event_id);
    expect(memberIds).toContain("sig-a2");
    expect(memberIds).toContain("sig-a3");
  });

  it("separates signals with different topics into different threads", () => {
    const signals: SignalEvent[] = [
      // Topic A: chip/GPU shortage
      makeSignal({
        id: "tech-1",
        text: "GPU chip shortage impacts semiconductor manufacturing globally",
        normalized_content: "gpu chip shortage impacts semiconductor manufacturing globally",
        category: "technology",
      }),
      makeSignal({
        id: "tech-2",
        text: "Chip shortage continues to delay GPU production for AI training",
        normalized_content: "chip shortage continues to delay gpu production for ai training",
        category: "technology",
      }),
      makeSignal({
        id: "tech-3",
        text: "GPU chip semiconductor shortage hits data center manufacturing",
        normalized_content: "gpu chip semiconductor shortage hits data center manufacturing",
        category: "technology",
      }),
      // Topic B: military conflict / geopolitical
      makeSignal({
        id: "geo-1",
        text: "Military conflict escalation with missile deployment and sanctions imposed",
        normalized_content: "military conflict escalation with missile deployment and sanctions imposed",
        category: "geopolitical",
      }),
      makeSignal({
        id: "geo-2",
        text: "Sanctions and military conflict continue with new missile strikes reported",
        normalized_content: "sanctions and military conflict continue with new missile strikes reported",
        category: "geopolitical",
      }),
    ];

    const result = cluster(signals);

    // Should produce at least 2 distinct threads
    expect(result.length).toBeGreaterThanOrEqual(2);

    // Tech signals should be together, geo signals should be together
    const techThread = result.find((t) =>
      t.members.some((m) => m.signal_event_id === "tech-1")
    );
    const geoThread = result.find((t) =>
      t.members.some((m) => m.signal_event_id === "geo-1")
    );

    expect(techThread).toBeDefined();
    expect(geoThread).toBeDefined();

    // They should be different threads
    expect(techThread!.id).not.toBe(geoThread!.id);

    // Verify membership
    const techMemberIds = techThread!.members.map((m) => m.signal_event_id);
    expect(techMemberIds).toContain("tech-2");
    expect(techMemberIds).toContain("tech-3");
    expect(techMemberIds).not.toContain("geo-1");

    const geoMemberIds = geoThread!.members.map((m) => m.signal_event_id);
    expect(geoMemberIds).toContain("geo-2");
    expect(geoMemberIds).not.toContain("tech-1");
  });

  it("clusters cross-source signals (Bluesky + Reddit) on the same topic together", () => {
    const signals: SignalEvent[] = [
      makeSignal({
        id: "bsky-1",
        text: "Open source AI community releases new large language model weights",
        normalized_content: "open source ai community releases new large language model weights",
        category: "technology",
        provenance: {
          source_type: "bluesky",
          author: "alice.bsky.social",
          retrieved_at: NOW,
          confidence_class: "firsthand",
        },
      }),
      makeSignal({
        id: "reddit-1",
        text: "New open source large language model released by AI community with full weights",
        normalized_content: "new open source large language model released by ai community with full weights",
        category: "technology",
        provenance: {
          source_type: "reddit",
          author: "u/testuser",
          post_uri: "https://reddit.com/r/LocalLLaMA/abc",
          retrieved_at: NOW,
          confidence_class: "firsthand",
        },
      }),
    ];

    const result = cluster(signals);

    // Cross-source signals about the same topic should cluster together
    expect(result.length).toBeGreaterThanOrEqual(1);

    const thread = result.find((t) =>
      t.members.some((m) => m.signal_event_id === "bsky-1")
    );
    expect(thread).toBeDefined();
    const memberIds = thread!.members.map((m) => m.signal_event_id);
    expect(memberIds).toContain("reddit-1");
  });

  it("generates thread titles from top terms of member signals", () => {
    const signals: SignalEvent[] = [
      makeSignal({
        id: "t-1",
        text: "Renewable energy solar panel installation surge across Europe",
        normalized_content: "renewable energy solar panel installation surge across europe",
        category: "climate",
      }),
      makeSignal({
        id: "t-2",
        text: "Solar energy installation growth with renewable panel deployment in Europe",
        normalized_content: "solar energy installation growth with renewable panel deployment in europe",
        category: "climate",
      }),
    ];

    const result = cluster(signals);
    expect(result.length).toBeGreaterThanOrEqual(1);

    const thread = result.find((t) =>
      t.members.some((m) => m.signal_event_id === "t-1")
    );
    expect(thread).toBeDefined();

    // Title should be derived from top terms - it should contain meaningful words
    expect(thread!.title.length).toBeGreaterThan(0);
    // Title should include some relevant terms
    const titleLower = thread!.title.toLowerCase();
    const hasRelevantTerm = ["solar", "energy", "renewable", "installation", "panel", "europe"]
      .some((term) => titleLower.includes(term));
    expect(hasRelevantTerm).toBe(true);
  });

  it("produces valid Thread objects conforming to the Zod schema", () => {
    const signals: SignalEvent[] = [
      makeSignal({
        id: "v-1",
        text: "Cybersecurity breach at major financial institution exposes customer data",
        normalized_content: "cybersecurity breach at major financial institution exposes customer data",
        category: "security",
      }),
      makeSignal({
        id: "v-2",
        text: "Financial institution reports cybersecurity data breach affecting millions",
        normalized_content: "financial institution reports cybersecurity data breach affecting millions",
        category: "security",
      }),
    ];

    const result = cluster(signals);
    expect(result.length).toBeGreaterThanOrEqual(1);

    // Validate every Thread against Zod schema
    for (const thread of result) {
      const parsed = threadSchema.safeParse(thread);
      if (!parsed.success) {
        console.error("Thread validation failed:", parsed.error.format());
      }
      expect(parsed.success).toBe(true);

      // Check required fields
      expect(thread.id).toBeTruthy();
      expect(thread.title).toBeTruthy();
      expect(thread.kind).toBeTruthy();
      expect(thread.members.length).toBeGreaterThan(0);
      expect(thread.timeline.first_seen).toBeTruthy();
      expect(thread.timeline.last_updated).toBeTruthy();
      expect(thread.status).toBeTruthy();

      // Verify members have required fields
      for (const member of thread.members) {
        expect(member.signal_event_id).toBeTruthy();
        expect(typeof member.relevance).toBe("number");
        expect(member.relevance).toBeGreaterThanOrEqual(0);
        expect(member.relevance).toBeLessThanOrEqual(1);
        expect(member.added_at).toBeTruthy();
      }
    }
  });

  it("assigns domain_tags based on member signal categories", () => {
    const signals: SignalEvent[] = [
      makeSignal({
        id: "d-1",
        text: "Climate emissions rise as carbon output from fossil fuel increases globally",
        normalized_content: "climate emissions rise as carbon output from fossil fuel increases globally",
        category: "climate",
        domain_tags: ["climate"],
      }),
      makeSignal({
        id: "d-2",
        text: "Fossil fuel carbon emissions accelerate climate change impacts worldwide",
        normalized_content: "fossil fuel carbon emissions accelerate climate change impacts worldwide",
        category: "climate",
        domain_tags: ["climate"],
      }),
    ];

    const result = cluster(signals);
    expect(result.length).toBeGreaterThanOrEqual(1);

    const thread = result.find((t) =>
      t.members.some((m) => m.signal_event_id === "d-1")
    );
    expect(thread).toBeDefined();
    expect(thread!.domain_tags.length).toBeGreaterThan(0);
  });
});
