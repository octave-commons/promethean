import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MuLaneContent } from "../components/MuLane";
import { MuThreadCard, computeLeverage, computeProximity, leverageLevel, proximityLevel, timeToAct } from "../components/MuThreadCard";
import type { RadarTile, ThreadData } from "../../api/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeLocalThread(overrides: Partial<ThreadData> = {}): ThreadData {
  return {
    id: "local-thread-1",
    radar_id: "radar-local-1",
    kind: "local_opportunity",
    title: "Open-Source AI Model Release",
    summary: "Community effort to release a new open model with local developer impact",
    members: [
      { signal_event_id: "sig-l1", relevance: 0.95, added_at: "2024-06-01T10:00:00Z" },
      { signal_event_id: "sig-l2", relevance: 0.85, added_at: "2024-06-01T11:00:00Z" },
      { signal_event_id: "sig-l3", relevance: 0.7, added_at: "2024-06-01T12:00:00Z" },
    ],
    source_distribution: { reddit: 0.7, bluesky: 0.3 },
    confidence: 0.75,
    timeline: {
      first_seen: "2024-06-01T08:00:00Z",
      last_updated: new Date().toISOString(),
      peak_activity: "2024-06-01T14:00:00Z",
    },
    domain_tags: ["community", "oss", "ai"],
    status: "active",
    ...overrides,
  };
}

function makeLowLeverageThread(overrides: Partial<ThreadData> = {}): ThreadData {
  return makeLocalThread({
    id: "local-thread-low",
    title: "Archive Discussion",
    kind: "narrative",
    confidence: 0.2,
    status: "archived",
    domain_tags: ["community"],
    ...overrides,
  });
}

