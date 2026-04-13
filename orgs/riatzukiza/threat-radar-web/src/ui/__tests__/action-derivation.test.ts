import { describe, it, expect } from "vitest";
import { deriveActionSuggestions } from "../components/MuThreadCard";
import { normalizeDimension } from "../hooks/usePersonalization";
import type { ThreadData } from "../../api/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeThread(overrides: Partial<ThreadData> = {}): ThreadData {
  return {
    id: "test-thread-1",
    kind: "local_opportunity",
    title: "Test Thread",
    members: [
      { signal_event_id: "sig-1", relevance: 0.9, added_at: "2024-06-01T10:00:00Z" },
    ],
    source_distribution: { reddit: 0.5, bluesky: 0.5 },
    confidence: 0.7,
    timeline: {
      first_seen: "2024-06-01T08:00:00Z",
      last_updated: "2024-06-01T12:00:00Z",
    },
    domain_tags: [],
    status: "active",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// deriveActionSuggestions tests
// ---------------------------------------------------------------------------

describe("deriveActionSuggestions", () => {
  it("returns 1-3 actions", () => {
    const thread = makeThread({ domain_tags: ["ai", "community"] });
    const actions = deriveActionSuggestions(thread);
    expect(actions.length).toBeGreaterThanOrEqual(1);
    expect(actions.length).toBeLessThanOrEqual(3);
  });

  it("derives AI-related actions from ai tag", () => {
    const thread = makeThread({ domain_tags: ["ai"] });
    const actions = deriveActionSuggestions(thread);
    expect(actions.some((a) => a.toLowerCase().includes("ai") || a.toLowerCase().includes("model"))).toBe(true);
  });

  it("derives community actions from community tag", () => {
    const thread = makeThread({ domain_tags: ["community"] });
    const actions = deriveActionSuggestions(thread);
    expect(actions.some((a) => a.toLowerCase().includes("community"))).toBe(true);
  });

  it("derives oss actions from oss tag", () => {
    const thread = makeThread({ domain_tags: ["oss"] });
    const actions = deriveActionSuggestions(thread);
    expect(actions.some((a) => a.toLowerCase().includes("open-source") || a.toLowerCase().includes("adoption"))).toBe(true);
  });

  it("derives security actions from security tag", () => {
    const thread = makeThread({ domain_tags: ["security"] });
    const actions = deriveActionSuggestions(thread);
    expect(actions.some((a) => a.toLowerCase().includes("security"))).toBe(true);
  });

  it("derives technology actions from technology tag", () => {
    const thread = makeThread({ domain_tags: ["technology"] });
    const actions = deriveActionSuggestions(thread);
    expect(actions.some((a) => a.toLowerCase().includes("technology") || a.toLowerCase().includes("integration"))).toBe(true);
  });

  it("returns fallback actions for local_opportunity kind with no matching tags", () => {
    const thread = makeThread({ domain_tags: ["unknown-tag"], kind: "local_opportunity" });
    const actions = deriveActionSuggestions(thread);
    expect(actions.length).toBeGreaterThanOrEqual(1);
    expect(actions.some((a) => a.toLowerCase().includes("opportunity") || a.toLowerCase().includes("stakeholder"))).toBe(true);
  });

  it("returns fallback actions for event kind with no matching tags", () => {
    const thread = makeThread({ domain_tags: ["unknown-tag"], kind: "event" });
    const actions = deriveActionSuggestions(thread);
    expect(actions.length).toBeGreaterThanOrEqual(1);
    expect(actions.some((a) => a.toLowerCase().includes("monitor") || a.toLowerCase().includes("impact"))).toBe(true);
  });

  it("returns fallback action for narrative kind with no matching tags", () => {
    const thread = makeThread({ domain_tags: ["unknown-tag"], kind: "narrative" });
    const actions = deriveActionSuggestions(thread);
    expect(actions.length).toBeGreaterThanOrEqual(1);
    expect(actions.some((a) => a.toLowerCase().includes("narrative") || a.toLowerCase().includes("pattern"))).toBe(true);
  });

  it("does not return more than 3 actions even with many tags", () => {
    const thread = makeThread({
      domain_tags: ["ai", "community", "oss", "security", "technology", "developer", "climate"],
    });
    const actions = deriveActionSuggestions(thread);
    expect(actions.length).toBeLessThanOrEqual(3);
  });

  it("returns unique actions (no duplicates)", () => {
    const thread = makeThread({ domain_tags: ["ai", "community", "oss"] });
    const actions = deriveActionSuggestions(thread);
    const unique = new Set(actions);
    expect(unique.size).toBe(actions.length);
  });

  it("handles empty domain_tags array", () => {
    const thread = makeThread({ domain_tags: [] });
    const actions = deriveActionSuggestions(thread);
    expect(actions.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// normalizeDimension tests
// ---------------------------------------------------------------------------

describe("normalizeDimension", () => {
  it("returns exact match for canonical dimension names", () => {
    expect(normalizeDimension("geopolitical")).toBe("geopolitical");
    expect(normalizeDimension("infrastructure")).toBe("infrastructure");
    expect(normalizeDimension("economic")).toBe("economic");
    expect(normalizeDimension("security")).toBe("security");
    expect(normalizeDimension("climate")).toBe("climate");
    expect(normalizeDimension("technology")).toBe("technology");
  });

  it("normalizes 'geopolitics' → 'geopolitical'", () => {
    expect(normalizeDimension("geopolitics")).toBe("geopolitical");
  });

  it("normalizes 'economy' → 'economic'", () => {
    expect(normalizeDimension("economy")).toBe("economic");
  });

  it("normalizes 'tech' → 'technology'", () => {
    expect(normalizeDimension("tech")).toBe("technology");
  });

  it("normalizes 'ai' → 'technology'", () => {
    expect(normalizeDimension("ai")).toBe("technology");
  });

  it("normalizes 'cybersecurity' → 'security'", () => {
    expect(normalizeDimension("cybersecurity")).toBe("security");
  });

  it("normalizes 'infra' → 'infrastructure'", () => {
    expect(normalizeDimension("infra")).toBe("infrastructure");
  });

  it("normalizes 'environmental' → 'climate'", () => {
    expect(normalizeDimension("environmental")).toBe("climate");
  });

  it("is case-insensitive", () => {
    expect(normalizeDimension("Geopolitical")).toBe("geopolitical");
    expect(normalizeDimension("TECHNOLOGY")).toBe("technology");
    expect(normalizeDimension("Economic")).toBe("economic");
  });

  it("returns undefined for unknown dimension names", () => {
    expect(normalizeDimension("random")).toBeUndefined();
    expect(normalizeDimension("unknown")).toBeUndefined();
    expect(normalizeDimension("LocalLLaMA")).toBeUndefined();
  });

  it("maps financial variants to economic", () => {
    expect(normalizeDimension("financial")).toBe("economic");
    expect(normalizeDimension("finance")).toBe("economic");
    expect(normalizeDimension("market")).toBe("economic");
  });

  it("maps energy to infrastructure", () => {
    expect(normalizeDimension("energy")).toBe("infrastructure");
  });
});
