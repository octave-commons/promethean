// ---------------------------------------------------------------------------
// FirehosePanel — Collapsible panel showing the raw signal feed
// Each entry shows source icon, timestamp, freshness, quality, classification
// Most recent signals at the top
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { SourceBadge } from "./SourceBadge";
import type { RadarTile, ThreadData } from "../../api/types";

export interface FirehoseEntry {
  /** Unique key for the entry */
  readonly id: string;
  /** Thread title as signal label */
  readonly title: string;
  /** Thread summary or description */
  readonly summary: string;
  /** Source type (e.g. "bluesky", "reddit") */
  readonly source: string;
  /** ISO timestamp of the signal */
  readonly timestamp: string;
  /** Number of signals in the underlying thread */
  readonly signalCount: number;
  /** Quality score 0–1 */
  readonly quality: number;
  /** Classification: noise, useful, or actionable */
  readonly classification: "noise" | "useful" | "actionable";
  /** Domain tags from the thread */
  readonly tags: readonly string[];
  /** Radar name this signal belongs to */
  readonly radarName: string;
}

/** Derive the primary source from a thread's source_distribution */
function primarySource(dist: Record<string, number>): string {
  const entries = Object.entries(dist);
  if (entries.length === 0) return "unknown";
  let maxKey = entries[0]![0];
  let maxVal = entries[0]![1];
  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i]!;
    if (entry[1] > maxVal) {
      maxKey = entry[0];
      maxVal = entry[1];
    }
  }
  return maxKey;
}

/** Classify a thread into noise/useful/actionable based on kind and confidence */
function classifyThread(thread: ThreadData): "noise" | "useful" | "actionable" {
  if (thread.kind === "local_opportunity" || thread.status === "emerging") return "actionable";
  if (thread.kind === "event" && thread.confidence >= 0.5) return "useful";
  if (thread.kind === "narrative" && thread.confidence >= 0.4) return "useful";
  if (thread.confidence < 0.3) return "noise";
  return "useful";
}

/** Convert tiles to firehose entries, flattened from all threads */
export function tilesToFirehoseEntries(tiles: readonly RadarTile[]): FirehoseEntry[] {
  const entries: FirehoseEntry[] = [];

  for (const tile of tiles) {
    if (!tile.threads) continue;
    for (const thread of tile.threads) {
      entries.push({
        id: `${tile.radar.id}-${thread.id}`,
        title: thread.title,
        summary: thread.summary ?? "",
        source: primarySource(thread.source_distribution),
        timestamp: thread.timeline.last_updated,
        signalCount: thread.members.length,
        quality: thread.confidence,
        classification: classifyThread(thread),
        tags: thread.domain_tags,
        radarName: tile.radar.name,
      });
    }
  }

  // Sort by timestamp descending (most recent first)
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return entries;
}

/** Compute freshness class from timestamp age */
export function freshnessClass(timestamp: string): "fresh" | "aging" | "stale" {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const ageMinutes = ageMs / 60_000;
  if (ageMinutes < 30) return "fresh";
  if (ageMinutes < 180) return "aging"; // 3 hours
  return "stale";
}

/** Human-readable relative time */
export function relativeTime(timestamp: string): string {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Quality label from numeric score */
function qualityLabel(quality: number): string {
  if (quality >= 0.7) return "high";
  if (quality >= 0.4) return "medium";
  return "low";
}

function FreshnessIndicator({ freshness }: { freshness: "fresh" | "aging" | "stale" }): JSX.Element {
  return (
    <span
      className={`fh-freshness fh-freshness-${freshness}`}
      data-testid="freshness-indicator"
      title={freshness}
      aria-label={`Freshness: ${freshness}`}
    />
  );
}

function QualityBadge({ quality }: { quality: number }): JSX.Element {
  const label = qualityLabel(quality);
  return (
    <span
      className={`fh-quality fh-quality-${label}`}
      data-testid="quality-badge"
      title={`Quality: ${label} (${(quality * 100).toFixed(0)}%)`}
    >
      {label}
    </span>
  );
}

function ClassificationTag({ classification }: { classification: "noise" | "useful" | "actionable" }): JSX.Element {
  return (
    <span
      className={`fh-classification fh-classification-${classification}`}
      data-testid="classification-tag"
    >
      {classification}
    </span>
  );
}

function FirehoseEntryRow({ entry }: { entry: FirehoseEntry }): JSX.Element {
  const freshness = freshnessClass(entry.timestamp);
  return (
    <div className="fh-entry" data-testid="firehose-entry">
      <div className="fh-entry-row">
        <SourceBadge source={entry.source} className="fh-source" />
        <FreshnessIndicator freshness={freshness} />
        <span className="fh-timestamp" title={entry.timestamp}>
          {relativeTime(entry.timestamp)}
        </span>
        <QualityBadge quality={entry.quality} />
        <ClassificationTag classification={entry.classification} />
      </div>
      <div className="fh-entry-content">
        <span className="fh-entry-title">{entry.title}</span>
        {entry.summary && <span className="fh-entry-summary">{entry.summary}</span>}
      </div>
      <div className="fh-entry-meta">
        <span className="fh-entry-radar">{entry.radarName}</span>
        <span className="fh-entry-signals">{entry.signalCount} signals</span>
        {entry.tags.length > 0 && (
          <span className="fh-entry-tags">
            {entry.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="fh-tag">{tag}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

/** Maximum number of entries displayed in the firehose panel */
export const MAX_FIREHOSE_ENTRIES = 200;

export interface FirehosePanelProps {
  /** All radar tiles to extract signals from */
  readonly tiles: readonly RadarTile[];
}

export function FirehosePanel({ tiles }: FirehosePanelProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(true);
  const allEntries = useMemo(() => tilesToFirehoseEntries(tiles), [tiles]);
  const entries = useMemo(
    () => allEntries.slice(0, MAX_FIREHOSE_ENTRIES),
    [allEntries],
  );

  return (
    <div
      className={`fh-panel ${collapsed ? "fh-panel--collapsed" : "fh-panel--expanded"}`}
      data-testid="firehose-panel"
    >
      <button
        className="fh-panel-toggle"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand signal firehose" : "Collapse signal firehose"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 2v20M2 12h4M18 12h4M6 6l2 2M16 6l-2 2M6 18l2-2M16 18l-2-2" strokeLinecap="round" />
        </svg>
        <span className="fh-panel-title">Signal Firehose</span>
        <span className="fh-panel-count" data-testid="firehose-count">
          {allEntries.length > MAX_FIREHOSE_ENTRIES
            ? `${MAX_FIREHOSE_ENTRIES} of ${allEntries.length} signals`
            : `${entries.length} signal${entries.length !== 1 ? "s" : ""}`}
        </span>
        <span className="fh-panel-chevron">{collapsed ? "▲" : "▼"}</span>
      </button>

      {!collapsed && (
        <div className="fh-panel-body" data-testid="firehose-body">
          {entries.length === 0 ? (
            <div className="fh-empty" data-testid="firehose-empty">
              <p>No signals collected yet. Use <code>radar_collect_bluesky</code> or <code>radar_collect_reddit</code> to start ingesting signals, then reduce with <code>radar_reduce_live</code>.</p>
            </div>
          ) : (
            <div className="fh-entries">
              {entries.map((entry) => (
                <FirehoseEntryRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
