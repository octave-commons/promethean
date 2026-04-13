import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FirehosePanel, tilesToFirehoseEntries, freshnessClass, relativeTime } from "../components/FirehosePanel";
import type { RadarTile, ThreadData } from "../../api/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeThread(overrides: Partial<ThreadData> = {}): ThreadData {
  return {
    id: "thread-1",
    radar_id: "radar-1",
    kind: "event",
    title: "Global Energy Disruption",
    summary: "Multiple signals indicate infrastructure stress",
    members: [
      { signal_event_id: "sig-1", relevance: 0.9, added_at: "2024-01-01T00:00:00Z" },
      { signal_event_id: "sig-2", relevance: 0.8, added_at: "2024-01-01T01:00:00Z" },
    ],
    source_distribution: { bluesky: 0.6, reddit: 0.4 },
    confidence: 0.65,
    timeline: {
      first_seen: "2024-01-01T00:00:00Z",
      last_updated: new Date().toISOString(),
      peak_activity: "2024-01-01T06:00:00Z",
    },
    domain_tags: ["geopolitical", "infrastructure"],
    status: "active",
    ...overrides,
  };
}

function makeTile(overrides: Partial<RadarTile> = {}, threadOverrides: Partial<ThreadData> = {}): RadarTile {
  return {
    radar: {
      id: "radar-1",
      slug: "energy-stress",
      name: "Energy Stress Monitor",
      category: "geopolitical",
      status: "active",
    },
    sourceCount: 3,
    submissionCount: 5,
    liveSnapshot: {
      as_of_utc: "2024-01-01T12:00:00Z",
      disagreement_index: 0.3,
      quality_score: 0.7,
      signals: {},
      branches: [],
      model_count: 2,
    },
    threads: [makeThread(threadOverrides)],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// tilesToFirehoseEntries — pure function tests
// ---------------------------------------------------------------------------

describe("tilesToFirehoseEntries", () => {
  it("returns empty array when tiles have no threads", () => {
    const tiles: RadarTile[] = [makeTile({ threads: undefined })];
    expect(tilesToFirehoseEntries(tiles)).toHaveLength(0);
  });

  it("extracts entries from threads", () => {
    const tiles = [makeTile()];
    const entries = tilesToFirehoseEntries(tiles);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.title).toBe("Global Energy Disruption");
    expect(entries[0]!.source).toBe("bluesky");
    expect(entries[0]!.signalCount).toBe(2);
    expect(entries[0]!.radarName).toBe("Energy Stress Monitor");
  });

  it("sorts entries by timestamp descending (most recent first)", () => {
    const tiles = [
      makeTile({
        threads: [
          makeThread({ id: "t1", timeline: { first_seen: "2024-01-01T00:00:00Z", last_updated: "2024-01-01T00:00:00Z" } }),
          makeThread({ id: "t2", timeline: { first_seen: "2024-01-01T12:00:00Z", last_updated: "2024-01-02T00:00:00Z" } }),
        ],
      }),
    ];
    const entries = tilesToFirehoseEntries(tiles);
    expect(entries).toHaveLength(2);
    // t2 has later timestamp, should come first
    expect(entries[0]!.id).toContain("t2");
    expect(entries[1]!.id).toContain("t1");
  });

  it("classifies local_opportunity threads as actionable", () => {
    const tiles = [makeTile({}, { kind: "local_opportunity" })];
    const entries = tilesToFirehoseEntries(tiles);
    expect(entries[0]!.classification).toBe("actionable");
  });

  it("classifies emerging threads as actionable", () => {
    const tiles = [makeTile({}, { status: "emerging" })];
    const entries = tilesToFirehoseEntries(tiles);
    expect(entries[0]!.classification).toBe("actionable");
  });

  it("classifies high-confidence event threads as useful", () => {
    const tiles = [makeTile({}, { kind: "event", confidence: 0.7, status: "active" })];
    const entries = tilesToFirehoseEntries(tiles);
    expect(entries[0]!.classification).toBe("useful");
  });

  it("classifies low-confidence threads as noise", () => {
    const tiles = [makeTile({}, { kind: "narrative", confidence: 0.2, status: "archived" })];
    const entries = tilesToFirehoseEntries(tiles);
    expect(entries[0]!.classification).toBe("noise");
  });

  it("picks source with highest count from source_distribution", () => {
    const tiles = [makeTile({}, { source_distribution: { reddit: 0.8, bluesky: 0.2 } })];
    const entries = tilesToFirehoseEntries(tiles);
    expect(entries[0]!.source).toBe("reddit");
  });

  it("includes domain tags from thread", () => {
    const tiles = [makeTile({}, { domain_tags: ["energy", "climate", "security"] })];
    const entries = tilesToFirehoseEntries(tiles);
    expect(entries[0]!.tags).toEqual(["energy", "climate", "security"]);
  });
});

// ---------------------------------------------------------------------------
// freshnessClass — pure function tests
// ---------------------------------------------------------------------------

describe("freshnessClass", () => {
  it("returns 'fresh' for timestamps less than 30 minutes old", () => {
    const recent = new Date(Date.now() - 5 * 60_000).toISOString(); // 5 min ago
    expect(freshnessClass(recent)).toBe("fresh");
  });

  it("returns 'aging' for timestamps between 30 min and 3 hours old", () => {
    const aging = new Date(Date.now() - 90 * 60_000).toISOString(); // 1.5 hours ago
    expect(freshnessClass(aging)).toBe("aging");
  });

  it("returns 'stale' for timestamps older than 3 hours", () => {
    const stale = new Date(Date.now() - 240 * 60_000).toISOString(); // 4 hours ago
    expect(freshnessClass(stale)).toBe("stale");
  });
});

// ---------------------------------------------------------------------------
// relativeTime — pure function tests
// ---------------------------------------------------------------------------

describe("relativeTime", () => {
  it("returns 'just now' for very recent timestamps", () => {
    const now = new Date().toISOString();
    expect(relativeTime(now)).toBe("just now");
  });

  it("returns minutes format for timestamps < 1 hour", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(relativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours format for timestamps < 24 hours", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600_000).toISOString();
    expect(relativeTime(threeHoursAgo)).toBe("3h ago");
  });

  it("returns days format for timestamps >= 24 hours", () => {
    const twoDaysAgo = new Date(Date.now() - 48 * 3600_000).toISOString();
    expect(relativeTime(twoDaysAgo)).toBe("2d ago");
  });
});

// ---------------------------------------------------------------------------
// FirehosePanel component tests
// ---------------------------------------------------------------------------

describe("FirehosePanel", () => {
  it("renders without crashing", () => {
    const { container } = render(<FirehosePanel tiles={[]} />);
    expect(container.querySelector("[data-testid='firehose-panel']")).toBeTruthy();
  });

  it("shows signal count in toggle bar", () => {
    const tiles = [makeTile()];
    render(<FirehosePanel tiles={tiles} />);
    const count = screen.getByTestId("firehose-count");
    expect(count.textContent).toBe("1 signal");
  });

  it("shows plural 'signals' for multiple entries", () => {
    const tiles = [
      makeTile({
        threads: [
          makeThread({ id: "t1" }),
          makeThread({ id: "t2", title: "Second Thread" }),
        ],
      }),
    ];
    render(<FirehosePanel tiles={tiles} />);
    const count = screen.getByTestId("firehose-count");
    expect(count.textContent).toBe("2 signals");
  });

  it("starts collapsed by default", () => {
    render(<FirehosePanel tiles={[makeTile()]} />);
    expect(screen.queryByTestId("firehose-body")).toBeNull();
  });

  it("expands when toggle is clicked", () => {
    render(<FirehosePanel tiles={[makeTile()]} />);
    const toggle = screen.getByLabelText("Expand signal firehose");
    fireEvent.click(toggle);
    expect(screen.getByTestId("firehose-body")).toBeTruthy();
  });

  it("shows entries when expanded with data", () => {
    render(<FirehosePanel tiles={[makeTile()]} />);
    fireEvent.click(screen.getByLabelText("Expand signal firehose"));
    const entries = screen.getAllByTestId("firehose-entry");
    expect(entries.length).toBe(1);
  });

  it("shows firehose empty state when expanded with no signals", () => {
    render(<FirehosePanel tiles={[]} />);
    fireEvent.click(screen.getByLabelText("Expand signal firehose"));
    expect(screen.getByTestId("firehose-empty")).toBeTruthy();
  });

  it("shows empty state when tiles have no threads", () => {
    render(<FirehosePanel tiles={[makeTile({ threads: undefined })]} />);
    fireEvent.click(screen.getByLabelText("Expand signal firehose"));
    expect(screen.getByTestId("firehose-empty")).toBeTruthy();
  });

  it("renders freshness indicator for each entry", () => {
    render(<FirehosePanel tiles={[makeTile()]} />);
    fireEvent.click(screen.getByLabelText("Expand signal firehose"));
    expect(screen.getByTestId("freshness-indicator")).toBeTruthy();
  });

  it("renders quality badge for each entry", () => {
    render(<FirehosePanel tiles={[makeTile()]} />);
    fireEvent.click(screen.getByLabelText("Expand signal firehose"));
    expect(screen.getByTestId("quality-badge")).toBeTruthy();
  });

  it("renders classification tag for each entry", () => {
    render(<FirehosePanel tiles={[makeTile()]} />);
    fireEvent.click(screen.getByLabelText("Expand signal firehose"));
    expect(screen.getByTestId("classification-tag")).toBeTruthy();
  });

  it("renders source badge for each entry", () => {
    render(<FirehosePanel tiles={[makeTile()]} />);
    fireEvent.click(screen.getByLabelText("Expand signal firehose"));
    expect(screen.getByTestId("source-badge-bluesky")).toBeTruthy();
  });

  it("collapses when toggle is clicked again", () => {
    render(<FirehosePanel tiles={[makeTile()]} />);
    const toggle = screen.getByLabelText("Expand signal firehose");
    fireEvent.click(toggle);
    expect(screen.getByTestId("firehose-body")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Collapse signal firehose"));
    expect(screen.queryByTestId("firehose-body")).toBeNull();
  });

  it("shows freshness color coding: fresh (green) for new signals", () => {
    const recentThread = makeThread({
      timeline: { first_seen: "2024-01-01T00:00:00Z", last_updated: new Date().toISOString() },
    });
    render(<FirehosePanel tiles={[makeTile({ threads: [recentThread] })]} />);
    fireEvent.click(screen.getByLabelText("Expand signal firehose"));
    const indicator = screen.getByTestId("freshness-indicator");
    expect(indicator.className).toContain("fh-freshness-fresh");
  });
});

// ---------------------------------------------------------------------------
// Empty state for dashboard
// ---------------------------------------------------------------------------

describe("Dashboard empty state (in App)", () => {
  // Note: testing the EmptyState is inline in App.tsx; we test via
  // the data-testid attribute if the component renders it.
  // Full integration tests are done via agent-browser.
  it("tilesToFirehoseEntries handles empty tiles gracefully", () => {
    expect(tilesToFirehoseEntries([])).toEqual([]);
  });

  it("tilesToFirehoseEntries handles tiles with empty thread arrays", () => {
    const tiles = [makeTile({ threads: [] })];
    expect(tilesToFirehoseEntries(tiles)).toEqual([]);
  });
});
