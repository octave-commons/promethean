import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EtaLaneContent } from "../components/EtaLane";
import { EtaThreadCard } from "../components/EtaThreadCard";
import { SourceBadge } from "../components/SourceBadge";
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
    summary: "Multiple signals indicate infrastructure stress in key energy corridors",
    members: [
      { signal_event_id: "sig-1", relevance: 0.9, added_at: "2024-01-01T00:00:00Z" },
      { signal_event_id: "sig-2", relevance: 0.8, added_at: "2024-01-01T01:00:00Z" },
      { signal_event_id: "sig-3", relevance: 0.7, added_at: "2024-01-01T02:00:00Z" },
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

function makeRadarTile(overrides: Partial<RadarTile> = {}): RadarTile {
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
      quality_score: 72,
      signals: {
        geopolitical_tension: { median: 2.5, range: [1, 4] as [number, number], agreement: 0.7, sample_size: 5 },
        infrastructure_stress: { median: 1.8, range: [1, 3] as [number, number], agreement: 0.8, sample_size: 3 },
      },
      branches: [
        { name: "escalation", support: "moderate", agreement: 0.6, triggers: ["conflict expansion"] },
        { name: "de-escalation", support: "low", agreement: 0.4, triggers: ["diplomatic talks"] },
      ],
      model_count: 2,
      render_state: {
        deterministicSnapshot: {
          scoreRanges: [
            { dimension: "geopolitical", min: 0.3, max: 0.8, median: 0.55 },
            { dimension: "infrastructure", min: 0.2, max: 0.6, median: 0.4 },
            { dimension: "economic", min: 0.1, max: 0.5, median: 0.3 },
          ],
          disagreementIndex: 0.3,
          narrativeBranches: [
            {
              label: "geopolitical escalation",
              probability: 0.55,
              evidence: ["Tension in key corridor", "Military posturing"],
              realism: 65, fear: 70, public_benefit: 20, actionability: 30,
              polarization_risk: 45, compression_loss: 35,
            },
            {
              label: "economic adaptation",
              probability: 0.45,
              evidence: ["Market diversification", "Alternative routes"],
              realism: 75, fear: 30, public_benefit: 60, actionability: 55,
              polarization_risk: 20, compression_loss: 25,
            },
          ],
          compressionLoss: 0.4,
        },
      },
    },
    threads: [makeThread()],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SourceBadge", () => {
  it("renders a bluesky badge with label and icon", () => {
    render(<SourceBadge source="bluesky" />);
    const badge = screen.getByTestId("source-badge-bluesky");
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain("Bluesky");
  });

  it("renders a reddit badge with count", () => {
    render(<SourceBadge source="reddit" count={5} />);
    const badge = screen.getByTestId("source-badge-reddit");
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain("Reddit");
    expect(badge.textContent).toContain("5");
  });

  it("renders a generic badge for unknown sources", () => {
    render(<SourceBadge source="rss" />);
    const badge = screen.getByTestId("source-badge-rss");
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain("Rss");
  });
});

describe("EtaThreadCard", () => {
  it("renders thread title", () => {
    const thread = makeThread();
    render(<EtaThreadCard thread={thread} />);
    expect(screen.getByText("Global Energy Disruption")).toBeDefined();
  });

  it("renders thread summary", () => {
    const thread = makeThread();
    render(<EtaThreadCard thread={thread} />);
    expect(screen.getByText(/infrastructure stress/i)).toBeDefined();
  });

  it("shows signal count", () => {
    const thread = makeThread();
    render(<EtaThreadCard thread={thread} />);
    const countEl = screen.getByTestId("thread-signal-count");
    expect(countEl.textContent).toContain("3 signals");
  });

  it("shows last updated time", () => {
    const thread = makeThread();
    render(<EtaThreadCard thread={thread} />);
    const updatedEl = screen.getByTestId("thread-last-updated");
    expect(updatedEl.textContent).toBeTruthy();
  });

  it("shows uncertainty label", () => {
    const thread = makeThread({ confidence: 0.65 });
    render(<EtaThreadCard thread={thread} />);
    const uncertaintyEl = screen.getByTestId("thread-uncertainty");
    expect(uncertaintyEl.textContent).toContain("moderate uncertainty");
  });

  it("shows low uncertainty for high confidence", () => {
    const thread = makeThread({ confidence: 0.85 });
    render(<EtaThreadCard thread={thread} />);
    const uncertaintyEl = screen.getByTestId("thread-uncertainty");
    expect(uncertaintyEl.textContent).toContain("low uncertainty");
  });

  it("shows high uncertainty for low confidence", () => {
    const thread = makeThread({ confidence: 0.2 });
    render(<EtaThreadCard thread={thread} />);
    const uncertaintyEl = screen.getByTestId("thread-uncertainty");
    expect(uncertaintyEl.textContent).toContain("high uncertainty");
  });

  it("renders source badges for bluesky and reddit", () => {
    const thread = makeThread({ source_distribution: { bluesky: 0.6, reddit: 0.4 } });
    render(<EtaThreadCard thread={thread} />);
    expect(screen.getByTestId("source-badge-bluesky")).toBeDefined();
    expect(screen.getByTestId("source-badge-reddit")).toBeDefined();
  });

  it("renders gauge bars for domain tags", () => {
    const thread = makeThread({ domain_tags: ["geopolitical", "infrastructure"] });
    render(<EtaThreadCard thread={thread} />);
    const gaugeBars = screen.getAllByTestId("eta-gauge-bar");
    // 2 domain tags + 1 source diversity (2 sources)
    expect(gaugeBars.length).toBeGreaterThanOrEqual(2);
  });

  it("shows thread status badge", () => {
    const thread = makeThread({ status: "emerging" });
    render(<EtaThreadCard thread={thread} />);
    const status = screen.getByTestId("thread-status");
    expect(status.textContent).toBe("emerging");
  });
});

