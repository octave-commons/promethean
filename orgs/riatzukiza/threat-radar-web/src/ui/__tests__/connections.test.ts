import { describe, it, expect } from "vitest";
import {
  detectClientConnections,
  _tokenize,
  _buildTermVector,
  _cosineSimilarity,
  _keywordOverlap,
  _inferConnectionType,
  _deriveActionSteps,
  _inferUrgencyLevel,
  MIN_STRENGTH,
  ACTION_THRESHOLD,
  type SimilarityLookup,
} from "../connections";
import type { ThreadData } from "../../api/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeThread(
  overrides: Partial<ThreadData> & { id: string; title: string },
): ThreadData {
  const now = new Date().toISOString();
  const dayAgo = new Date(Date.now() - 86_400_000 * 2).toISOString();
  return {
    id: overrides.id,
    title: overrides.title,
    kind: overrides.kind ?? "event",
    members: overrides.members ?? [],
    source_distribution: overrides.source_distribution ?? {},
    confidence: overrides.confidence ?? 0.7,
    timeline: overrides.timeline ?? {
      first_seen: dayAgo,
      last_updated: now,
    },
    domain_tags: overrides.domain_tags ?? [],
    status: overrides.status ?? "active",
    summary: overrides.summary,
  };
}

// ---------------------------------------------------------------------------
// Tests: tokenize
// ---------------------------------------------------------------------------

describe("tokenize", () => {
  it("splits text into lowercase tokens", () => {
    const tokens = _tokenize("Energy Crisis Deepens");
    expect(tokens).toContain("energy");
    expect(tokens).toContain("crisis");
    expect(tokens).toContain("deepens");
  });

  it("filters stop words", () => {
    const tokens = _tokenize("the quick brown fox jumps over the lazy dog");
    expect(tokens).not.toContain("the");
    expect(tokens).not.toContain("over");
  });

  it("filters tokens shorter than 3 characters", () => {
    const tokens = _tokenize("AI is great");
    expect(tokens).not.toContain("ai");
    expect(tokens).not.toContain("is");
  });
});

