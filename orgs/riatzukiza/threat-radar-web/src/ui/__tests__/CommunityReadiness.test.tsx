import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  CommunityReadiness,
  computeAwareness,
  computeEngagement,
  computeCoordination,
  computeResilience,
  computeReadinessDimensions,
} from "../components/CommunityReadiness";
import type { ThreadData } from "../../api/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeThread(overrides: Partial<ThreadData> = {}): ThreadData {
  return {
    id: "thread-1",
    radar_id: "radar-1",
    kind: "local_opportunity",
    title: "Local AI Meetup Planning",
    summary: "Community organizing a local AI developer meetup",
    members: [
      { signal_event_id: "sig-1", relevance: 0.9, added_at: "2024-06-01T10:00:00Z" },
      { signal_event_id: "sig-2", relevance: 0.8, added_at: "2024-06-01T11:00:00Z" },
      { signal_event_id: "sig-3", relevance: 0.7, added_at: "2024-06-01T12:00:00Z" },
    ],
    source_distribution: { reddit: 0.6, bluesky: 0.4 },
    confidence: 0.75,
    timeline: {
      first_seen: "2024-06-01T08:00:00Z",
      last_updated: new Date().toISOString(),
      peak_activity: "2024-06-01T14:00:00Z",
    },
    domain_tags: ["community", "ai", "local"],
    status: "active",
    ...overrides,
  };
}

function makeManySignalsThread(): ThreadData {
  const members = Array.from({ length: 25 }, (_, i) => ({
    signal_event_id: `sig-${i}`,
    relevance: 0.5 + Math.random() * 0.5,
    added_at: new Date(Date.now() - i * 3600_000).toISOString(),
  }));
  return makeThread({ id: "many-signals", members });
}

function makeDiverseSourceThread(): ThreadData {
  return makeThread({
    id: "diverse-sources",
    source_distribution: { reddit: 0.3, bluesky: 0.25, twitter: 0.2, mastodon: 0.15, rss: 0.1 },
  });
}

function makeOldThread(): ThreadData {
  return makeThread({
    id: "old-thread",
    timeline: {
      first_seen: new Date(Date.now() - 30 * 24 * 3600_000).toISOString(),
      last_updated: new Date().toISOString(),
    },
  });
}

function makeNewThread(): ThreadData {
  return makeThread({
    id: "new-thread",
    timeline: {
      first_seen: new Date(Date.now() - 2 * 3600_000).toISOString(),
      last_updated: new Date().toISOString(),
    },
  });
}

// ---------------------------------------------------------------------------
// computeAwareness tests
// ---------------------------------------------------------------------------

