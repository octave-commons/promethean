// ---------------------------------------------------------------------------
// EtaThreadCard — thread card for the η (global) lane
// Shows: title, gauge bars with ranges, source badges, uncertainty label,
// signal count, and last-updated time.
// ---------------------------------------------------------------------------

import { SourceBadge } from "./SourceBadge";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import type { ThreadData } from "../../api/types";

export interface EtaThreadCardProps {
  readonly thread: ThreadData;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uncertaintyLabel(confidence: number): { text: string; className: string } {
  if (confidence >= 0.7) return { text: "low uncertainty", className: "uncertainty-low" };
  if (confidence >= 0.4) return { text: "moderate uncertainty", className: "uncertainty-moderate" };
  return { text: "high uncertainty", className: "uncertainty-high" };
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "emerging": return "thread-status-emerging";
    case "active": return "thread-status-active";
    case "cooling": return "thread-status-cooling";
    case "archived": return "thread-status-archived";
    default: return "";
  }
}

// ---------------------------------------------------------------------------
// Gauge Bar — horizontal bar showing a score range with median
// ---------------------------------------------------------------------------

function GaugeBar({ label, value, min = 0, max = 1 }: {
  label: string;
  value: number;
  min?: number;
  max?: number;
}): JSX.Element {
  const range = Math.max(max - min, 0.01);
  const pct = ((value - min) / range) * 100;
  const clampedPct = Math.max(0, Math.min(100, pct));
  return (
    <div className="eta-gauge-bar" data-testid="eta-gauge-bar">
      <span className="eta-gauge-bar-label">{label}</span>
      <div className="eta-gauge-bar-track">
        <div
          className="eta-gauge-bar-fill"
          style={{ width: `${clampedPct}%` }}
        />
      </div>
      <span className="eta-gauge-bar-value">{value.toFixed(2)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EtaThreadCard({ thread, className }: EtaThreadCardProps): JSX.Element {
  const signalCount = thread.members.length;
  const lastUpdated = thread.timeline.last_updated;
  const uncertainty = uncertaintyLabel(thread.confidence);

  // Extract source types from source_distribution for badge rendering
  const sources = Object.entries(thread.source_distribution)
    .sort(([, a], [, b]) => b - a);

  // Domain tags as dimension labels
  const tags = thread.domain_tags.length > 0 ? thread.domain_tags : [thread.kind];

  return (
    <article className={`eta-thread-card ${className ?? ""}`.trim()} data-testid="eta-thread-card">
      {/* Header: title + status */}
      <div className="eta-thread-header">
        <div className="eta-thread-title-block">
          <h4 className="eta-thread-title">{thread.title}</h4>
          {thread.summary && (
            <p className="eta-thread-summary">{thread.summary}</p>
          )}
        </div>
        <span className={`eta-thread-status ${statusBadgeClass(thread.status)}`} data-testid="thread-status">
          {thread.status}
        </span>
      </div>

      {/* Gauge bars — one per domain tag showing confidence as score */}
      <div className="eta-gauge-bars" data-testid="eta-gauge-bars">
        {tags.map((tag) => (
          <GaugeBar
            key={tag}
            label={tag.replace(/_/g, " ")}
            value={thread.confidence}
            min={0}
            max={1}
          />
        ))}
        {/* Show a second gauge for source diversity if multiple sources */}
        {sources.length >= 2 && (
          <GaugeBar
            label="source diversity"
            value={Math.min(1, sources.length / 5)}
            min={0}
            max={1}
          />
        )}
      </div>

      {/* Source attribution badges */}
      <div className="eta-thread-sources" data-testid="eta-thread-sources">
        {sources.map(([sourceType, proportion]) => (
          <SourceBadge
            key={sourceType}
            source={sourceType}
            count={Math.round(proportion * signalCount) || undefined}
          />
        ))}
      </div>

      {/* Footer: signal count, last updated, uncertainty */}
      <div className="eta-thread-footer">
        <span className="eta-thread-signals" data-testid="thread-signal-count">
          {signalCount} signal{signalCount !== 1 ? "s" : ""}
        </span>
        <span className="eta-thread-updated" data-testid="thread-last-updated">
          {formatRelativeTime(lastUpdated)}
        </span>
        <span className={`eta-thread-uncertainty ${uncertainty.className}`} data-testid="thread-uncertainty">
          {uncertainty.text}
        </span>
      </div>
    </article>
  );
}
