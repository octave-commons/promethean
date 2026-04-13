// ---------------------------------------------------------------------------
// EtaLane — the η (Global) lane populated with real signal data.
// Renders: ThreatClock for overall threat level, RiskGauges per dimension
// (showing score ranges), BranchMap with narrative branches, thread cards.
// ---------------------------------------------------------------------------

import { ThreatClock } from "./ThreatClock";
import type { ThreatClockSignal } from "./ThreatClock";
import { RiskGauge } from "./RiskGauge";
import { BranchMap } from "./BranchMap";
import type { BranchMapBranch } from "./BranchMap";
import { EtaThreadCard } from "./EtaThreadCard";
import type { RadarTile, ThreadData, DeterministicSnapshotData, SignalData } from "../../api/types";
import { normalizeDimension } from "../hooks/usePersonalization";
import type { DimensionWeights } from "../hooks/usePersonalization";

export interface EtaLaneContentProps {
  /** All tiles categorized as global */
  readonly tiles: readonly RadarTile[];
  /** Optional dimension weights for personalized scoring */
  readonly weights?: DimensionWeights;
  /** Optional className */
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function averageSignal(snapshot: RadarTile["liveSnapshot"]): number {
  if (!snapshot) return 0;
  const values = Object.values(snapshot.signals);
  if (values.length === 0) return 0;
  return values.reduce((sum, s) => sum + s.median, 0) / values.length;
}

function toClockSignals(signals: Record<string, SignalData>): ThreatClockSignal[] {
  return Object.entries(signals).map(([key, sig]) => ({
    median: sig.median,
    range: sig.range,
    agreement: sig.agreement,
    label: key,
  }));
}

function toBranchMapBranches(det: DeterministicSnapshotData): BranchMapBranch[] {
  return det.narrativeBranches.map((b) => ({
    label: b.label,
    probability: b.probability,
    evidence: b.evidence,
    realism: b.realism,
    fear: b.fear,
    public_benefit: b.public_benefit,
    actionability: b.actionability,
    polarization_risk: b.polarization_risk,
    compression_loss: b.compression_loss,
  }));
}

/** Merge source distributions from all threads to get overall source counts */
function aggregateSourceCounts(threads: ThreadData[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const thread of threads) {
    for (const [source, proportion] of Object.entries(thread.source_distribution)) {
      result[source] = (result[source] ?? 0) + Math.round(proportion * thread.members.length);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Per-radar card (with thread-enriched data)
// ---------------------------------------------------------------------------

function EtaRadarSection({ tile, weights }: { tile: RadarTile; weights?: DimensionWeights }): JSX.Element {
  const snapshot = tile.liveSnapshot;
  const det = snapshot?.render_state?.deterministicSnapshot;
  const threads = tile.threads ?? [];
  const globalThreads = threads.filter(
    (t) =>
      t.kind === "event" ||
      t.kind === "narrative" ||
      t.domain_tags.some((tag) =>
        ["geopolitical", "infrastructure", "economic", "security", "climate"].includes(tag),
      ),
  );

  // Overall threat value
  const overallThreat = averageSignal(snapshot);
  const clockSignals = snapshot ? toClockSignals(snapshot.signals) : [];
  const disagreement = snapshot?.disagreement_index ?? 0;

  // Branch map from deterministic reducer
  const branchMapData = det ? toBranchMapBranches(det) : [];

  // Score ranges from deterministic reducer for per-dimension gauges
  const scoreRanges = det?.scoreRanges ?? [];

  return (
    <div className="eta-radar-section" data-testid="eta-radar-section">
      {/* Radar header */}
      <div className="eta-radar-header">
        <h3>{tile.radar.name}</h3>
        <span className="card-category">{tile.radar.category}</span>
      </div>

      {/* ThreatClock — overall global threat level */}
      <ThreatClock
        value={overallThreat}
        max={4}
        signals={clockSignals}
        disagreementIndex={disagreement}
        size={200}
        className="sweep-clock"
      />

      {/* RiskGauges — one per dimension, showing score RANGES (weighted) */}
      {scoreRanges.length > 0 && (
        <div className="eta-score-ranges" data-testid="eta-score-ranges">
          <h4 className="eta-section-title">Dimensions</h4>
          <div className="eta-range-gauges">
            {scoreRanges.map((sr) => {
              const normalizedDim = normalizeDimension(sr.dimension);
              const weight = normalizedDim !== undefined && weights !== undefined ? weights[normalizedDim] : 50;
              const factor = weight / 50;
              const weightedMedian = Math.max(0, Math.min(100, sr.median * 100 * factor));
              return (
              <div key={sr.dimension} className="eta-range-gauge-wrapper" data-testid="eta-range-gauge">
                <RiskGauge
                  value={weightedMedian}
                  min={0}
                  max={100}
                  label={sr.dimension.replace(/_/g, " ")}
                  color={dimensionColor(sr.dimension)}
                  size={120}
                />
                <div className="eta-range-indicator" data-testid="eta-range-indicator">
                  <span className="eta-range-min">{(sr.min * 100).toFixed(0)}</span>
                  <span className="eta-range-bar">
                    <span
                      className="eta-range-fill"
                      style={{
                        left: `${sr.min * 100}%`,
                        width: `${(sr.max - sr.min) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="eta-range-max">{(sr.max * 100).toFixed(0)}</span>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback: show per-signal gauges with ranges if no deterministic snapshot */}
      {scoreRanges.length === 0 && snapshot && Object.keys(snapshot.signals).length > 0 && (
        <div className="eta-score-ranges" data-testid="eta-score-ranges">
          <h4 className="eta-section-title">Signal Dimensions</h4>
          <div className="eta-range-gauges">
            {Object.entries(snapshot.signals).map(([key, sig]) => (
              <div key={key} className="eta-range-gauge-wrapper" data-testid="eta-range-gauge">
                <RiskGauge
                  value={sig.median}
                  min={0}
                  max={4}
                  label={key.replace(/_/g, " ")}
                  color={dimensionColor(key)}
                  size={120}
                />
                <div className="eta-range-indicator" data-testid="eta-range-indicator">
                  <span className="eta-range-min">{sig.range[0].toFixed(1)}</span>
                  <span className="eta-range-bar">
                    <span
                      className="eta-range-fill"
                      style={{
                        left: `${(sig.range[0] / 4) * 100}%`,
                        width: `${((sig.range[1] - sig.range[0]) / 4) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="eta-range-max">{sig.range[1].toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BranchMap — narrative branches with probability labels */}
      {branchMapData.length >= 2 && (
        <div className="eta-branch-section">
          <h4 className="eta-section-title">Narrative Branches</h4>
          <BranchMap
            branches={branchMapData}
            rootLabel={tile.radar.name}
            width={300}
            height={Math.max(140, branchMapData.length * 55)}
          />
        </div>
      )}

      {/* Thread cards */}
      {globalThreads.length > 0 && (
        <div className="eta-threads-section">
          <h4 className="eta-section-title">
            Threads ({globalThreads.length})
          </h4>
          <div className="eta-thread-list">
            {globalThreads.map((thread) => (
              <EtaThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dimension-color mapping
// ---------------------------------------------------------------------------

function dimensionColor(dimension: string): string {
  const colors: Record<string, string> = {
    geopolitical: "hsl(200, 70%, 60%)",
    infrastructure: "hsl(35, 80%, 55%)",
    economic: "hsl(140, 65%, 50%)",
    security: "hsl(0, 70%, 60%)",
    climate: "hsl(180, 60%, 50%)",
    technology: "hsl(270, 60%, 60%)",
    community: "hsl(320, 60%, 55%)",
    event: "hsl(45, 75%, 55%)",
    narrative: "hsl(220, 60%, 60%)",
    local_opportunity: "hsl(160, 65%, 50%)",
  };
  return colors[dimension] ?? `hsl(${Math.abs(dimension.charCodeAt(0) * 7) % 360}, 60%, 55%)`;
}

// ---------------------------------------------------------------------------
// Main EtaLane content
// ---------------------------------------------------------------------------

export function EtaLaneContent({ tiles, weights, className }: EtaLaneContentProps): JSX.Element {
  if (tiles.length === 0) {
    return (
      <div className={`eta-lane-empty ${className ?? ""}`.trim()}>
        <p>No global signals yet. Collect signals via Bluesky or Reddit to populate this lane.</p>
      </div>
    );
  }

  return (
    <div className={`eta-lane-content ${className ?? ""}`.trim()} data-testid="eta-lane-content">
      {tiles.map((tile) => (
        <EtaRadarSection key={tile.radar.id} tile={tile} weights={weights} />
      ))}
    </div>
  );
}