describe("computeAwareness", () => {
  it("returns 0 when no threads", () => {
    expect(computeAwareness([])).toBe(0);
  });

  it("scales with signal count", () => {
    const few = computeAwareness([makeThread()]);
    const many = computeAwareness([makeManySignalsThread()]);
    expect(many).toBeGreaterThan(few);
  });

  it("caps at 100", () => {
    const massive = makeThread({
      members: Array.from({ length: 100 }, (_, i) => ({
        signal_event_id: `sig-${i}`,
        relevance: 0.5,
        added_at: new Date().toISOString(),
      })),
    });
    expect(computeAwareness([massive])).toBe(100);
  });

  it("returns value between 0 and 100", () => {
    const result = computeAwareness([makeThread()]);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// computeEngagement tests
// ---------------------------------------------------------------------------

describe("computeEngagement", () => {
  it("returns 0 when no threads", () => {
    expect(computeEngagement([])).toBe(0);
  });

  it("increases with more diverse sources", () => {
    const basic = computeEngagement([makeThread()]);
    const diverse = computeEngagement([makeDiverseSourceThread()]);
    expect(diverse).toBeGreaterThan(basic);
  });

  it("caps at 100 with 5+ sources", () => {
    expect(computeEngagement([makeDiverseSourceThread()])).toBe(100);
  });

  it("returns value between 0 and 100", () => {
    const result = computeEngagement([makeThread()]);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// computeCoordination tests
// ---------------------------------------------------------------------------

describe("computeCoordination", () => {
  it("returns 0 when no threads", () => {
    expect(computeCoordination([])).toBe(0);
  });

  it("returns low value for single thread", () => {
    expect(computeCoordination([makeThread()])).toBe(10);
  });

  it("higher for threads sharing domain tags", () => {
    const t1 = makeThread({ id: "t1", domain_tags: ["community", "ai"] });
    const t2 = makeThread({ id: "t2", domain_tags: ["community", "ai", "local"] });
    const result = computeCoordination([t1, t2]);
    expect(result).toBeGreaterThan(10);
  });

  it("lower for threads with no shared tags", () => {
    const t1 = makeThread({ id: "t1", domain_tags: ["community"] });
    const t2 = makeThread({ id: "t2", domain_tags: ["finance"] });
    const noShared = computeCoordination([t1, t2]);
    const t3 = makeThread({ id: "t3", domain_tags: ["community", "ai"] });
    const t4 = makeThread({ id: "t4", domain_tags: ["community", "ai"] });
    const shared = computeCoordination([t3, t4]);
    expect(shared).toBeGreaterThan(noShared);
  });

  it("returns value between 0 and 100", () => {
    const result = computeCoordination([makeThread(), makeThread({ id: "t2" })]);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// computeResilience tests
// ---------------------------------------------------------------------------

describe("computeResilience", () => {
  it("returns 0 when no threads", () => {
    expect(computeResilience([])).toBe(0);
  });

  it("returns moderate value for single old thread", () => {
    const result = computeResilience([makeOldThread()]);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(40);
  });

  it("higher with age diversity (old + new threads)", () => {
    const diverse = computeResilience([makeOldThread(), makeNewThread()]);
    const uniform = computeResilience([makeNewThread(), makeThread({
      id: "also-new",
      timeline: {
        first_seen: new Date(Date.now() - 1 * 3600_000).toISOString(),
        last_updated: new Date().toISOString(),
      },
    })]);
    expect(diverse).toBeGreaterThan(uniform);
  });

  it("returns value between 0 and 100", () => {
    const result = computeResilience([makeThread()]);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// computeReadinessDimensions tests
// ---------------------------------------------------------------------------

describe("computeReadinessDimensions", () => {
  it("returns 4 dimensions", () => {
    const dims = computeReadinessDimensions([makeThread()]);
    expect(dims).toHaveLength(4);
  });

  it("returns correct keys", () => {
    const dims = computeReadinessDimensions([makeThread()]);
    const keys = dims.map((d) => d.key);
    expect(keys).toEqual(["awareness", "engagement", "coordination", "resilience"]);
  });

  it("returns all zeros for empty threads", () => {
    const dims = computeReadinessDimensions([]);
    for (const dim of dims) {
      expect(dim.value).toBe(0);
    }
  });

  it("all values between 0 and 100", () => {
    const dims = computeReadinessDimensions([makeThread(), makeManySignalsThread()]);
    for (const dim of dims) {
      expect(dim.value).toBeGreaterThanOrEqual(0);
      expect(dim.value).toBeLessThanOrEqual(100);
    }
  });
});

// ---------------------------------------------------------------------------
// CommunityReadiness component rendering tests
// ---------------------------------------------------------------------------

describe("CommunityReadiness", () => {
  it("renders without crashing with no threads", () => {
    render(<CommunityReadiness threads={[]} />);
    expect(screen.getByTestId("community-readiness")).toBeDefined();
  });

  it("renders title", () => {
    render(<CommunityReadiness threads={[]} />);
    expect(screen.getByText("Community Readiness")).toBeDefined();
  });

  it("shows thread count as '0 threads' when empty", () => {
    render(<CommunityReadiness threads={[]} />);
    const countEl = screen.getByTestId("cr-thread-count");
    expect(countEl.textContent).toBe("0 threads");
  });

  it("shows correct thread count for 1 thread", () => {
    render(<CommunityReadiness threads={[makeThread()]} />);
    const countEl = screen.getByTestId("cr-thread-count");
    expect(countEl.textContent).toBe("1 thread");
  });

  it("shows correct thread count for multiple threads", () => {
    render(<CommunityReadiness threads={[makeThread(), makeThread({ id: "t2" })]} />);
    const countEl = screen.getByTestId("cr-thread-count");
    expect(countEl.textContent).toBe("2 threads");
  });

  it("renders 4 progress bars", () => {
    render(<CommunityReadiness threads={[makeThread()]} />);
    expect(screen.getByTestId("cr-bar-awareness")).toBeDefined();
    expect(screen.getByTestId("cr-bar-engagement")).toBeDefined();
    expect(screen.getByTestId("cr-bar-coordination")).toBeDefined();
    expect(screen.getByTestId("cr-bar-resilience")).toBeDefined();
  });

  it("renders all 4 bars even when empty (zero state)", () => {
    render(<CommunityReadiness threads={[]} />);
    expect(screen.getByTestId("cr-bar-awareness")).toBeDefined();
    expect(screen.getByTestId("cr-bar-engagement")).toBeDefined();
    expect(screen.getByTestId("cr-bar-coordination")).toBeDefined();
    expect(screen.getByTestId("cr-bar-resilience")).toBeDefined();
  });

  it("shows 0% for all bars when no threads", () => {
    render(<CommunityReadiness threads={[]} />);
    const bars = screen.getByTestId("cr-bars");
    const values = bars.querySelectorAll(".cr-bar-value");
    for (const v of values) {
      expect(v.textContent).toBe("0%");
    }
  });

  it("shows non-zero values when threads exist", () => {
    render(<CommunityReadiness threads={[makeThread(), makeManySignalsThread()]} />);
    const awarenessFill = screen.getByTestId("cr-bar-fill-awareness");
    // Should have some width (awareness is based on total signals)
    expect(awarenessFill.style.width).not.toBe("0%");
  });

  it("progress bar fill width matches value", () => {
    render(<CommunityReadiness threads={[makeThread()]} />);
    const awarenessBar = screen.getByTestId("cr-bar-awareness");
    const value = awarenessBar.querySelector(".cr-bar-value");
    const fill = screen.getByTestId("cr-bar-fill-awareness");
    // The fill width should match the displayed percentage
    const pct = value?.textContent ?? "0%";
    expect(fill.style.width).toBe(pct);
  });

  it("shows dimension descriptions", () => {
    render(<CommunityReadiness threads={[makeThread()]} />);
    expect(screen.getByText("How many local signals exist")).toBeDefined();
    expect(screen.getByText("Signal diversity across sources")).toBeDefined();
    expect(screen.getByText("Thread interconnectedness")).toBeDefined();
    expect(screen.getByText("Thread age distribution")).toBeDefined();
  });

  it("applies custom className", () => {
    render(<CommunityReadiness threads={[]} className="custom-class" />);
    const el = screen.getByTestId("community-readiness");
    expect(el.className).toContain("custom-class");
  });
});

// ---------------------------------------------------------------------------
// Integration: CommunityReadiness renders inside MuLane
// ---------------------------------------------------------------------------

describe("CommunityReadiness in MuLane", () => {
  // We import MuLaneContent to verify CommunityReadiness is included
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  it("MuLaneContent renders CommunityReadiness when threads exist", async () => {
    const { MuLaneContent } = await import("../components/MuLane");
    const tile = {
      radar: { id: "r1", slug: "local-1", name: "Local", category: "community", status: "active" },
      sourceCount: 2,
      submissionCount: 1,
      threads: [makeThread()],
    };
    render(<MuLaneContent tiles={[tile]} />);
    expect(screen.getByTestId("community-readiness")).toBeDefined();
  });

  it("MuLaneContent renders CommunityReadiness with empty progress bars when no local threads", async () => {
    const { MuLaneContent } = await import("../components/MuLane");
    render(<MuLaneContent tiles={[]} />);
    expect(screen.getByTestId("community-readiness")).toBeDefined();
    const bars = screen.getByTestId("cr-bars");
    const values = bars.querySelectorAll(".cr-bar-value");
    for (const v of values) {
      expect(v.textContent).toBe("0%");
    }
  });
});
