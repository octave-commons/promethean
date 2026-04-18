/**
 * Custom hook for polling radar data with graceful error handling.
 *
 * - Fetches from /api/radars on mount
 * - Re-fetches every POLL_INTERVAL_MS (12 000 ms)
 * - On error: preserves previously loaded data and sets isStale=true
 * - Cleans up the interval on unmount (no memory leaks)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, fetchRadars } from "./client";
import type { RadarTile } from "./types";

export const POLL_INTERVAL_MS = 12_000;

export type PollingState = {
  /** Current radar data (may be stale if isStale is true) */
  tiles: RadarTile[];
  /** True only during the very first load before any data arrives */
  loading: boolean;
  /** Human-readable error message, or null when healthy */
  error: string | null;
  /** True when an error occurred but previously loaded data is still shown */
  isStale: boolean;
  /** ISO timestamp of the last successful fetch, or null if never fetched */
  lastUpdated: string | null;
  /** Trigger an immediate refetch */
  refetch: () => void;
};

export function useRadarPolling(apiUrl: string): PollingState {
  const [tiles, setTiles] = useState<RadarTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Track whether we've ever successfully loaded data
  const hasLoadedRef = useRef(false);
  // Track whether the component is still mounted
  const activeRef = useRef(true);

  const doFetch = useCallback(async () => {
    try {
      const data = await fetchRadars(apiUrl);
      if (!activeRef.current) return;
      setTiles(data);
      setError(null);
      setIsStale(false);
      setLastUpdated(new Date().toISOString());
      hasLoadedRef.current = true;
    } catch (err: unknown) {
      if (!activeRef.current) return;
      const message =
        err instanceof ApiError ? err.message : "An unexpected error occurred";
      setError(message);
      // If we previously had data, mark it as stale instead of clearing
      if (hasLoadedRef.current) {
        setIsStale(true);
      }
    } finally {
      if (activeRef.current) {
        setLoading(false);
      }
    }
  }, [apiUrl]);

  useEffect(() => {
    activeRef.current = true;
    void doFetch();
    const interval = window.setInterval(() => void doFetch(), POLL_INTERVAL_MS);
    return () => {
      activeRef.current = false;
      window.clearInterval(interval);
    };
  }, [doFetch]);

  return { tiles, loading, error, isStale, lastUpdated, refetch: doFetch };
}
