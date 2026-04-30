// ---------------------------------------------------------------------------
// SourceBadge — renders a source provenance icon/pill for Bluesky, Reddit, etc.
// ---------------------------------------------------------------------------

export interface SourceBadgeProps {
  /** Source type key (e.g. "bluesky", "reddit", "rss") */
  readonly source: string;
  /** Optional signal count from this source */
  readonly count?: number;
  /** Optional className */
  readonly className?: string;
}

function BlueskyIcon({ size = 14 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.5 7 3 10.5 3 13.5c0 3 2.5 4.5 4.5 4.5 1.5 0 3-1 3.5-2-.5 2-1.5 4-3 5h8c-1.5-1-2.5-3-3-5 .5 1 2 2 3.5 2 2 0 4.5-1.5 4.5-4.5C21 10.5 17.5 7 12 2z" />
    </svg>
  );
}

function RedditIcon({ size = 14 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="11" r="1.5" />
      <circle cx="15" cy="11" r="1.5" />
      <path d="M8.5 15c1 1.5 5.5 1.5 7 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="18" cy="5" r="1.5" />
      <line x1="14" y1="3" x2="17" y2="5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function GenericSourceIcon({ size = 14 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="3" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="21" />
    </svg>
  );
}

const SOURCE_COLORS: Record<string, string> = {
  bluesky: "#0085ff",
  reddit: "#ff4500",
  rss: "#f59e0b",
  api: "#8b5cf6",
  manual: "#6b7280",
};

export function SourceBadge({ source, count, className }: SourceBadgeProps): JSX.Element {
  const color = SOURCE_COLORS[source] ?? "var(--muted)";
  const label = source.charAt(0).toUpperCase() + source.slice(1);

  const icon = (() => {
    switch (source) {
      case "bluesky": return <BlueskyIcon />;
      case "reddit": return <RedditIcon />;
      default: return <GenericSourceIcon />;
    }
  })();

  return (
    <span
      className={`source-badge ${className ?? ""}`.trim()}
      style={{ color, borderColor: `${color}40` }}
      data-testid={`source-badge-${source}`}
      title={`${label}${count !== undefined ? ` (${count} signals)` : ""}`}
    >
      {icon}
      <span className="source-badge-label">{label}</span>
      {count !== undefined && <span className="source-badge-count">{count}</span>}
    </span>
  );
}
