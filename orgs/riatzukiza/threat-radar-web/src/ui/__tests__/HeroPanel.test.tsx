import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroPanel, computeAgency, computeNuance, computeCritical } from "../components/HeroPanel";
import type { RadarTile } from "../../api/types";

// ---------------------------------------------------------------------------
// Helpers — build minimal RadarTile fixtures
// ---------------------------------------------------------------------------

function makeTile(overrides: Partial<RadarTile> = {}): RadarTile {
  return {
    radar: { id: "r1", slug: "test", name: "Test Radar", category: "geopolitical", status: "active" },
    sourceCount: 2,
    submissionCount: 5,
    liveSnapshot: {
      as_of_utc: new Date().toISOString(),
      disagreement_index: 0.3,
      quality_score: 0.7,
      signals: {
        geopolitical: { median: 2.5, range: [1.0, 4.0] as [number, number], agreement: 0.6, sample_size: 3 },
        infrastructure: { median: 1.8, range: [1.0, 2.5] as [number, number], agreement: 0.8, sample_size: 2 },
      },
      branches: [],
      model_count: 2,
    },
    ...overrides,
  };
}

function makeTileWithSnapshot(
  disagreement: number,
  medians: number[],
  ranges: [number, number][],
): RadarTile {
  const signals: RadarTile["liveSnapshot"] extends undefined ? never : NonNullable<RadarTile["liveSnapshot"]>["signals"] = {};
  const dims = ["geopolitical", "infrastructure", "economic", "security"];
  for (let i = 0; i < medians.length; i++) {
    signals[dims[i]] = {
      median: medians[i],
      range: ranges[i],
      agreement: 1 - disagreement,
      sample_size: 3,
    };
  }
  return makeTile({
    liveSnapshot: {
      as_of_utc: new Date().toISOString(),
      disagreement_index: disagreement,
      quality_score: 0.8,
      signals,
      branches: [],
      model_count: 2,
    },
  });
}

// ---------------------------------------------------------------------------
// Computation function tests
// ---------------------------------------------------------------------------

describe("HeroPanel computation functions", () => {
  describe("computeAgency", () => {
    it("returns 0 when no tiles are provided", () => {
      expect(computeAgency([])).toBe(0);
    });

    it("returns 0 when tiles have no snapshots", () => {
      const tile = makeTile({ liveSnapshot: undefined });
      expect(computeAgency([tile])).toBe(0);
    });

    it("returns a value between 0 and 100 for tiles with data", () => {
      const tile = makeTile();
      const result = computeAgency([tile]);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it("produces higher agency for higher quality + agreement", () => {
      const lowQ = makeTileWithSnapshot(0.8, [1.0], [[0.5, 3.5]]);
      const highQ = makeTileWithSnapshot(0.1, [3.0], [[2.5, 3.5]]);
      expect(computeAgency([highQ])).toBeGreaterThan(computeAgency([lowQ]));
    });
  });

  describe("computeNuance", () => {
    it("returns 0 when no tiles are provided", () => {
      expect(computeNuance([])).toBe(0);
    });

    it("returns 0 when tiles have no snapshots", () => {
      const tile = makeTile({ liveSnapshot: undefined });
      expect(computeNuance([tile])).toBe(0);
    });

    it("returns a value between 0 and 100 for tiles with data", () => {
      const tile = makeTile();
      const result = computeNuance([tile]);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it("produces higher nuance for higher disagreement", () => {
      const lowD = makeTileWithSnapshot(0.1, [2.0], [[1.5, 2.5]]);
      const highD = makeTileWithSnapshot(0.9, [2.0], [[0.5, 3.5]]);
      expect(computeNuance([highD])).toBeGreaterThan(computeNuance([lowD]));
    });
  });

  describe("computeCritical", () => {
    it("returns 0 when no tiles are provided", () => {
      expect(computeCritical([])).toBe(0);
    });

    it("returns 0 when tiles have no snapshots", () => {
      const tile = makeTile({ liveSnapshot: undefined });
      expect(computeCritical([tile])).toBe(0);
    });

    it("returns a value between 0 and 100 for tiles with data", () => {
      const tile = makeTile();
      const result = computeCritical([tile]);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it("produces higher critical for higher median signal values", () => {
      const low = makeTileWithSnapshot(0.3, [0.5], [[0.2, 0.8]]);
      const high = makeTileWithSnapshot(0.3, [3.5], [[3.0, 4.0]]);
      expect(computeCritical([high])).toBeGreaterThan(computeCritical([low]));
    });
  });
});

// ---------------------------------------------------------------------------
// Component rendering tests
// ---------------------------------------------------------------------------

describe("HeroPanel", () => {
  it("renders without crashing with no tiles", () => {
    render(<HeroPanel tiles={[]} />);
    const panel = screen.getByTestId("hero-panel");
    expect(panel).toBeInTheDocument();
  });

  it("renders 3 gauges: Agency, Nuance, Critical", () => {
    render(<HeroPanel tiles={[]} />);
    expect(screen.getByText("Agency")).toBeInTheDocument();
    expect(screen.getByText("Nuance")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("renders 3 RiskGauge elements", () => {
    render(<HeroPanel tiles={[]} />);
    const gauges = screen.getAllByTestId("risk-gauge");
    expect(gauges).toHaveLength(3);
  });

  it("shows placeholder values (0) when no data", () => {
    render(<HeroPanel tiles={[]} />);
    const values = screen.getAllByTestId("gauge-value");
    expect(values).toHaveLength(3);
    for (const v of values) {
      expect(v.textContent).toContain("0");
    }
  });

  it("shows non-zero values when tiles have snapshots", () => {
    const tile = makeTile();
    render(<HeroPanel tiles={[tile]} />);
    const values = screen.getAllByTestId("gauge-value");
    // At least one gauge should have a non-zero value
    const hasNonZero = values.some((v) => !v.textContent?.startsWith("0"));
    expect(hasNonZero).toBe(true);
  });

  it("aggregates data across multiple tiles", () => {
    const t1 = makeTileWithSnapshot(0.2, [2.0, 1.5], [[1.0, 3.0], [1.0, 2.0]]);
    const t2 = makeTileWithSnapshot(0.4, [3.0, 2.5], [[2.0, 4.0], [2.0, 3.0]]);
    render(<HeroPanel tiles={[t1, t2]} />);
    const gauges = screen.getAllByTestId("risk-gauge");
    expect(gauges).toHaveLength(3);
  });

  it("applies custom className when provided", () => {
    render(<HeroPanel tiles={[]} className="custom-hero" />);
    const panel = screen.getByTestId("hero-panel");
    expect(panel.className).toContain("custom-hero");
  });
});
