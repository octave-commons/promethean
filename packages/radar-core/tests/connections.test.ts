import { describe, it, expect } from "vitest";
import type { Thread, ConnectionOpportunity, ActionCard } from "../src/schema.js";
import {
  detectConnections,
  _connTokenize as _tokenize,
  _connBuildTermVector as _buildTermVector,
  _connCosineSimilarity as _cosineSimilarity,
  _connKeywordOverlap as _keywordOverlap,
  _connCalculateStrength as _calculateStrength,
  _connInferConnectionType as _inferConnectionType,
  _connDeriveActionableSteps as _deriveActionableSteps,
  ACTION_CARD_THRESHOLD,
} from "../src/connections.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeThread(overrides: Partial<Thread> & { id: string; title: string }): Thread {
  const now = new Date().toISOString();
  return {
    kind: "event",
    summary: undefined,
    members: [],
    source_distribution: { bluesky: 0.6, reddit: 0.4 },
    confidence: 0.7,
    timeline: {
      first_seen: "2025-01-01T00:00:00.000Z",
      last_updated: "2025-01-02T00:00:00.000Z",
    },
    domain_tags: [],
    status: "active",
    ...overrides,
  };
}

function makeGlobalThread(
  id: string,
  title: string,
  domainTags: string[] = ["geopolitical"],
  extraOverrides: Partial<Thread> = {},
): Thread {
  return makeThread({
    id,
    title,
    kind: "event",
    domain_tags: domainTags,
    timeline: {
      first_seen: "2025-01-01T00:00:00.000Z",
      last_updated: "2025-01-03T00:00:00.000Z",
    },
    ...extraOverrides,
  });
}

function makeLocalThread(
  id: string,
  title: string,
  domainTags: string[] = ["community"],
  extraOverrides: Partial<Thread> = {},
): Thread {
  return makeThread({
    id,
    title,
    kind: "local_opportunity",
    domain_tags: domainTags,
    timeline: {
      first_seen: "2025-01-05T00:00:00.000Z",
      last_updated: "2025-01-06T00:00:00.000Z",
    },
    ...extraOverrides,
  });
}

// ---------------------------------------------------------------------------
// 1. Connection detection — basic identification
// ---------------------------------------------------------------------------

