// ---------------------------------------------------------------------------
// Shared UI utility: formatRelativeTime
// Extracted from EtaThreadCard, MuThreadCard, and PiLaneConnections to
// eliminate duplication across lane components.
// ---------------------------------------------------------------------------

/**
 * Format an ISO 8601 timestamp as a human-readable relative time string.
 * Examples: "just now", "5m ago", "3h ago", "2d ago"
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