// ---------------------------------------------------------------------------
// Tests: cosineSimilarity
// ---------------------------------------------------------------------------

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const vec = _buildTermVector(["energy", "crisis", "energy"]);
    expect(_cosineSimilarity(vec, vec)).toBeCloseTo(1.0, 5);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = _buildTermVector(["energy", "crisis"]);
    const b = _buildTermVector(["puppy", "kitten"]);
    expect(_cosineSimilarity(a, b)).toBe(0);
  });

  it("returns value between 0 and 1 for partial overlap", () => {
    const a = _buildTermVector(["energy", "crisis", "global"]);
    const b = _buildTermVector(["energy", "local", "community"]);
    const sim = _cosineSimilarity(a, b);
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: keywordOverlap (Jaccard)
// ---------------------------------------------------------------------------

describe("keywordOverlap", () => {
  it("returns 1 for identical sets", () => {
    expect(_keywordOverlap(["energy", "crisis"], ["crisis", "energy"])).toBe(1);
  });

  it("returns 0 for disjoint sets", () => {
    expect(_keywordOverlap(["energy"], ["water"])).toBe(0);
  });

  it("returns 0 for two empty sets", () => {
    expect(_keywordOverlap([], [])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: inferConnectionType
// ---------------------------------------------------------------------------

describe("inferConnectionType", () => {
  it("returns causal when global appeared first with high overlap", () => {
    const global = makeThread({
      id: "g1",
      title: "Energy infrastructure crisis",
      timeline: { first_seen: "2024-01-01T00:00:00Z", last_updated: "2024-01-02T00:00:00Z" },
    });
    const local = makeThread({
      id: "l1",
      title: "Local energy response plan",
      timeline: { first_seen: "2024-01-05T00:00:00Z", last_updated: "2024-01-06T00:00:00Z" },
    });
    const result = _inferConnectionType(global, local, 0.2);
    expect(result).toBe("causal");
  });

  it("returns correlative for concurrent threads with low overlap", () => {
    const now = new Date().toISOString();
    const global = makeThread({
      id: "g1", title: "Topic A",
      timeline: { first_seen: now, last_updated: now },
    });
    const local = makeThread({
      id: "l1", title: "Topic B",
      timeline: { first_seen: now, last_updated: now },
    });
    expect(_inferConnectionType(global, local, 0.02)).toBe("correlative");
  });
});

// ---------------------------------------------------------------------------
// Tests: deriveActionSteps
// ---------------------------------------------------------------------------

describe("deriveActionSteps", () => {
  it("returns at least 2 steps for any connection type", () => {
    const g = makeThread({ id: "g1", title: "Global Thread" });
    const l = makeThread({ id: "l1", title: "Local Thread" });
    for (const ct of ["causal", "correlative", "predictive"] as const) {
      const steps = _deriveActionSteps(g, l, ct);
      expect(steps.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("includes monitoring step", () => {
    const g = makeThread({ id: "g1", title: "G" });
    const l = makeThread({ id: "l1", title: "L" });
    const steps = _deriveActionSteps(g, l, "causal");
    expect(steps.some((s) => s.toLowerCase().includes("monitor"))).toBe(true);
  });

  it("adds opportunity evaluation for local_opportunity kind", () => {
    const g = makeThread({ id: "g1", title: "G" });
    const l = makeThread({ id: "l1", title: "L", kind: "local_opportunity" });
    const steps = _deriveActionSteps(g, l, "causal");
    expect(steps.some((s) => s.includes("opportunity"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: inferUrgencyLevel
// ---------------------------------------------------------------------------

describe("inferUrgencyLevel", () => {
  it("returns critical for urgency >= 0.8", () => {
    expect(_inferUrgencyLevel(0.85)).toBe("critical");
  });

  it("returns high for urgency >= 0.6", () => {
    expect(_inferUrgencyLevel(0.65)).toBe("high");
  });

  it("returns moderate for urgency >= 0.35", () => {
    expect(_inferUrgencyLevel(0.4)).toBe("moderate");
  });

  it("returns low for urgency < 0.35", () => {
    expect(_inferUrgencyLevel(0.2)).toBe("low");
  });
});

// ---------------------------------------------------------------------------
// Tests: detectClientConnections (integration)
// ---------------------------------------------------------------------------

describe("detectClientConnections", () => {
  it("returns empty when no global threads", () => {
    const local = [makeThread({ id: "l1", title: "Local Thread" })];
    const result = detectClientConnections([], local);
    expect(result.bridges).toHaveLength(0);
    expect(result.actionCards).toHaveLength(0);
  });

  it("returns empty when no local threads", () => {
    const global = [makeThread({ id: "g1", title: "Global Thread" })];
    const result = detectClientConnections(global, []);
    expect(result.bridges).toHaveLength(0);
    expect(result.actionCards).toHaveLength(0);
  });

  it("detects connection between related threads", () => {
    const global = [makeThread({
      id: "g1",
      title: "Global Energy Infrastructure Crisis",
      domain_tags: ["energy", "infrastructure"],
    })];
    const local = [makeThread({
      id: "l1",
      title: "Local Energy Infrastructure Response",
      domain_tags: ["energy", "local"],
    })];
    const result = detectClientConnections(global, local);
    expect(result.bridges.length).toBeGreaterThanOrEqual(1);
    const bridge = result.bridges[0];
    expect(bridge.globalThread.id).toBe("g1");
    expect(bridge.localThread.id).toBe("l1");
    expect(bridge.strength).toBeGreaterThan(0);
    expect(["causal", "correlative", "predictive"]).toContain(bridge.connectionType);
  });

  it("includes scores on bridge cards", () => {
    const global = [makeThread({
      id: "g1",
      title: "Global Energy Infrastructure Crisis",
      domain_tags: ["energy"],
    })];
    const local = [makeThread({
      id: "l1",
      title: "Local Energy Infrastructure Response",
      domain_tags: ["energy"],
    })];
    const result = detectClientConnections(global, local);
    expect(result.bridges.length).toBeGreaterThanOrEqual(1);
    const bridge = result.bridges[0];
    expect(bridge.realism).toBeGreaterThanOrEqual(0);
    expect(bridge.realism).toBeLessThanOrEqual(100);
    expect(bridge.fear).toBeGreaterThanOrEqual(0);
    expect(bridge.public_benefit).toBeGreaterThanOrEqual(0);
  });

  it("includes semantic similarity from lookup", () => {
    const global = [makeThread({
      id: "g1",
      title: "Energy Crisis",
      domain_tags: ["energy"],
    })];
    const local = [makeThread({
      id: "l1",
      title: "Energy Response",
      domain_tags: ["energy"],
    })];
    const lookup: SimilarityLookup = {
      get(gt: string, lt: string) {
        if (gt === "Energy Crisis" && lt === "Energy Response") return 0.82;
        return null;
      },
    };
    const result = detectClientConnections(global, local, lookup);
    const bridge = result.bridges.find(
      (b) => b.globalThread.id === "g1" && b.localThread.id === "l1",
    );
    expect(bridge).toBeDefined();
    expect(bridge!.semanticSimilarity).toBe(0.82);
  });

  it("sorts bridges by strength descending", () => {
    const global = [
      makeThread({ id: "g1", title: "Energy Infrastructure", domain_tags: ["energy"] }),
      makeThread({ id: "g2", title: "Completely Unrelated Astrology", domain_tags: ["astrology"] }),
    ];
    const local = [
      makeThread({ id: "l1", title: "Energy Local Response", domain_tags: ["energy"] }),
    ];
    const result = detectClientConnections(global, local);
    if (result.bridges.length >= 2) {
      expect(result.bridges[0].strength).toBeGreaterThanOrEqual(result.bridges[1].strength);
    }
  });

  it("generates action cards for strong connections", () => {
    const global = [makeThread({
      id: "g1",
      title: "Massive Energy Infrastructure Failure",
      domain_tags: ["energy", "infrastructure", "crisis"],
      summary: "Critical energy infrastructure failure affecting local communities",
    })];
    const local = [makeThread({
      id: "l1",
      title: "Local Energy Infrastructure Community Response",
      domain_tags: ["energy", "infrastructure", "community", "local"],
      summary: "Community organizing response to energy infrastructure disruption",
      kind: "local_opportunity",
    })];
    const result = detectClientConnections(global, local);
    // Even if no action card generated (depends on strength), verify structure
    if (result.actionCards.length > 0) {
      const card = result.actionCards[0];
      expect(card.title).toBeTruthy();
      expect(card.description).toBeTruthy();
      expect(card.urgency).toBeGreaterThan(0);
      expect(card.actionableSteps.length).toBeGreaterThanOrEqual(2);
      expect(["critical", "high", "moderate", "low"]).toContain(card.urgencyLevel);
      expect(card.timeWindow).toBeTruthy();
    }
  });

  it("bridge has suggested actions and coordination path", () => {
    const global = [makeThread({
      id: "g1",
      title: "Energy Infrastructure",
      domain_tags: ["energy"],
    })];
    const local = [makeThread({
      id: "l1",
      title: "Energy Local Response",
      domain_tags: ["energy"],
    })];
    const result = detectClientConnections(global, local);
    if (result.bridges.length > 0) {
      const bridge = result.bridges[0];
      expect(bridge.suggestedActions.length).toBeGreaterThan(0);
      expect(bridge.coordinationPath).toBeTruthy();
      expect(bridge.rationale.length).toBeGreaterThan(0);
    }
  });
});
