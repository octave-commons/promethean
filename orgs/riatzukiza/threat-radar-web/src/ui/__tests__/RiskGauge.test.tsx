import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskGauge } from "../components/RiskGauge";

describe("RiskGauge", () => {
  it("renders without crashing with required props", () => {
    render(<RiskGauge value={50} label="Test Gauge" />);
    const gauge = screen.getByTestId("risk-gauge");
    expect(gauge).toBeInTheDocument();
  });

  it("displays the current value", () => {
    render(<RiskGauge value={72} label="Geopolitical Stress" />);
    const valueEl = screen.getByTestId("gauge-value");
    expect(valueEl.textContent).toContain("72");
  });

  it("displays the label text", () => {
    render(<RiskGauge value={50} label="Infrastructure Risk" />);
    const labelEl = screen.getByTestId("gauge-label");
    expect(labelEl.textContent).toBe("Infrastructure Risk");
  });

  it("renders the needle element", () => {
    render(<RiskGauge value={30} label="Test" />);
    const needle = screen.getByTestId("gauge-needle");
    expect(needle).toBeInTheDocument();
    expect(needle.tagName.toLowerCase()).toBe("line");
  });

  it("renders the gradient fill arc", () => {
    render(<RiskGauge value={60} label="Test" />);
    const fill = screen.getByTestId("gauge-fill");
    expect(fill).toBeInTheDocument();
    expect(fill.tagName.toLowerCase()).toBe("path");
  });

  it("clamps value to min/max range", () => {
    render(<RiskGauge value={150} max={100} label="Clamped" />);
    const valueEl = screen.getByTestId("gauge-value");
    // Should display 100 (clamped), not 150
    expect(valueEl.textContent).toContain("100");
  });

  it("handles custom min/max range", () => {
    render(<RiskGauge value={5} min={0} max={10} label="Custom Range" />);
    const valueEl = screen.getByTestId("gauge-value");
    expect(valueEl.textContent).toContain("5");
  });

  it("renders unit string when provided", () => {
    render(<RiskGauge value={42} label="Score" unit="%" />);
    const valueEl = screen.getByTestId("gauge-value");
    expect(valueEl.textContent).toContain("%");
  });

  it("sets correct aria-label for accessibility", () => {
    render(<RiskGauge value={65} label="Economic" unit="pts" />);
    const svg = screen.getByRole("img");
    expect(svg.getAttribute("aria-label")).toBe("Economic: 65 pts");
  });
});