function makeLocalRadarTile(overrides: Partial<RadarTile> = {}): RadarTile {
  return {
    radar: {
      id: "radar-local-1",
      slug: "community-signals",
      name: "Community Signals",
      category: "community",
      status: "active",
    },
    sourceCount: 3,
    submissionCount: 2,
    liveSnapshot: {
      as_of_utc: "2024-06-01T12:00:00Z",
      disagreement_index: 0.2,
      quality_score: 65,
      signals: {},
      branches: [],
      model_count: 1,
    },
    threads: [makeLocalThread()],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// computeLeverage tests
// ---------------------------------------------------------------------------

describe("computeLeverage", () => {
  it("returns higher leverage for local_opportunity + active", () => {
    const thread = makeLocalThread({ kind: "local_opportunity", status: "active" });
    const score = computeLeverage(thread);
    expect(score).toBeGreaterThan(0.6);
  });

  it("returns lower leverage for narrative + archived", () => {
    const thread = makeLocalThread({ kind: "narrative", status: "archived", confidence: 0.2, domain_tags: [] });
    const score = computeLeverage(thread);
    expect(score).toBeLessThan(0.3);
  });

  it("returns value between 0 and 1", () => {
    const thread = makeLocalThread();
    const score = computeLeverage(thread);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("confidence boosts leverage", () => {
    const lowConf = computeLeverage(makeLocalThread({ confidence: 0.1 }));
    const highConf = computeLeverage(makeLocalThread({ confidence: 0.9 }));
    expect(highConf).toBeGreaterThan(lowConf);
  });
});

// ---------------------------------------------------------------------------
// computeProximity tests
// ---------------------------------------------------------------------------

describe("computeProximity", () => {
  it("returns higher proximity for local_opportunity with community tags", () => {
    const thread = makeLocalThread({ kind: "local_opportunity", domain_tags: ["community", "oss", "local"] });
    const score = computeProximity(thread);
    expect(score).toBeGreaterThan(0.5);
  });

  it("returns value between 0 and 1", () => {
    const thread = makeLocalThread();
    const score = computeProximity(thread);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("reddit share boosts proximity", () => {
    const lowReddit = computeProximity(makeLocalThread({ source_distribution: { bluesky: 0.9, reddit: 0.1 } }));
    const highReddit = computeProximity(makeLocalThread({ source_distribution: { reddit: 0.9, bluesky: 0.1 } }));
    expect(highReddit).toBeGreaterThan(lowReddit);
  });
});

// ---------------------------------------------------------------------------
// leverageLevel, proximityLevel, timeToAct tests
// ---------------------------------------------------------------------------

describe("leverageLevel", () => {
  it("returns 'high' for scores >= 0.6", () => {
    expect(leverageLevel(0.8)).toBe("high");
    expect(leverageLevel(0.6)).toBe("high");
  });

  it("returns 'medium' for scores 0.35-0.59", () => {
    expect(leverageLevel(0.5)).toBe("medium");
    expect(leverageLevel(0.35)).toBe("medium");
  });

  it("returns 'low' for scores < 0.35", () => {
    expect(leverageLevel(0.1)).toBe("low");
    expect(leverageLevel(0.0)).toBe("low");
  });
});

describe("proximityLevel", () => {
  it("returns 'close' for scores >= 0.6", () => {
    expect(proximityLevel(0.7)).toBe("close");
  });

  it("returns 'moderate' for scores 0.35-0.59", () => {
    expect(proximityLevel(0.45)).toBe("moderate");
  });

  it("returns 'distant' for scores < 0.35", () => {
    expect(proximityLevel(0.2)).toBe("distant");
  });
});

describe("timeToAct", () => {
  it("returns 'act now' for active status", () => {
    expect(timeToAct(makeLocalThread({ status: "active" }))).toBe("act now");
  });

  it("returns 'act within days' for emerging status", () => {
    expect(timeToAct(makeLocalThread({ status: "emerging" }))).toBe("act within days");
  });

  it("returns 'act within weeks' for cooling status", () => {
    expect(timeToAct(makeLocalThread({ status: "cooling" }))).toBe("act within weeks");
  });

  it("returns 'window closing' for archived status", () => {
    expect(timeToAct(makeLocalThread({ status: "archived" }))).toBe("window closing");
  });
});

// ---------------------------------------------------------------------------
// MuThreadCard tests
// ---------------------------------------------------------------------------

describe("MuThreadCard", () => {
  it("renders thread title", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    expect(screen.getByText("Open-Source AI Model Release")).toBeDefined();
  });

  it("renders thread summary", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    expect(screen.getByText(/Community effort/i)).toBeDefined();
  });

  it("shows signal count", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    const countEl = screen.getByTestId("mu-signal-count");
    expect(countEl.textContent).toContain("3 signals");
  });

  it("shows proximity indicator", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    const indicator = screen.getByTestId("mu-indicator-proximity");
    expect(indicator).toBeDefined();
    expect(indicator.textContent).toMatch(/close|moderate|distant/);
  });

  it("shows leverage indicator", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    const indicator = screen.getByTestId("mu-indicator-leverage");
    expect(indicator).toBeDefined();
    expect(indicator.textContent).toMatch(/high|medium|low/);
  });

  it("shows time-to-act indicator", () => {
    render(<MuThreadCard thread={makeLocalThread({ status: "active" })} />);
    const indicator = screen.getByTestId("mu-indicator-time");
    expect(indicator).toBeDefined();
    expect(indicator.textContent).toContain("act now");
  });

  it("shows leverage bar", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    expect(screen.getByTestId("mu-leverage-bar")).toBeDefined();
  });

  it("shows source badges", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    expect(screen.getByTestId("source-badge-reddit")).toBeDefined();
    expect(screen.getByTestId("source-badge-bluesky")).toBeDefined();
  });

  it("shows expand hint", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    const hint = screen.getByTestId("mu-expand-hint");
    expect(hint.textContent).toContain("details");
  });

  it("expands on click to show signal details", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    const card = screen.getByTestId("mu-thread-card");
    expect(screen.queryByTestId("mu-expanded-details")).toBeNull();

    fireEvent.click(card);
    expect(screen.getByTestId("mu-expanded-details")).toBeDefined();
  });

  it("collapses on second click", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    const card = screen.getByTestId("mu-thread-card");

    fireEvent.click(card);
    expect(screen.getByTestId("mu-expanded-details")).toBeDefined();

    fireEvent.click(card);
    expect(screen.queryByTestId("mu-expanded-details")).toBeNull();
  });

  it("shows domain tags in expanded view", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    fireEvent.click(screen.getByTestId("mu-thread-card"));
    expect(screen.getByText("community")).toBeDefined();
    expect(screen.getByText("oss")).toBeDefined();
  });

  it("shows member signals in expanded view", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    fireEvent.click(screen.getByTestId("mu-thread-card"));
    // Should show signal IDs (truncated)
    expect(screen.getByText(/sig-l1/)).toBeDefined();
  });

  it("shows time-to-act for emerging status", () => {
    render(<MuThreadCard thread={makeLocalThread({ status: "emerging" })} />);
    const indicator = screen.getByTestId("mu-indicator-time");
    expect(indicator.textContent).toContain("act within days");
  });

  it("accessible via keyboard Enter", () => {
    render(<MuThreadCard thread={makeLocalThread()} />);
    const card = screen.getByTestId("mu-thread-card");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(screen.getByTestId("mu-expanded-details")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// MuLaneContent tests
// ---------------------------------------------------------------------------

describe("MuLaneContent", () => {
  it("renders empty state when no tiles", () => {
    render(<MuLaneContent tiles={[]} />);
    expect(screen.getByTestId("mu-empty-state")).toBeDefined();
    expect(screen.getByText(/No local signals/i)).toBeDefined();
  });

  it("renders empty state when tiles have no local threads", () => {
    const tile = makeLocalRadarTile({
      threads: [makeLocalThread({ kind: "event", domain_tags: ["geopolitical"] })],
    });
    render(<MuLaneContent tiles={[tile]} />);
    expect(screen.getByTestId("mu-empty-state")).toBeDefined();
  });

  it("renders thread cards for local threads", () => {
    const tile = makeLocalRadarTile();
    render(<MuLaneContent tiles={[tile]} />);
    expect(screen.getByTestId("mu-lane-content")).toBeDefined();
    expect(screen.getAllByTestId("mu-thread-card").length).toBe(1);
  });

  it("shows thread count", () => {
    const tile = makeLocalRadarTile();
    render(<MuLaneContent tiles={[tile]} />);
    const count = screen.getByTestId("mu-thread-count");
    expect(count.textContent).toContain("1 local thread");
  });

  it("sorts threads by leverage (most actionable first)", () => {
    const highLevThread = makeLocalThread({
      id: "high-lev",
      title: "High Leverage Thread",
      kind: "local_opportunity",
      status: "active",
      confidence: 0.9,
      domain_tags: ["community", "oss", "local"],
    });
    const lowLevThread = makeLowLeverageThread({
      id: "low-lev",
      title: "Low Leverage Thread",
    });
    const tile = makeLocalRadarTile({
      threads: [lowLevThread, highLevThread],
    });
    render(<MuLaneContent tiles={[tile]} />);
    const cards = screen.getAllByTestId("mu-thread-card");
    expect(cards.length).toBe(2);
    // First card should be the high-leverage one
    expect(cards[0].textContent).toContain("High Leverage Thread");
  });

  it("renders multiple threads from multiple tiles", () => {
    const tile1 = makeLocalRadarTile({
      threads: [makeLocalThread({ id: "t1", title: "Thread One" })],
    });
    const tile2 = makeLocalRadarTile({
      radar: { id: "r2", slug: "r2", name: "R2", category: "community", status: "active" },
      threads: [makeLocalThread({ id: "t2", title: "Thread Two" })],
    });
    render(<MuLaneContent tiles={[tile1, tile2]} />);
    expect(screen.getAllByTestId("mu-thread-card").length).toBe(2);
    const count = screen.getByTestId("mu-thread-count");
    expect(count.textContent).toContain("2 local threads");
  });
});
