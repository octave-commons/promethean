import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

describe("LoadingSkeleton", () => {
  it("renders without crashing", () => {
    render(<LoadingSkeleton />);
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  it("has role=status for accessibility", () => {
    render(<LoadingSkeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders default 3 skeleton cards", () => {
    const { container } = render(<LoadingSkeleton />);
    const cards = container.querySelectorAll(".skeleton-card");
    expect(cards).toHaveLength(3);
  });

  it("renders custom count of skeleton cards", () => {
    const { container } = render(<LoadingSkeleton count={5} />);
    const cards = container.querySelectorAll(".skeleton-card");
    expect(cards).toHaveLength(5);
  });

  it("shows loading text", () => {
    render(<LoadingSkeleton />);
    expect(screen.getByText("Loading radar data…")).toBeInTheDocument();
  });

  it("contains animated spinner SVG", () => {
    const { container } = render(<LoadingSkeleton />);
    const spinner = container.querySelector(".loading-spinner");
    expect(spinner).toBeInTheDocument();
  });
});