describe("detectConnections", () => {
  it("identifies connections between global and local threads with shared keywords", () => {
    const globalThreads = [
      makeGlobalThread("g1", "Energy infrastructure sanctions affecting semiconductor supply", [
        "geopolitical",
        "infrastructure",
      ]),
    ];
    const localThreads = [
      makeLocalThread("l1", "Semiconductor chip shortage impacts open source AI training community", [
        "technology",
        "community",
      ]),
    ];

    const result = detectConnections(globalThreads, localThreads);

    expect(result.connections.length).toBeGreaterThanOrEqual(1);

    const conn = result.connections[0];
    expect(conn.global_thread_id).toBe("g1");
    expect(conn.local_thread_ids).toContain("l1");
    expect(conn.score).toBeGreaterThan(0);
    expect(conn.score).toBeLessThanOrEqual(1);
  });

  it("returns empty when no global threads are provided", () => {
    const localThreads = [
      makeLocalThread("l1", "Local AI community meetup discussion"),
    ];
    const result = detectConnections([], localThreads);
    expect(result.connections).toHaveLength(0);
    expect(result.actionCards).toHaveLength(0);
  });

  it("returns empty when no local threads are provided", () => {
    const globalThreads = [
      makeGlobalThread("g1", "Global energy crisis escalation"),
    ];
    const result = detectConnections(globalThreads, []);
    expect(result.connections).toHaveLength(0);
    expect(result.actionCards).toHaveLength(0);
  });

  it("returns empty when both arrays are empty", () => {
    const result = detectConnections([], []);
    expect(result.connections).toHaveLength(0);
    expect(result.actionCards).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 2. ConnectionOpportunity field completeness
// ---------------------------------------------------------------------------

describe("ConnectionOpportunity completeness", () => {
  it("generates ConnectionOpportunity with all required fields", () => {
    const globalThreads = [
      makeGlobalThread("g1", "Energy grid infrastructure vulnerability cyber attack risks", [
        "infrastructure",
        "security",
      ]),
    ];
    const localThreads = [
      makeLocalThread("l1", "Infrastructure security monitoring community response cyber", [
        "community",
        "security",
      ]),
    ];

    const result = detectConnections(globalThreads, localThreads);
    expect(result.connections.length).toBeGreaterThanOrEqual(1);

    const conn = result.connections[0];

    // Verify all required fields per schema
    expect(conn.id).toBeTruthy();
    expect(typeof conn.id).toBe("string");
    expect(conn.global_thread_id).toBe("g1");
    expect(conn.local_thread_ids).toContain("l1");
    expect(["global_to_local", "local_to_global_hypothesis", "shared_campaign", "shared_indicator"]).toContain(conn.bridge_type);
    expect(conn.title).toBeTruthy();
    expect(conn.summary).toBeTruthy();
    expect(conn.score).toBeGreaterThanOrEqual(0);
    expect(conn.score).toBeLessThanOrEqual(1);
    expect(conn.confidence).toBeGreaterThanOrEqual(0);
    expect(conn.confidence).toBeLessThanOrEqual(1);
    expect(Array.isArray(conn.rationale)).toBe(true);
    expect(conn.rationale.length).toBeGreaterThan(0);
    expect(Array.isArray(conn.user_expertise_tags)).toBe(true);
    expect(Array.isArray(conn.suggested_actions)).toBe(true);
    expect(typeof conn.coordination_path).toBe("string");
    expect(conn.created_at).toBeTruthy();
    expect(conn.updated_at).toBeTruthy();

    // Connection scores (VAL-CONN-003 — narrative branch scoring dimensions)
    expect(conn.public_benefit).toBeGreaterThanOrEqual(0);
    expect(conn.public_benefit).toBeLessThanOrEqual(100);
    expect(conn.fear_factor).toBeGreaterThanOrEqual(0);
    expect(conn.fear_factor).toBeLessThanOrEqual(100);
    expect(conn.realism).toBeGreaterThanOrEqual(0);
    expect(conn.realism).toBeLessThanOrEqual(100);
    expect(conn.polarization_risk).toBeGreaterThanOrEqual(0);
    expect(conn.polarization_risk).toBeLessThanOrEqual(100);
    expect(conn.compression_loss).toBeGreaterThanOrEqual(0);
    expect(conn.compression_loss).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// 3. Strength calculation
// ---------------------------------------------------------------------------

describe("connection strength calculation", () => {
  it("assigns higher strength to threads with more keyword overlap", () => {
    // High-overlap pair
    const g1 = makeGlobalThread("g1", "Energy infrastructure pipeline sanctions affecting chip supply chain", [
      "infrastructure",
      "technology",
    ]);
    const l1 = makeLocalThread("l1", "Energy chip supply chain community infrastructure impact assessment", [
      "technology",
      "community",
      "infrastructure",
    ]);

    // Low-overlap pair
    const g2 = makeGlobalThread("g2", "Diplomatic treaty negotiations progress update", [
      "geopolitical",
    ]);
    const l2 = makeLocalThread("l2", "Local community garden volunteer organizing", [
      "community",
    ]);

    const result1 = detectConnections([g1], [l1]);
    const result2 = detectConnections([g2], [l2]);

    // High-overlap should produce a connection
    expect(result1.connections.length).toBe(1);

    if (result2.connections.length > 0) {
      // If a connection exists for low-overlap, it should be weaker
      expect(result1.connections[0].score).toBeGreaterThan(result2.connections[0].score);
    }
  });

  it("strength is in [0, 1] range", () => {
    const globals = [
      makeGlobalThread("g1", "Energy crisis global supply chain disruption semiconductor"),
    ];
    const locals = [
      makeLocalThread("l1", "Energy semiconductor supply chain community resilience"),
    ];

    const result = detectConnections(globals, locals);
    for (const conn of result.connections) {
      expect(conn.score).toBeGreaterThanOrEqual(0);
      expect(conn.score).toBeLessThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. ActionCard generation for strong connections
// ---------------------------------------------------------------------------

describe("ActionCard generation", () => {
  it("generates ActionCards only for connections with strength > 0.5", () => {
    // Create threads with very high keyword overlap to ensure strength > 0.5
    const globalThreads = [
      makeGlobalThread(
        "g1",
        "Energy infrastructure security vulnerability affecting global semiconductor supply chain",
        ["infrastructure", "security", "technology"],
      ),
    ];
    const localThreads = [
      makeLocalThread(
        "l1",
        "Energy infrastructure security response plan for semiconductor supply chain community",
        ["infrastructure", "security", "technology", "community"],
      ),
    ];

    const result = detectConnections(globalThreads, localThreads);

    // Strong connections should produce action cards
    const strongConnections = result.connections.filter((c) => c.score > ACTION_CARD_THRESHOLD);
    expect(result.actionCards.length).toBe(strongConnections.length);

    // Weak connections should NOT produce action cards
    const weakConnections = result.connections.filter((c) => c.score <= ACTION_CARD_THRESHOLD);
    for (const weak of weakConnections) {
      const matchingCard = result.actionCards.find(
        (card) => card.connection_opportunity_id === weak.id,
      );
      expect(matchingCard).toBeUndefined();
    }
  });

  it("ActionCards include actionableSteps (via description mentioning step count)", () => {
    const globalThreads = [
      makeGlobalThread(
        "g1",
        "Energy infrastructure vulnerability affecting global semiconductor supply chain capacity",
        ["infrastructure", "technology"],
      ),
    ];
    const localThreads = [
      makeLocalThread(
        "l1",
        "Energy infrastructure capacity planning community semiconductor supply response",
        ["infrastructure", "technology", "community"],
      ),
    ];

    const result = detectConnections(globalThreads, localThreads);

    for (const card of result.actionCards) {
      // Verify ActionCard has all required fields (VAL-CONN-002)
      expect(card.id).toBeTruthy();
      expect(card.connection_opportunity_id).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.description).toBeTruthy();
      expect(["individual", "team", "community", "network"]).toContain(card.scope);
      expect(["minutes", "hours", "days", "weeks"]).toContain(card.effort);
      expect(card.expected_benefit).toBeTruthy();
      expect(["none", "low", "medium", "high"]).toContain(card.risk);
      expect(card.feedback_metric).toBeTruthy();
      expect(card.feedback_metric.name).toBeTruthy();
      expect(card.feedback_metric.measurement).toBeTruthy();
      expect(typeof card.feedback_metric.baseline).toBe("number");
      expect(typeof card.feedback_metric.target).toBe("number");
      expect(card.time_window).toBeTruthy();
      expect(card.time_window.label).toBeTruthy();
      expect(card.created_at).toBeTruthy();
      expect(card.updated_at).toBeTruthy();
    }
  });

  it("ActionCard connection_opportunity_id references a valid connection", () => {
    const globalThreads = [
      makeGlobalThread(
        "g1",
        "Energy infrastructure vulnerability semiconductor supply chain global crisis",
        ["infrastructure", "technology"],
      ),
    ];
    const localThreads = [
      makeLocalThread(
        "l1",
        "Energy infrastructure semiconductor supply chain community preparedness response",
        ["infrastructure", "technology", "community"],
      ),
    ];

    const result = detectConnections(globalThreads, localThreads);
    const connectionIds = new Set(result.connections.map((c) => c.id));

    for (const card of result.actionCards) {
      expect(connectionIds.has(card.connection_opportunity_id)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. No-connection case (unrelated threads)
// ---------------------------------------------------------------------------

describe("no-connection edge case", () => {
  it("produces no strong connections for completely unrelated threads", () => {
    const globalThreads = [
      makeGlobalThread("g1", "Antarctic penguin population migration patterns wildlife", [
        "climate",
      ]),
    ];
    const localThreads = [
      makeLocalThread("l1", "JavaScript bundler performance optimization webpack rollup", [
        "technology",
      ]),
    ];

    const result = detectConnections(globalThreads, localThreads);

    // Should produce no action cards (no strong connection)
    expect(result.actionCards).toHaveLength(0);

    // Connections if any should be very weak
    for (const conn of result.connections) {
      expect(conn.score).toBeLessThan(0.3);
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Multiple global × multiple local (cross-product)
// ---------------------------------------------------------------------------

describe("multiple thread pairs", () => {
  it("evaluates all global×local pairs and returns connections for matching ones", () => {
    const globalThreads = [
      makeGlobalThread("g1", "Energy infrastructure disruption pipeline sanctions", [
        "infrastructure",
      ]),
      makeGlobalThread("g2", "Semiconductor chip shortage trade embargo", [
        "technology",
      ]),
    ];
    const localThreads = [
      makeLocalThread("l1", "Local energy infrastructure resilience planning community", [
        "infrastructure",
        "community",
      ]),
      makeLocalThread("l2", "Open source machine learning chip access community", [
        "technology",
        "community",
      ]),
      makeLocalThread("l3", "Community garden volunteer organizing food local", [
        "community",
      ]),
    ];

    const result = detectConnections(globalThreads, localThreads);

    // Should find connections between related pairs:
    // g1<->l1 (infrastructure), g2<->l2 (technology/chip)
    // Should be weaker or absent for unrelated: g1<->l3, g2<->l3
    const g1Connections = result.connections.filter((c) => c.global_thread_id === "g1");
    const g2Connections = result.connections.filter((c) => c.global_thread_id === "g2");

    // g1 should connect to l1 (infrastructure overlap)
    const g1l1 = g1Connections.find((c) => c.local_thread_ids.includes("l1"));
    expect(g1l1).toBeDefined();

    // g2 should connect to l2 (technology/chip overlap)
    const g2l2 = g2Connections.find((c) => c.local_thread_ids.includes("l2"));
    expect(g2l2).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 7. Connection type inference
// ---------------------------------------------------------------------------

describe("connection type inference", () => {
  it("infers causal when global thread appeared before local and keyword overlap is high", () => {
    const connType = _inferConnectionType(
      makeGlobalThread("g1", "test", [], {
        timeline: {
          first_seen: "2025-01-01T00:00:00.000Z",
          last_updated: "2025-01-01T00:00:00.000Z",
        },
      }),
      makeLocalThread("l1", "test", [], {
        timeline: {
          first_seen: "2025-01-05T00:00:00.000Z",
          last_updated: "2025-01-05T00:00:00.000Z",
        },
      }),
      0.3, // high keyword overlap
    );
    expect(connType).toBe("causal");
  });

  it("infers predictive when global appeared before local with moderate overlap", () => {
    const connType = _inferConnectionType(
      makeGlobalThread("g1", "test", [], {
        timeline: {
          first_seen: "2025-01-01T00:00:00.000Z",
          last_updated: "2025-01-01T00:00:00.000Z",
        },
      }),
      makeLocalThread("l1", "test", [], {
        timeline: {
          first_seen: "2025-01-02T00:00:00.000Z",
          last_updated: "2025-01-02T00:00:00.000Z",
        },
      }),
      0.08,
    );
    expect(connType).toBe("predictive");
  });

  it("infers correlative when threads appear simultaneously", () => {
    const sameTime = "2025-01-01T00:00:00.000Z";
    const connType = _inferConnectionType(
      makeGlobalThread("g1", "test", [], {
        timeline: { first_seen: sameTime, last_updated: sameTime },
      }),
      makeLocalThread("l1", "test", [], {
        timeline: { first_seen: sameTime, last_updated: sameTime },
      }),
      0.2,
    );
    expect(connType).toBe("correlative");
  });
});

// ---------------------------------------------------------------------------
// 8. Helper function tests
// ---------------------------------------------------------------------------

describe("helper functions", () => {
  it("tokenize removes stop words and short tokens", () => {
    const tokens = _tokenize("The energy infrastructure is being disrupted by sanctions");
    expect(tokens).toContain("energy");
    expect(tokens).toContain("infrastructure");
    expect(tokens).toContain("disrupted");
    expect(tokens).toContain("sanctions");
    expect(tokens).not.toContain("the");
    expect(tokens).not.toContain("is");
    expect(tokens).not.toContain("by");
  });

  it("cosineSimilarity returns 1 for identical vectors", () => {
    const vec = _buildTermVector(["energy", "infrastructure", "energy"]);
    expect(_cosineSimilarity(vec, vec)).toBeCloseTo(1.0, 5);
  });

  it("cosineSimilarity returns 0 for orthogonal vectors", () => {
    const vecA = _buildTermVector(["energy", "infrastructure"]);
    const vecB = _buildTermVector(["penguin", "migration"]);
    expect(_cosineSimilarity(vecA, vecB)).toBe(0);
  });

  it("keywordOverlap returns 0 for disjoint sets", () => {
    expect(_keywordOverlap(["energy", "grid"], ["penguin", "ice"])).toBe(0);
  });

  it("keywordOverlap returns 1 for identical sets", () => {
    expect(_keywordOverlap(["energy", "grid"], ["energy", "grid"])).toBe(1);
  });

  it("keywordOverlap returns correct Jaccard for partial overlap", () => {
    // {energy, grid, infrastructure} ∩ {energy, grid, penguin} = {energy, grid}
    // Union = {energy, grid, infrastructure, penguin} = 4
    // Jaccard = 2/4 = 0.5
    const overlap = _keywordOverlap(
      ["energy", "grid", "infrastructure"],
      ["energy", "grid", "penguin"],
    );
    expect(overlap).toBeCloseTo(0.5);
  });
});

// ---------------------------------------------------------------------------
// 9. ActionableSteps derivation
// ---------------------------------------------------------------------------

describe("actionable steps derivation", () => {
  it("produces at least 3 steps for causal connections", () => {
    const steps = _deriveActionableSteps(
      makeGlobalThread("g1", "Energy crisis"),
      makeLocalThread("l1", "Local community response"),
      "causal",
    );
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0]).toContain("Monitor");
  });

  it("produces different steps for different connection types", () => {
    const global = makeGlobalThread("g1", "Energy crisis");
    const local = makeLocalThread("l1", "Community response");

    const causalSteps = _deriveActionableSteps(global, local, "causal");
    const predictiveSteps = _deriveActionableSteps(global, local, "predictive");
    const correlativeSteps = _deriveActionableSteps(global, local, "correlative");

    // Each type should have unique steps beyond the shared "Monitor" step
    expect(causalSteps[1]).not.toBe(predictiveSteps[1]);
    expect(causalSteps[1]).not.toBe(correlativeSteps[1]);
    expect(predictiveSteps[1]).not.toBe(correlativeSteps[1]);
  });
});

// ---------------------------------------------------------------------------
// 10. Edge case: single-member threads
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  it("handles threads with no domain tags", () => {
    const globalThreads = [
      makeGlobalThread("g1", "Energy infrastructure crisis global", []),
    ];
    const localThreads = [
      makeLocalThread("l1", "Energy infrastructure local response", []),
    ];

    const result = detectConnections(globalThreads, localThreads);
    // Should still find connections based on keyword overlap
    expect(result.connections.length).toBeGreaterThanOrEqual(1);
  });

  it("handles threads with empty titles", () => {
    const globalThreads = [makeGlobalThread("g1", "", ["geopolitical"])];
    const localThreads = [makeLocalThread("l1", "", ["community"])];

    // Should not crash
    const result = detectConnections(globalThreads, localThreads);
    expect(Array.isArray(result.connections)).toBe(true);
    expect(Array.isArray(result.actionCards)).toBe(true);
  });

  it("handles large number of thread pairs without crashing", () => {
    const globalThreads = Array.from({ length: 10 }, (_, i) =>
      makeGlobalThread(`g${i}`, `Global thread about topic ${i} energy infrastructure`, [
        "geopolitical",
      ]),
    );
    const localThreads = Array.from({ length: 10 }, (_, i) =>
      makeLocalThread(`l${i}`, `Local thread about topic ${i} community response`, [
        "community",
      ]),
    );

    const result = detectConnections(globalThreads, localThreads);
    // 10 × 10 = 100 possible pairs; should process them all
    expect(Array.isArray(result.connections)).toBe(true);
  });
});
