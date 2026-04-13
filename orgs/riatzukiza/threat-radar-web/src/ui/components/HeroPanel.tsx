// ---------------------------------------------------------------------------
// HeroPanel — aggregate ring gauges across all radars, positioned above
// the 3-lane grid. Displays 3 composite gauges:
//   • Agency  — how actionable the current signal landscape is
//   • Nuance  — how much disagreement/complexity exists
//   • Critical — overall threat level
// Uses the RiskGauge component for rendering.
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import { RiskGauge } from "./RiskGauge";
import type { RadarTile } from "../../api/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HeroPanelProps {
  /** All radar tiles from the API (the component aggregates across them) */
  readonly tiles: readonly RadarTile[];
  /** Optional className for the container */
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Computation helpers (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Agency — how actionable is the current signal landscape.
 * Higher quality, higher agreement, and more signals → higher agency.
 * Scale: 0–100.
 */
export function computeAgency(tiles: readonly RadarTile[]): number {
  const snapshots = tiles
    .map((t) => t.liveSnapshot)
    .filter((s): s is NonNullable<typeof s> => s !== undefined && s !== null);

  if (snapshots.length === 0) return 0;

  let totalScore = 0;
  let count = 0;

  for (const snap of snapshots) {
    const signals = Object.values(snap.signals);
    if (signals.length === 0) continue;

    // Average agreement across dimensions (0–1 scale)
    const avgAgreement = signals.reduce((s, sig) => s + sig.agreement, 0) / signals.length;
    // Quality score (0–1 scale)
    const quality = snap.quality_score;
    // Signal coverage (more signals → more actionable, capped at 1)
    const coverage = Math.min(1, signals.length / 6);

    // Composite: weighted average of agreement, quality, coverage
    const score = (avgAgreement * 0.4 + quality * 0.35 + coverage * 0.25) * 100;
    totalScore += score;
    count += 1;
  }

  if (count === 0) return 0;
  return Math.round(Math.min(100, Math.max(0, totalScore / count)));
}

/**
 * Nuance — how much disagreement/complexity exists in the signal landscape.
 * Higher disagreement index + wider score ranges → higher nuance.
 * Scale: 0–100.
 */
export function computeNuance(tiles: readonly RadarTile[]): number {
  const snapshots = tiles
    .map((t) => t.liveSnapshot)
    .filter((s): s is NonNullable<typeof s> => s !== undefined && s !== null);

  if (snapshots.length === 0) return 0;

  let totalScore = 0;
  let count = 0;

  for (const snap of snapshots) {
    const signals = Object.values(snap.signals);
    if (signals.length === 0) continue;

    // Disagreement index (0–1 scale)
    const disagreement = snap.disagreement_index;
    // Average range width (wider = more nuance)
    const avgRangeWidth =
      signals.reduce((s, sig) => s + (sig.range[1] - sig.range[0]), 0) / signals.length;
    // Normalize range width to 0–1 scale (max range is ~4)
    const rangeNorm = Math.min(1, avgRangeWidth / 4);

    // Composite: disagreement contributes most, range adds to it
    const score = (disagreement * 0.65 + rangeNorm * 0.35) * 100;
    totalScore += score;
    count += 1;
  }

  if (count === 0) return 0;
  return Math.round(Math.min(100, Math.max(0, totalScore / count)));
}

/**
 * Critical — overall threat level across all radars.
 * Higher median signal values → higher threat.
 * Scale: 0–100.
 */
export function computeCritical(tiles: readonly RadarTile[]): number {
  const snapshots = tiles
    .map((t) => t.liveSnapshot)
    .filter((s): s is NonNullable<typeof s> => s !== undefined && s !== null);

  if (snapshots.length === 0) return 0;

  let totalScore = 0;
  let count = 0;

  for (const snap of snapshots) {
    const signals = Object.values(snap.signals);
    if (signals.length === 0) continue;

    // Average median across all signal dimensions (0–4 scale typically)
    const avgMedian = signals.reduce((s, sig) => s + sig.median, 0) / signals.length;
    // Normalize to 0–100 (assuming 0–4 scale)
    const score = (avgMedian / 4) * 100;
    totalScore += score;
    count += 1;
  }

  if (count === 0) return 0;
  return Math.round(Math.min(100, Math.max(0, totalScore / count)));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroPanel({ tiles, className }: HeroPanelProps): JSX.Element {
  const agency = useMemo(() => computeAgency(tiles), [tiles]);
  const nuance = useMemo(() => computeNuance(tiles), [tiles]);
  const critical = useMemo(() => computeCritical(tiles), [tiles]);

  return (
    <div className={`hero-panel ${className ?? ""}`.trim()} data-testid="hero-panel">
      <div className="hero-panel-gauges">
        <RiskGauge
          value={agency}
          min={0}
          max={100}
          label="Agency"
          color="var(--emerald, #34d399)"
          size={120}
        />
        <RiskGauge
          value={nuance}
          min={0}
          max={100}
          label="Nuance"
          color="var(--accent-2, #ffd166)"
          size={120}
        />
        <RiskGauge
          value={critical}
          min={0}
          max={100}
          label="Critical"
          color="var(--accent, #ff6f3c)"
          size={120}
        />
      </div>
    </div>
  );
}
