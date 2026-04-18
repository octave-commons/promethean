// ---------------------------------------------------------------------------
// MuLane — the μ (Local) lane populated with real signal data.
// Renders: thread cards sorted by leverage (most actionable first),
// with proximity/leverage/time-to-act indicators and expandable details.
// Shows empty state when no local signals exist.
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import { MuThreadCard, computeLeverage } from "./MuThreadCard";
import { CommunityReadiness } from "./CommunityReadiness";
import type { RadarTile, ThreadData } from "../../api/types";

export interface MuLaneContentProps {
  /** All tiles categorized as local/community */
  readonly tiles: readonly RadarTile[];
  /** Optional className */
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract local/community threads from tiles, filtering by kind and domain tags */
function extractLocalThreads(tiles: readonly RadarTile[]): ThreadData[] {
  const threads: ThreadData[] = [];
  for (const tile of tiles) {
    if (!tile.threads) continue;
    for (const thread of tile.threads) {
      // Include threads that are local_opportunity kind, or have local-oriented domain tags
      const isLocal =
        thread.kind === "local_opportunity" ||
        thread.domain_tags.some((tag) =>
          ["local", "community", "oss", "developer", "open-source", "ai"].includes(tag),
        );
      if (isLocal) {
        threads.push(thread);
      }
    }
  }
  return threads;
}

/** Sort threads by leverage score (most actionable first) */
function sortByLeverage(threads: ThreadData[]): ThreadData[] {
  return [...threads].sort((a, b) => computeLeverage(b) - computeLeverage(a));
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function MuEmptyState(): JSX.Element {
  return (
    <div className="mu-empty-state" data-testid="mu-empty-state">
      <div className="mu-empty-icon">
        <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="var(--emerald)" strokeWidth="1.5" opacity="0.5">
          <circle cx="24" cy="24" r="18" />
          <path d="M24 14v14" strokeLinecap="round" />
          <path d="M18 24h12" strokeLinecap="round" />
        </svg>
      </div>
      <p className="mu-empty-text">
        No local signals yet. Community and open-source radars will populate this lane
        when signals within your expertise are detected.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main MuLane content
// ---------------------------------------------------------------------------

export function MuLaneContent({ tiles, className }: MuLaneContentProps): JSX.Element {
  const sortedThreads = useMemo(() => {
    const localThreads = extractLocalThreads(tiles);
    return sortByLeverage(localThreads);
  }, [tiles]);

  if (sortedThreads.length === 0) {
    return (
      <div className={`mu-lane-content ${className ?? ""}`.trim()}>
        <CommunityReadiness threads={[]} />
        <MuEmptyState />
      </div>
    );
  }

  return (
    <div className={`mu-lane-content ${className ?? ""}`.trim()} data-testid="mu-lane-content">
      <CommunityReadiness threads={sortedThreads} />
      <div className="mu-thread-count" data-testid="mu-thread-count">
        <span>{sortedThreads.length} local thread{sortedThreads.length !== 1 ? "s" : ""}</span>
        <span className="mu-sort-label">sorted by leverage</span>
      </div>
      <div className="mu-thread-list" data-testid="mu-thread-list">
        {sortedThreads.map((thread) => (
          <MuThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
  );
}
