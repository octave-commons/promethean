import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PersonalizationPanel } from "../components/PersonalizationPanel";
import type { PersonalizationPanelProps } from "../components/PersonalizationPanel";
import {
  usePersonalization,
  defaultWeights,
  defaultToggles,
  applyWeights,
  computeCompositeScore,
  DIMENSIONS,
} from "../hooks/usePersonalization";
import type {
  DimensionWeights,
  PersonalizationToggles,
} from "../hooks/usePersonalization";
import { renderHook, act } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Helper to create default props
// ---------------------------------------------------------------------------

function makeProps(overrides: Partial<PersonalizationPanelProps> = {}): PersonalizationPanelProps {
  return {
    weights: defaultWeights(),
    toggles: defaultToggles(),
    onWeightChange: vi.fn(),
    onToggleChange: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// PersonalizationPanel component tests
// ---------------------------------------------------------------------------

describe("PersonalizationPanel", () => {
  it("renders without crashing", () => {
    render(<PersonalizationPanel {...makeProps()} />);
    expect(screen.getByTestId("personalization-panel")).toBeInTheDocument();
  });

  it("starts collapsed by default", () => {
    render(<PersonalizationPanel {...makeProps()} />);
    expect(screen.queryByTestId("pz-panel-body")).not.toBeInTheDocument();
  });

  it("expands on toggle click", () => {
    render(<PersonalizationPanel {...makeProps()} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    expect(screen.getByTestId("pz-panel-body")).toBeInTheDocument();
  });

  it("collapses on second toggle click", () => {
    render(<PersonalizationPanel {...makeProps()} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    expect(screen.getByTestId("pz-panel-body")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    expect(screen.queryByTestId("pz-panel-body")).not.toBeInTheDocument();
  });

  it("renders all 6 dimension sliders when expanded", () => {
    render(<PersonalizationPanel {...makeProps()} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    for (const dim of DIMENSIONS) {
      expect(screen.getByTestId(`pz-slider-${dim}`)).toBeInTheDocument();
    }
  });

  it("sliders show default value of 50", () => {
    render(<PersonalizationPanel {...makeProps()} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    for (const dim of DIMENSIONS) {
      expect(screen.getByTestId(`pz-slider-value-${dim}`).textContent).toBe("50");
    }
  });

  it("slider change calls onWeightChange with dimension and value", () => {
    const onWeightChange = vi.fn();
    render(<PersonalizationPanel {...makeProps({ onWeightChange })} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));

    const slider = screen.getByTestId("pz-slider-input-geopolitical");
    fireEvent.change(slider, { target: { value: "75" } });
    expect(onWeightChange).toHaveBeenCalledWith("geopolitical", 75);
  });

  it("renders all 3 toggle switches when expanded", () => {
    render(<PersonalizationPanel {...makeProps()} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    expect(screen.getByTestId("pz-toggle-agencyBias")).toBeInTheDocument();
    expect(screen.getByTestId("pz-toggle-criticalThinking")).toBeInTheDocument();
    expect(screen.getByTestId("pz-toggle-federation")).toBeInTheDocument();
  });

  it("toggle switches reflect current state", () => {
    const toggles: PersonalizationToggles = {
      agencyBias: true,
      criticalThinking: false,
      federation: true,
    };
    render(<PersonalizationPanel {...makeProps({ toggles })} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));

    expect(screen.getByTestId("pz-toggle-switch-agencyBias").getAttribute("aria-checked")).toBe("true");
    expect(screen.getByTestId("pz-toggle-switch-criticalThinking").getAttribute("aria-checked")).toBe("false");
    expect(screen.getByTestId("pz-toggle-switch-federation").getAttribute("aria-checked")).toBe("true");
  });

  it("toggle click calls onToggleChange with key and inverted value", () => {
    const onToggleChange = vi.fn();
    const toggles: PersonalizationToggles = {
      agencyBias: false,
      criticalThinking: false,
      federation: true,
    };
    render(<PersonalizationPanel {...makeProps({ onToggleChange, toggles })} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));

    fireEvent.click(screen.getByTestId("pz-toggle-switch-agencyBias"));
    expect(onToggleChange).toHaveBeenCalledWith("agencyBias", true);

    fireEvent.click(screen.getByTestId("pz-toggle-switch-federation"));
    expect(onToggleChange).toHaveBeenCalledWith("federation", false);
  });

  it("reset button calls onReset", () => {
    const onReset = vi.fn();
    render(<PersonalizationPanel {...makeProps({ onReset })} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    fireEvent.click(screen.getByTestId("pz-reset-btn"));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("displays custom weight values", () => {
    const weights: DimensionWeights = {
      ...defaultWeights(),
      geopolitical: 80,
      economic: 20,
    };
    render(<PersonalizationPanel {...makeProps({ weights })} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    expect(screen.getByTestId("pz-slider-value-geopolitical").textContent).toBe("80");
    expect(screen.getByTestId("pz-slider-value-economic").textContent).toBe("20");
  });

  it("sliders have range 0-100", () => {
    render(<PersonalizationPanel {...makeProps()} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    const slider = screen.getByTestId("pz-slider-input-geopolitical") as HTMLInputElement;
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("100");
  });

  it("toggle switches have role=switch", () => {
    render(<PersonalizationPanel {...makeProps()} />);
    fireEvent.click(screen.getByTestId("pz-panel-toggle"));
    const toggleEl = screen.getByTestId("pz-toggle-switch-agencyBias");
    expect(toggleEl.getAttribute("role")).toBe("switch");
  });
});

// ---------------------------------------------------------------------------
// usePersonalization hook tests
// ---------------------------------------------------------------------------

describe("usePersonalization", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default weights (all 50)", () => {
    const { result } = renderHook(() => usePersonalization());
    for (const dim of DIMENSIONS) {
      expect(result.current.weights[dim]).toBe(50);
    }
  });

  it("returns default toggles", () => {
    const { result } = renderHook(() => usePersonalization());
    expect(result.current.toggles.agencyBias).toBe(false);
    expect(result.current.toggles.criticalThinking).toBe(false);
    expect(result.current.toggles.federation).toBe(true);
  });

  it("setWeight updates a dimension weight", () => {
    const { result } = renderHook(() => usePersonalization());
    act(() => {
      result.current.setWeight("geopolitical", 80);
    });
    expect(result.current.weights.geopolitical).toBe(80);
  });

  it("setWeight clamps to 0-100", () => {
    const { result } = renderHook(() => usePersonalization());
    act(() => {
      result.current.setWeight("economic", 150);
    });
    expect(result.current.weights.economic).toBe(100);

    act(() => {
      result.current.setWeight("economic", -10);
    });
    expect(result.current.weights.economic).toBe(0);
  });

  it("setToggle updates toggle state", () => {
    const { result } = renderHook(() => usePersonalization());
    act(() => {
      result.current.setToggle("agencyBias", true);
    });
    expect(result.current.toggles.agencyBias).toBe(true);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => usePersonalization());
    act(() => {
      result.current.setWeight("security", 90);
      result.current.setToggle("criticalThinking", true);
    });

    const stored = JSON.parse(localStorage.getItem("threat-radar-personalization") ?? "{}");
    expect(stored.weights.security).toBe(90);
    expect(stored.toggles.criticalThinking).toBe(true);
  });

  it("restores from localStorage on mount", () => {
    localStorage.setItem(
      "threat-radar-personalization",
      JSON.stringify({
        weights: { ...defaultWeights(), geopolitical: 25 },
        toggles: { agencyBias: true, criticalThinking: false, federation: false },
      }),
    );

    const { result } = renderHook(() => usePersonalization());
    expect(result.current.weights.geopolitical).toBe(25);
    expect(result.current.toggles.agencyBias).toBe(true);
    expect(result.current.toggles.federation).toBe(false);
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem("threat-radar-personalization", "not-valid-json!!!");
    const { result } = renderHook(() => usePersonalization());
    // Should fall back to defaults
    expect(result.current.weights.geopolitical).toBe(50);
    expect(result.current.toggles.federation).toBe(true);
  });

  it("resetToDefaults restores all values", () => {
    const { result } = renderHook(() => usePersonalization());
    act(() => {
      result.current.setWeight("geopolitical", 10);
      result.current.setToggle("agencyBias", true);
    });
    expect(result.current.weights.geopolitical).toBe(10);
    expect(result.current.toggles.agencyBias).toBe(true);

    act(() => {
      result.current.resetToDefaults();
    });
    expect(result.current.weights.geopolitical).toBe(50);
    expect(result.current.toggles.agencyBias).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Weight application utility tests
// ---------------------------------------------------------------------------

describe("applyWeights", () => {
  it("returns original values when all weights are 50 (neutral)", () => {
    const ranges = [
      { dimension: "geopolitical", median: 0.5, min: 0.3, max: 0.7 },
      { dimension: "economic", median: 0.8, min: 0.6, max: 1.0 },
    ];
    const result = applyWeights(ranges, defaultWeights());
    expect(result[0].weighted).toBeCloseTo(50);
    expect(result[1].weighted).toBeCloseTo(80);
  });

  it("amplifies values when weight is 100", () => {
    const ranges = [{ dimension: "geopolitical", median: 0.5, min: 0.3, max: 0.7 }];
    const weights = { ...defaultWeights(), geopolitical: 100 };
    const result = applyWeights(ranges, weights);
    // factor = 100/50 = 2, so 50 * 2 = 100
    expect(result[0].weighted).toBeCloseTo(100);
  });

  it("reduces values when weight is 0", () => {
    const ranges = [{ dimension: "geopolitical", median: 0.5, min: 0.3, max: 0.7 }];
    const weights = { ...defaultWeights(), geopolitical: 0 };
    const result = applyWeights(ranges, weights);
    expect(result[0].weighted).toBe(0);
  });

  it("clamps weighted values to 0-100", () => {
    const ranges = [{ dimension: "geopolitical", median: 0.9, min: 0.8, max: 1.0 }];
    const weights = { ...defaultWeights(), geopolitical: 100 };
    const result = applyWeights(ranges, weights);
    expect(result[0].weighted).toBeLessThanOrEqual(100);
    expect(result[0].weighted).toBeGreaterThanOrEqual(0);
  });
});

describe("computeCompositeScore", () => {
  it("returns 0 for empty input", () => {
    expect(computeCompositeScore([], defaultWeights())).toBe(0);
  });

  it("computes weighted average from score ranges", () => {
    const ranges = [
      { dimension: "geopolitical", median: 0.5, min: 0.3, max: 0.7 },
      { dimension: "economic", median: 0.5, min: 0.3, max: 0.7 },
    ];
    const result = computeCompositeScore(ranges, defaultWeights());
    expect(result).toBeGreaterThan(0);
  });

  it("returns different scores for different weights", () => {
    const ranges = [
      { dimension: "geopolitical", median: 0.8, min: 0.6, max: 1.0 },
      { dimension: "economic", median: 0.2, min: 0.1, max: 0.3 },
    ];
    const heavyGeo = { ...defaultWeights(), geopolitical: 100, economic: 10 };
    const heavyEcon = { ...defaultWeights(), geopolitical: 10, economic: 100 };
    const scoreGeo = computeCompositeScore(ranges, heavyGeo);
    const scoreEcon = computeCompositeScore(ranges, heavyEcon);
    expect(scoreGeo).toBeGreaterThan(scoreEcon);
  });
});
