// ---------------------------------------------------------------------------
// CommunityReadiness — community readiness gauges for the μ (Local) lane.
// Shows 4 progress bars representing readiness dimensions derived from local
// thread data: awareness, engagement, coordination, resilience.
// Placed at the top of the μ lane, before thread cards.
// Shows empty/zero progress bars when no local threads exist.
// ---------------------------------------------------------------------------

import type { ThreadData } from "../../api/types";

export interface CommunityReadinessProps {
  /** Local/community threads to derive readiness dimensions from */
  readonly threads: readonly ThreadData[];
  /** Optional className */
  readonly className?: string;
}

export interface ReadinessDimension {
  readonly key: string;
  readonly label: string;
  /** Value 0–100 */
  readonly value: number;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// Readiness computation helpers
// ---------------------------------------------------------------------------

/**
 * Awareness: how many local signals exist.
 * More signals = higher awareness. Caps at 50 signals = 100%.
 */
export function computeAwareness(threads: readonly ThreadData[]): number {
  const totalSignals = threads.reduce((sum, t) => sum + t.members.length, 0);
  return Math.min(100, Math.round((totalSignals / 50) * 100));
}

/**
 * Engagement: signal diversity / sources.
 * Counts unique source types across all threads.
 * More diverse sources = higher engagement. Caps at 5 unique sources = 100%.
 */
export function computeEngagement(threads: readonly ThreadData[]): number {
  const sources = new Set<string>();
  for (const thread of threads) {
    for (const sourceType of Object.keys(thread.source_distribution)) {
      sources.add(sourceType);
    }
  }
  return Math.min(100, Math.round((sources.size / 5) * 100));
}

/**
 * Coordination: thread interconnectedness.
 * Measures how many threads share domain tags — shared tags indicate
 * thematic coordination across threads. Also accounts for the number of
 * threads, since more threads means more potential for coordination.
 */
export function computeCoordination(threads: readonly ThreadData[]): number {
  if (threads.length <= 1) return threads.length === 1 ? 10 : 0;

  // Count shared domain tags across thread pairs
  let sharedTagPairs = 0;
  let totalPairs = 0;
  for (let i = 0; i < threads.length; i++) {
    const tagsA = new Set(threads[i].domain_tags);
    for (let j = i + 1; j < threads.length; j++) {
      totalPairs++;
      const shared = threads[j].domain_tags.filter((tag) => tagsA.has(tag)).length;
      if (shared > 0) sharedTagPairs++;
    }
  }

  const pairRatio = totalPairs > 0 ? sharedTagPairs / totalPairs : 0;
  // Also boost for thread count (more threads = more coordination potential)
  const threadBoost = Math.min(1, threads.length / 10);
  const raw = (pairRatio * 0.7 + threadBoost * 0.3) * 100;
  return Math.min(100, Math.round(raw));
}

/**
 * Resilience: thread age distribution.
 * A mix of old and new threads indicates a resilient community that maintains
 * interest over time. All-new or all-old threads score lower.
 */
export function computeResilience(threads: readonly ThreadData[]): number {
  if (threads.length === 0) return 0;

  const now = Date.now();
  const agesMs = threads.map((t) => now - new Date(t.timeline.first_seen).getTime());

  if (agesMs.length === 1) {
    // Single thread: moderate resilience if it's not brand-new
    const ageHours = agesMs[0] / (1000 * 60 * 60);
    return Math.min(100, Math.round(Math.min(ageHours / 24, 1) * 40));
  }

  // Measure age spread — higher variance relative to mean = better distribution
  const meanAge = agesMs.reduce((a, b) => a + b, 0) / agesMs.length;
  if (meanAge === 0) return 0;

  const variance = agesMs.reduce((sum, age) => sum + (age - meanAge) ** 2, 0) / agesMs.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / meanAge; // coefficient of variation

  // Also factor in having multiple threads
  const countBoost = Math.min(1, threads.length / 8);
  // CV near 0.5-1.0 is ideal (good mix of ages)
  const spreadScore = Math.min(1, cv * 1.5);

  const raw = (spreadScore * 0.6 + countBoost * 0.4) * 100;
  return Math.min(100, Math.round(raw));
}

/**
 * Compute all 4 readiness dimensions from local thread data.
 */
export function computeReadinessDimensions(threads: readonly ThreadData[]): ReadinessDimension[] {
  return [
    {
      key: "awareness",
      label: "Awareness",
      value: computeAwareness(threads),
      description: "How many local signals exist",
    },
    {
      key: "engagement",
      label: "Engagement",
      value: computeEngagement(threads),
      description: "Signal diversity across sources",
    },
    {
      key: "coordination",
      label: "Coordination",
      value: computeCoordination(threads),
      description: "Thread interconnectedness",
    },
    {
      key: "resilience",
      label: "Resilience",
      value: computeResilience(threads),
      description: "Thread age distribution",
    },
  ];
}

// ---------------------------------------------------------------------------
// Progress bar sub-component
// ---------------------------------------------------------------------------

function ReadinessBar({ dimension }: { dimension: ReadinessDimension }): JSX.Element {
  const pct = Math.max(0, Math.min(100, dimension.value));
  return (
    <div className="cr-bar" data-testid={`cr-bar-${dimension.key}`}>
      <div className="cr-bar-header">
        <span className="cr-bar-label">{dimension.label}</span>
        <span className="cr-bar-value">{pct}%</span>
      </div>
      <div className="cr-bar-track" data-testid={`cr-bar-track-${dimension.key}`}>
        <div
          className="cr-bar-fill"
          data-testid={`cr-bar-fill-${dimension.key}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="cr-bar-description">{dimension.description}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CommunityReadiness({ threads, className }: CommunityReadinessProps): JSX.Element {
  const dimensions = computeReadinessDimensions(threads);

  return (
    <div
      className={`cr-panel ${className ?? ""}`.trim()}
      data-testid="community-readiness"
    >
      <div className="cr-header">
        <h4 className="cr-title">Community Readiness</h4>
        <span className="cr-thread-count" data-testid="cr-thread-count">
          {threads.length} thread{threads.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="cr-bars" data-testid="cr-bars">
        {dimensions.map((dim) => (
          <ReadinessBar key={dim.key} dimension={dim} />
        ))}
      </div>
    </div>
  );
}