describe("EtaLaneContent", () => {
  it("renders empty state when no tiles", () => {
    render(<EtaLaneContent tiles={[]} />);
    expect(screen.getByText(/No global signals/i)).toBeDefined();
  });

  it("renders ThreatClock for a tile with snapshot", () => {
    const tile = makeRadarTile();
    render(<EtaLaneContent tiles={[tile]} />);
    expect(screen.getByTestId("threat-clock")).toBeDefined();
  });

  it("renders RiskGauges with score ranges from deterministic snapshot", () => {
    const tile = makeRadarTile();
    render(<EtaLaneContent tiles={[tile]} />);
    const rangeGauges = screen.getAllByTestId("eta-range-gauge");
    expect(rangeGauges.length).toBe(3); // geopolitical, infrastructure, economic
  });

  it("renders range indicators for each gauge", () => {
    const tile = makeRadarTile();
    render(<EtaLaneContent tiles={[tile]} />);
    const rangeIndicators = screen.getAllByTestId("eta-range-indicator");
    expect(rangeIndicators.length).toBe(3);
  });

  it("renders BranchMap when branches exist", () => {
    const tile = makeRadarTile();
    render(<EtaLaneContent tiles={[tile]} />);
    expect(screen.getByTestId("branch-map")).toBeDefined();
  });

  it("renders thread cards", () => {
    const tile = makeRadarTile();
    render(<EtaLaneContent tiles={[tile]} />);
    const threadCards = screen.getAllByTestId("eta-thread-card");
    expect(threadCards.length).toBe(1);
  });

  it("shows radar name", () => {
    const tile = makeRadarTile();
    render(<EtaLaneContent tiles={[tile]} />);
    // Radar name appears in header h3 and also as BranchMap root label
    const matches = screen.getAllByText("Energy Stress Monitor");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows narrative branches section title", () => {
    const tile = makeRadarTile();
    render(<EtaLaneContent tiles={[tile]} />);
    expect(screen.getByText("Narrative Branches")).toBeDefined();
  });

  it("renders multiple tiles", () => {
    const tile1 = makeRadarTile();
    const tile2 = makeRadarTile({
      radar: { id: "radar-2", slug: "infra-watch", name: "Infrastructure Watch", category: "infrastructure", status: "active" },
      threads: [makeThread({ id: "thread-2", title: "Supply Chain Disruption" })],
    });
    render(<EtaLaneContent tiles={[tile1, tile2]} />);
    const sections = screen.getAllByTestId("eta-radar-section");
    expect(sections.length).toBe(2);
  });

  it("falls back to signal gauges when no deterministic snapshot", () => {
    const tile = makeRadarTile({
      liveSnapshot: {
        as_of_utc: "2024-01-01T12:00:00Z",
        disagreement_index: 0.2,
        quality_score: 60,
        signals: {
          tension: { median: 2, range: [1, 3] as [number, number], agreement: 0.7, sample_size: 3 },
          stability: { median: 1, range: [0, 2] as [number, number], agreement: 0.8, sample_size: 2 },
        },
        branches: [],
        model_count: 1,
      },
      threads: [makeThread()],
    });
    render(<EtaLaneContent tiles={[tile]} />);
    const rangeGauges = screen.getAllByTestId("eta-range-gauge");
    expect(rangeGauges.length).toBe(2); // tension, stability
  });
});
