import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThreatClock } from "../components/ThreatClock";
import type { ThreatClockSignal } from "../components/ThreatClock";

describe("ThreatClock", () => {
  it("renders without crashing with minimal props", () => {
    render(<ThreatClock value={2.5} />);
    const clock = screen.getByTestId("threat-clock");
    expect(clock).toBeInTheDocument();
  });

  it("displays the current threat-level value", () => {
    render(<ThreatClock value={3.2} max={4} />);
    const valueEl = screen.getByTestId("clock-value");
    expect(valueEl.textContent).toBe("3.2");
  });

  it("renders the sweep hand element", () => {
    render(<ThreatClock value={1} />);
    const hand = screen.getByTestId("clock-hand");
    expect(hand).toBeInTheDocument();
    expect(hand.tagName.toLowerCase()).toBe("line");
  });

  it("renders risk-level sector arcs", () => {
    render(<ThreatClock value={2} max={4} />);
    // Should have 4 sectors for max=4
    for (let i = 0; i < 4; i++) {
      expect(screen.getByTestId(`clock-sector-${i}`)).toBeInTheDocument();
    }
  });

  it("renders disagreement halo with opacity driven by index", () => {
    const { rerender } = render(<ThreatClock value={2} disagreementIndex={0} />);
    const haloLow = screen.getByTestId("disagreement-halo");
    const lowStroke = haloLow.getAttribute("stroke") ?? "";
    // opacity at 0 disagreement = 0.08
    expect(lowStroke).toContain("0.08");

    rerender(<ThreatClock value={2} disagreementIndex={1} />);
    const haloHigh = screen.getByTestId("disagreement-halo");
    const highStroke = haloHigh.getAttribute("stroke") ?? "";
    // opacity at 1 disagreement = 0.08 + 0.4 = 0.48
    expect(highStroke).toContain("0.48");
  });

  it("renders signal arcs when signals are provided", () => {
    const signals: ThreatClockSignal[] = [
      { median: 1.5, range: [1, 2], agreement: 0.8, label: "geopolitical" },
      { median: 3.0, range: [2.5, 3.5], agreement: 0.6, label: "infrastructure" },
    ];
    render(<ThreatClock value={2} signals={signals} />);
    const clock = screen.getByTestId("threat-clock");
    // Should have path elements for signal arcs
    const paths = clock.querySelectorAll("path");
    // 4 sector arcs + 2 signal arcs = 6 paths minimum
    expect(paths.length).toBeGreaterThanOrEqual(6);
  });

  it("sets correct aria-label for accessibility", () => {
    render(<ThreatClock value={1.7} max={4} />);
    const clock = screen.getByTestId("threat-clock");
    expect(clock.getAttribute("aria-label")).toBe("Threat clock showing level 1.7 out of 4");
  });

  it("respects custom size prop", () => {
    render(<ThreatClock value={2} size={300} />);
    const clock = screen.getByTestId("threat-clock");
    expect(clock.getAttribute("viewBox")).toBe("0 0 300 300");
    expect(clock.getAttribute("width")).toBe("300");
  });
});
