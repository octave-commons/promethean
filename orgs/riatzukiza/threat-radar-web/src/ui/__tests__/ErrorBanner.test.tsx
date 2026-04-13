import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBanner } from "../components/ErrorBanner";

describe("ErrorBanner", () => {
  it("renders error message", () => {
    render(<ErrorBanner message="Unable to reach the radar API" isStale={false} lastUpdated={null} />);
    expect(screen.getByText("Unable to reach the radar API")).toBeInTheDocument();
    expect(screen.getByTestId("error-banner")).toBeInTheDocument();
  });

  it("has role=alert for accessibility", () => {
    render(<ErrorBanner message="Connection error" isStale={false} lastUpdated={null} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show stale indicator when isStale is false", () => {
    render(<ErrorBanner message="Error" isStale={false} lastUpdated={null} />);
    expect(screen.queryByTestId("stale-indicator")).not.toBeInTheDocument();
  });

  it("shows stale indicator when isStale is true", () => {
    render(<ErrorBanner message="Error" isStale={true} lastUpdated={null} />);
    expect(screen.getByTestId("stale-indicator")).toBeInTheDocument();
    expect(screen.getByText(/Showing stale data/)).toBeInTheDocument();
  });

  it("shows formatted timestamp in stale indicator", () => {
    const recent = new Date(Date.now() - 30_000).toISOString(); // 30 seconds ago
    render(<ErrorBanner message="Error" isStale={true} lastUpdated={recent} />);
    expect(screen.getByText(/Showing stale data from \d+s ago/)).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Error" isStale={false} lastUpdated={null} onRetry={onRetry} />);
    const btn = screen.getByText("Retry");
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorBanner message="Error" isStale={false} lastUpdated={null} />);
    expect(screen.queryByText("Retry")).not.toBeInTheDocument();
  });
});
