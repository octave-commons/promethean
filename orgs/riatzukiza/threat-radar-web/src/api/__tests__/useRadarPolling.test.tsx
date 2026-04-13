import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRadarPolling, POLL_INTERVAL_MS } from "../useRadarPolling";
import * as clientModule from "../client";

const MOCK_API_URL = "http://localhost:9001";

const MOCK_TILES = [
  {
    radar: { id: "r1", slug: "test", name: "Test Radar", category: "geopolitical", status: "active" },
    sourceCount: 3,
    submissionCount: 1,
    liveSnapshot: undefined,
  },
];

/** Flush microtask queue so resolved/rejected promises propagate through React state */
async function flushPromises(): Promise<void> {
  await act(async () => {
    await new Promise<void>((resolve) => {
      // Use queueMicrotask to ensure all pending microtasks are flushed
      queueMicrotask(resolve);
    });
  });
}

describe("useRadarPolling", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in loading state", () => {
    vi.spyOn(clientModule, "fetchRadars").mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useRadarPolling(MOCK_API_URL));
    expect(result.current.loading).toBe(true);
    expect(result.current.tiles).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isStale).toBe(false);
  });

  it("loads tiles and sets loading=false on success", async () => {
    vi.spyOn(clientModule, "fetchRadars").mockResolvedValue(MOCK_TILES);
    const { result } = renderHook(() => useRadarPolling(MOCK_API_URL));

    await flushPromises();

    expect(result.current.loading).toBe(false);
    expect(result.current.tiles).toEqual(MOCK_TILES);
    expect(result.current.error).toBeNull();
    expect(result.current.isStale).toBe(false);
    expect(result.current.lastUpdated).toBeTruthy();
  });

  it("sets error on initial fetch failure", async () => {
    vi.spyOn(clientModule, "fetchRadars").mockRejectedValue(
      new clientModule.ApiError("Unable to reach the radar API"),
    );
    const { result } = renderHook(() => useRadarPolling(MOCK_API_URL));

    await flushPromises();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Unable to reach the radar API");
    expect(result.current.tiles).toEqual([]);
    expect(result.current.isStale).toBe(false); // no previous data = not stale
  });

  it("preserves previous data as stale when error occurs after successful load", async () => {
    const fetchSpy = vi.spyOn(clientModule, "fetchRadars")
      .mockResolvedValueOnce(MOCK_TILES);

    const { result } = renderHook(() => useRadarPolling(MOCK_API_URL));

    // Wait for initial successful load
    await flushPromises();
    expect(result.current.tiles).toEqual(MOCK_TILES);
    expect(result.current.loading).toBe(false);

    // Make the next fetch fail
    fetchSpy.mockRejectedValueOnce(
      new clientModule.ApiError("Unable to reach the radar API"),
    );

    // Advance timer to trigger polling
    await act(async () => {
      vi.advanceTimersByTime(POLL_INTERVAL_MS);
    });
    await flushPromises();

    // Data should still be present but marked stale
    expect(result.current.tiles).toEqual(MOCK_TILES);
    expect(result.current.isStale).toBe(true);
    expect(result.current.error).toBe("Unable to reach the radar API");
  });

  it("polls at 12-second intervals", async () => {
    const fetchSpy = vi.spyOn(clientModule, "fetchRadars").mockResolvedValue(MOCK_TILES);
    renderHook(() => useRadarPolling(MOCK_API_URL));

    // Initial call
    await flushPromises();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Advance to first poll
    await act(async () => {
      vi.advanceTimersByTime(POLL_INTERVAL_MS);
    });
    await flushPromises();
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // Advance to second poll
    await act(async () => {
      vi.advanceTimersByTime(POLL_INTERVAL_MS);
    });
    await flushPromises();
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("cleans up interval on unmount", async () => {
    const fetchSpy = vi.spyOn(clientModule, "fetchRadars").mockResolvedValue(MOCK_TILES);
    const { unmount } = renderHook(() => useRadarPolling(MOCK_API_URL));

    await flushPromises();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    unmount();

    // Advancing timers after unmount should NOT trigger more fetches
    await act(async () => {
      vi.advanceTimersByTime(POLL_INTERVAL_MS * 3);
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("recovers from error when next poll succeeds", async () => {
    const fetchSpy = vi.spyOn(clientModule, "fetchRadars")
      .mockRejectedValueOnce(new clientModule.ApiError("Unable to reach the radar API"));

    const { result } = renderHook(() => useRadarPolling(MOCK_API_URL));

    // Wait for initial failure
    await flushPromises();
    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBe(false);

    // Next poll succeeds
    fetchSpy.mockResolvedValueOnce(MOCK_TILES);

    await act(async () => {
      vi.advanceTimersByTime(POLL_INTERVAL_MS);
    });
    await flushPromises();

    expect(result.current.error).toBeNull();
    expect(result.current.tiles).toEqual(MOCK_TILES);
    expect(result.current.isStale).toBe(false);
  });

  it("exports POLL_INTERVAL_MS as 12000", () => {
    expect(POLL_INTERVAL_MS).toBe(12_000);
  });
});
