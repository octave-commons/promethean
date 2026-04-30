// ---------------------------------------------------------------------------
// PiLaneConnections — Full Π (connections) lane UI.
//
// Shows:
//   (1) Bridge cards with connection type badge, strength bar, scores,
//       similarity score from browser embedding
//   (2) Action cards with urgency indicator, title, description, checklist
//   (3) Comparison panel for side-by-side thread viewing
//   (4) Federation comparison sub-panel (placeholder data)
//   (5) P→R→N→Π→A feedback loop visualization
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState, useCallback } from "react";
import type { ThreadData, RadarTile } from "../../api/types";
import type { SimilarityScore, EmbeddingState } from "../../embed/useEmbedding";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import {
  detectClientConnections,
  type BridgeCardData,
  type PiActionCardData,
  type ConnectionType,
  type SimilarityLookup,
} from "../connections";

// ── Props ──

export interface PiLaneConnectionsProps {
  globalTiles: RadarTile[];
  localTiles: RadarTile[];
  embeddingState: EmbeddingState;
  computeSimilarity: (
    globalTitles: string[],
    localTitles: string[],
  ) => Promise<SimilarityScore[]>;
}

// ── Helpers ──

function extractThreads(tiles: RadarTile[]): ThreadData[] {
  const threads: ThreadData[] = [];
  for (const tile of tiles) {
    if (tile.threads) {
      for (const thread of tile.threads) {
        threads.push(thread);
      }
    }
  }
  return threads;
}

function extractThreadTitles(tiles: RadarTile[]): string[] {
  const titles: string[] = [];
  for (const tile of tiles) {
    if (tile.threads) {
      for (const thread of tile.threads) {
        titles.push(thread.title);
      }
    }
    if (!tile.threads || tile.threads.length === 0) {
      titles.push(tile.radar.name);
    }
  }
  return titles;
}

function formatPct(n: number): string {
  return `${Math.round(n)}`;
}

function formatSimilarity(score: number): string {
  return `${Math.round(score * 100)}%`;
}

function connectionTypeLabel(ct: ConnectionType): string {
  switch (ct) {
    case "causal": return "Causal";
    case "correlative": return "Correlative";
    case "predictive": return "Predictive";
  }
}

function connectionTypeClass(ct: ConnectionType): string {
  switch (ct) {
    case "causal": return "pi-type-causal";
    case "correlative": return "pi-type-correlative";
    case "predictive": return "pi-type-predictive";
  }
}

function strengthColor(s: number): string {
  if (s >= 0.5) return "var(--fuchsia)";
  if (s >= 0.3) return "var(--accent-2)";
  if (s >= 0.15) return "var(--muted)";
  return "rgba(255,255,255,0.2)";
}

function strengthLabel(s: number): string {
  if (s >= 0.5) return "Strong";
  if (s >= 0.3) return "Moderate";
  if (s >= 0.15) return "Weak";
  return "Tenuous";
}

function urgencyClass(level: string): string {
  switch (level) {
    case "critical": return "pi-urg-critical";
    case "high": return "pi-urg-high";
    case "moderate": return "pi-urg-moderate";
    default: return "pi-urg-low";
  }
}

// ── Placeholder federation data ──

interface PeerAssessment {
  readonly peerId: string;
  readonly peerName: string;
  readonly scores: {
    readonly realism: number;
    readonly fear: number;
    readonly public_benefit: number;
  };
  readonly lastSynced: string;
  readonly status: "online" | "stale" | "offline";
}

function generatePlaceholderPeers(bridge: BridgeCardData): PeerAssessment[] {
  // Generate deterministic placeholder data from bridge scores
  return [
    {
      peerId: "local",
      peerName: "This Instance",
      scores: {
        realism: bridge.realism,
        fear: bridge.fear,
        public_benefit: bridge.public_benefit,
      },
      lastSynced: new Date().toISOString(),
      status: "online",
    },
    {
      peerId: "peer-alpha",
      peerName: "Peer Alpha",
      scores: {
        realism: Math.min(100, bridge.realism + 8),
        fear: Math.max(0, bridge.fear - 5),
        public_benefit: Math.min(100, bridge.public_benefit + 12),
      },
      lastSynced: new Date(Date.now() - 300_000).toISOString(),
      status: "online",
    },
    {
      peerId: "peer-beta",
      peerName: "Peer Beta",
      scores: {
        realism: Math.max(0, bridge.realism - 10),
        fear: Math.min(100, bridge.fear + 15),
        public_benefit: Math.max(0, bridge.public_benefit - 7),
      },
      lastSynced: new Date(Date.now() - 7_200_000).toISOString(),
      status: "stale",
    },
  ];
}

// ── Sub-components ──

function BridgeCard({
  bridge,
  onToggleComparison,
  comparisonOpen,
}: {
  bridge: BridgeCardData;
  onToggleComparison: (id: string) => void;
  comparisonOpen: boolean;
}): JSX.Element {
  const [showFederation, setShowFederation] = useState(false);
  const peers = useMemo(() => generatePlaceholderPeers(bridge), [bridge]);

  return (
    <div className="pi-bridge-card" data-testid="pi-bridge-card">
      {/* Connection type badge + strength */}
      <div className="pi-bridge-header">
        <span
          className={`pi-type-badge ${connectionTypeClass(bridge.connectionType)}`}
          data-testid="pi-type-badge"
        >
          {connectionTypeLabel(bridge.connectionType)}
        </span>
        <span className="pi-bridge-strength" style={{ color: strengthColor(bridge.strength) }}>
          {strengthLabel(bridge.strength)}
        </span>
        {bridge.semanticSimilarity !== null && (
          <span className="pi-sim-badge" data-testid="pi-sim-badge" title="Semantic similarity from browser embedding">
            🧠 {formatSimilarity(bridge.semanticSimilarity)}
          </span>
        )}
      </div>

      {/* Strength bar */}
      <div className="pi-conn-score-bar" data-testid="pi-strength-bar">
        <div
          className="pi-conn-score-fill"
          style={{
            width: `${Math.min(100, bridge.strength * 100)}%`,
            backgroundColor: strengthColor(bridge.strength),
          }}
        />
        <span className="pi-conn-score-label" data-testid="pi-conn-similarity">
          {formatSimilarity(bridge.strength)}
        </span>
      </div>

      {/* Thread names */}
      <div className="pi-conn-threads">
        <div className="pi-conn-thread pi-conn-thread-global">
          <span className="pi-conn-lane-tag pi-conn-tag-eta">η</span>
          <span className="pi-conn-thread-title">{bridge.globalThread.title}</span>
        </div>
        <div className="pi-conn-bridge-arrow">↕</div>
        <div className="pi-conn-thread pi-conn-thread-local">
          <span className="pi-conn-lane-tag pi-conn-tag-mu">μ</span>
          <span className="pi-conn-thread-title">{bridge.localThread.title}</span>
        </div>
      </div>

      {/* Score trio: realism, fear, public benefit */}
      <div className="pi-scores-row" data-testid="pi-scores-row">
        <div className="pi-score-item">
          <span className="pi-score-label">Realism</span>
          <span className="pi-score-value" data-testid="pi-score-realism">{formatPct(bridge.realism)}</span>
        </div>
        <div className="pi-score-item">
          <span className="pi-score-label">Fear</span>
          <span className="pi-score-value" data-testid="pi-score-fear">{formatPct(bridge.fear)}</span>
        </div>
        <div className="pi-score-item">
          <span className="pi-score-label">Public Benefit</span>
          <span className="pi-score-value" data-testid="pi-score-public-benefit">{formatPct(bridge.public_benefit)}</span>
        </div>
      </div>

      {/* Suggested actions */}
      {bridge.suggestedActions.length > 0 && (
        <div className="pi-suggested-action" data-testid="pi-suggested-action">
          <span className="pi-action-label">Suggested Action</span>
          <p className="pi-action-text">{bridge.suggestedActions[0]}</p>
        </div>
      )}

      {/* Coordination path */}
      <div className="pi-coord-path" data-testid="pi-coord-path">
        <span className="pi-coord-label">Coordination Path</span>
        <p className="pi-coord-text">{bridge.coordinationPath}</p>
      </div>

      {/* Action buttons */}
      <div className="pi-bridge-actions">
        <button
          className="pi-bridge-btn"
          onClick={(e) => { e.stopPropagation(); onToggleComparison(bridge.id); }}
          data-testid="pi-compare-btn"
        >
          {comparisonOpen ? "Hide Comparison" : "Compare Threads"}
        </button>
        <button
          className="pi-bridge-btn pi-bridge-btn-secondary"
          onClick={(e) => { e.stopPropagation(); setShowFederation(!showFederation); }}
          data-testid="pi-federation-btn"
        >
          {showFederation ? "Hide Federation" : "Federation View"}
        </button>
      </div>

      {/* Comparison Panel */}
      {comparisonOpen && (
        <ComparisonPanel
          globalThread={bridge.globalThread}
          localThread={bridge.localThread}
        />
      )}

      {/* Federation Panel */}
      {showFederation && (
        <FederationPanel peers={peers} />
      )}
    </div>
  );
}

function ActionCard({ card }: { card: PiActionCardData }): JSX.Element {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const toggleStep = useCallback((idx: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  return (
    <div className="pi-action-card" data-testid="pi-action-card">
      {/* Urgency indicator */}
      <div className="pi-action-header">
        <span
          className={`pi-urgency-indicator ${urgencyClass(card.urgencyLevel)}`}
          data-testid="pi-urgency-indicator"
          title={`Urgency: ${Math.round(card.urgency * 100)}%`}
        >
          {card.urgencyLevel}
        </span>
        <span className="pi-action-time-window">{card.timeWindow}</span>
      </div>

      {/* Title + description */}
      <h4 className="pi-action-title" data-testid="pi-action-title">{card.title}</h4>
      <p className="pi-action-description">{card.description}</p>

      {/* Meta row */}
      <div className="pi-action-meta">
        <span className="pi-action-meta-item">Scope: {card.scope}</span>
        <span className="pi-action-meta-item">Effort: {card.effort}</span>
        <span className="pi-action-meta-item">Risk: {card.risk}</span>
      </div>

      {/* Actionable steps checklist */}
      <div className="pi-checklist" data-testid="pi-checklist">
        <span className="pi-checklist-label">
          Actionable Steps ({checkedSteps.size}/{card.actionableSteps.length})
        </span>
        <ul className="pi-checklist-list">
          {card.actionableSteps.map((step, idx) => (
            <li
              key={idx}
              className={`pi-checklist-item ${checkedSteps.has(idx) ? "pi-checklist-checked" : ""}`}
              data-testid="pi-checklist-item"
            >
              <label className="pi-checklist-label-row">
                <input
                  type="checkbox"
                  checked={checkedSteps.has(idx)}
                  onChange={() => toggleStep(idx)}
                  className="pi-checklist-checkbox"
                />
                <span className="pi-checklist-text">{step}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Expected benefit */}
      <div className="pi-action-benefit">
        <span className="pi-benefit-label">Expected Benefit</span>
        <p className="pi-benefit-text">{card.expectedBenefit}</p>
      </div>
    </div>
  );
}

function ComparisonPanel({
  globalThread,
  localThread,
}: {
  globalThread: ThreadData;
  localThread: ThreadData;
}): JSX.Element {
  return (
    <div className="pi-comparison-panel" data-testid="pi-comparison-panel">
      <h5 className="pi-comparison-title">Thread Comparison</h5>
      <div className="pi-comparison-grid">
        {/* Global thread column */}
        <div className="pi-comparison-col pi-comparison-global">
          <div className="pi-comparison-col-header">
            <span className="pi-conn-lane-tag pi-conn-tag-eta">η</span>
            <span className="pi-comparison-col-title">Global</span>
          </div>
          <h6 className="pi-comparison-thread-title">{globalThread.title}</h6>
          {globalThread.summary && (
            <p className="pi-comparison-summary">{globalThread.summary}</p>
          )}
          <div className="pi-comparison-stats">
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">Kind</span>
              <span className="pi-comparison-stat-value">{globalThread.kind.replace(/_/g, " ")}</span>
            </div>
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">Status</span>
              <span className="pi-comparison-stat-value">{globalThread.status}</span>
            </div>
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">Confidence</span>
              <span className="pi-comparison-stat-value">{(globalThread.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">Signals</span>
              <span className="pi-comparison-stat-value">{globalThread.members.length}</span>
            </div>
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">First Seen</span>
              <span className="pi-comparison-stat-value">{formatRelativeTime(globalThread.timeline.first_seen)}</span>
            </div>
          </div>
          {globalThread.domain_tags.length > 0 && (
            <div className="pi-comparison-tags">
              {globalThread.domain_tags.map((tag) => (
                <span key={tag} className="pi-comparison-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="pi-comparison-divider">
          <span className="pi-comparison-vs">vs</span>
        </div>

        {/* Local thread column */}
        <div className="pi-comparison-col pi-comparison-local">
          <div className="pi-comparison-col-header">
            <span className="pi-conn-lane-tag pi-conn-tag-mu">μ</span>
            <span className="pi-comparison-col-title">Local</span>
          </div>
          <h6 className="pi-comparison-thread-title">{localThread.title}</h6>
          {localThread.summary && (
            <p className="pi-comparison-summary">{localThread.summary}</p>
          )}
          <div className="pi-comparison-stats">
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">Kind</span>
              <span className="pi-comparison-stat-value">{localThread.kind.replace(/_/g, " ")}</span>
            </div>
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">Status</span>
              <span className="pi-comparison-stat-value">{localThread.status}</span>
            </div>
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">Confidence</span>
              <span className="pi-comparison-stat-value">{(localThread.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">Signals</span>
              <span className="pi-comparison-stat-value">{localThread.members.length}</span>
            </div>
            <div className="pi-comparison-stat">
              <span className="pi-comparison-stat-label">First Seen</span>
              <span className="pi-comparison-stat-value">{formatRelativeTime(localThread.timeline.first_seen)}</span>
            </div>
          </div>
          {localThread.domain_tags.length > 0 && (
            <div className="pi-comparison-tags">
              {localThread.domain_tags.map((tag) => (
                <span key={tag} className="pi-comparison-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FederationPanel({ peers }: { peers: PeerAssessment[] }): JSX.Element {
  return (
    <div className="pi-federation-panel" data-testid="pi-federation-panel">
      <h5 className="pi-federation-title">Federation Comparison</h5>
      <p className="pi-federation-subtitle">
        How different nodes assess this connection
      </p>
      <div className="pi-federation-grid">
        {peers.map((peer) => (
          <div key={peer.peerId} className="pi-federation-peer" data-testid="pi-federation-peer">
            <div className="pi-federation-peer-header">
              <span className="pi-federation-peer-name">{peer.peerName}</span>
              <span className={`pi-federation-peer-status pi-fed-${peer.status}`}>
                {peer.status}
              </span>
            </div>
            <div className="pi-federation-scores">
              <div className="pi-federation-score">
                <span className="pi-federation-score-label">Realism</span>
                <div className="pi-federation-score-bar">
                  <div
                    className="pi-federation-score-fill pi-fed-fill-realism"
                    style={{ width: `${peer.scores.realism}%` }}
                  />
                </div>
                <span className="pi-federation-score-value">{formatPct(peer.scores.realism)}</span>
              </div>
              <div className="pi-federation-score">
                <span className="pi-federation-score-label">Fear</span>
                <div className="pi-federation-score-bar">
                  <div
                    className="pi-federation-score-fill pi-fed-fill-fear"
                    style={{ width: `${peer.scores.fear}%` }}
                  />
                </div>
                <span className="pi-federation-score-value">{formatPct(peer.scores.fear)}</span>
              </div>
              <div className="pi-federation-score">
                <span className="pi-federation-score-label">Public Benefit</span>
                <div className="pi-federation-score-bar">
                  <div
                    className="pi-federation-score-fill pi-fed-fill-benefit"
                    style={{ width: `${peer.scores.public_benefit}%` }}
                  />
                </div>
                <span className="pi-federation-score-value">{formatPct(peer.scores.public_benefit)}</span>
              </div>
            </div>
            <span className="pi-federation-synced">
              Last synced: {formatRelativeTime(peer.lastSynced)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedbackLoopDiagram(): JSX.Element {
  return (
    <div className="pi-feedback-loop" data-testid="pi-feedback-loop">
      <h5 className="pi-feedback-title">Intelligence Loop</h5>
      <svg viewBox="0 0 300 80" className="pi-feedback-svg" aria-label="P→R→N→Π→A feedback loop">
        {/* Nodes */}
        {[
          { x: 30, label: "P", desc: "Perception" },
          { x: 95, label: "R", desc: "Reduction" },
          { x: 160, label: "N", desc: "Narrative" },
          { x: 225, label: "Π", desc: "Connection" },
          { x: 290, label: "A", desc: "Action" },
        ].map(({ x, label, desc }, i) => (
          <g key={label}>
            <circle cx={x} cy={30} r={16} fill="rgba(217,70,239,0.15)" stroke="var(--fuchsia)" strokeWidth="1.5" />
            <text x={x} y={34} textAnchor="middle" fill="var(--fuchsia)" fontSize="13" fontWeight="700">{label}</text>
            <text x={x} y={60} textAnchor="middle" fill="var(--muted)" fontSize="8">{desc}</text>
            {/* Arrow to next */}
            {i < 4 && (
              <line
                x1={x + 18} y1={30} x2={x + 47} y2={30}
                stroke="var(--fuchsia)" strokeWidth="1" opacity="0.5"
                markerEnd="url(#pi-arrow)"
              />
            )}
          </g>
        ))}
        {/* Feedback arrow (bottom arc) */}
        <path
          d="M 282 42 Q 160 95 38 42"
          fill="none"
          stroke="var(--fuchsia)"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.35"
          markerEnd="url(#pi-arrow)"
        />
        <text x="160" y="78" textAnchor="middle" fill="var(--muted)" fontSize="7" opacity="0.6">feedback</text>
        {/* Arrow marker */}
        <defs>
          <marker id="pi-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--fuchsia)" strokeWidth="1" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// ── Main Component ──

export function PiLaneConnections({
  globalTiles,
  localTiles,
  embeddingState,
  computeSimilarity,
}: PiLaneConnectionsProps): JSX.Element {
  const [similarityScores, setSimilarityScores] = useState<SimilarityScore[]>([]);
  const [computing, setComputing] = useState(false);
  const [openComparisonId, setOpenComparisonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bridges" | "actions">("bridges");

  const globalThreads = useMemo(() => extractThreads(globalTiles), [globalTiles]);
  const localThreads = useMemo(() => extractThreads(localTiles), [localTiles]);
  const globalTitles = useMemo(() => extractThreadTitles(globalTiles), [globalTiles]);
  const localTitles = useMemo(() => extractThreadTitles(localTiles), [localTiles]);

  // Compute embedding similarity
  useEffect(() => {
    if (!embeddingState.ready) return;
    if (globalTitles.length === 0 || localTitles.length === 0) {
      setSimilarityScores([]);
      return;
    }
    let cancelled = false;
    setComputing(true);
    computeSimilarity(globalTitles, localTitles)
      .then((result) => {
        if (!cancelled) setSimilarityScores(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.warn("[PiLane] Similarity computation failed:", err);
          setSimilarityScores([]);
        }
      })
      .finally(() => { if (!cancelled) setComputing(false); });
    return () => { cancelled = true; };
  }, [embeddingState.ready, globalTitles, localTitles, computeSimilarity]);

  // Build similarity lookup from embedding scores
  const similarityLookup = useMemo((): SimilarityLookup => {
    const map = new Map<string, number>();
    for (const s of similarityScores) {
      map.set(`${s.globalTitle}|${s.localTitle}`, s.similarity);
    }
    return {
      get(globalTitle: string, localTitle: string): number | null {
        return map.get(`${globalTitle}|${localTitle}`) ?? null;
      },
    };
  }, [similarityScores]);

  // Detect connections
  const { bridges, actionCards } = useMemo(
    () => detectClientConnections(globalThreads, localThreads, similarityLookup),
    [globalThreads, localThreads, similarityLookup],
  );

  const toggleComparison = useCallback((id: string) => {
    setOpenComparisonId((prev) => (prev === id ? null : id));
  }, []);

  // Loading state
  if (!embeddingState.ready) {
    return (
      <div className="pi-conn-status" data-testid="pi-conn-loading">
        <div className="pi-conn-status-icon">⏳</div>
        <p>Initializing embedding engine…</p>
        <span className="pi-conn-status-sub">
          Backend: {embeddingState.activeBackend}
        </span>
      </div>
    );
  }

  // Empty state
  if (globalTitles.length === 0 || localTitles.length === 0) {
    return (
      <div className="pi-conn-status" data-testid="pi-conn-empty">
        <div className="pi-conn-status-icon">🔗</div>
        <p>
          Connections will appear when both η (global) and μ (local) lanes have
          signals to compare.
        </p>
      </div>
    );
  }

  return (
    <div className="pi-conn-container" data-testid="pi-conn-container">
      {/* Backend status + meta */}
      <div className="pi-conn-meta">
        <span
          className="pi-conn-backend-badge"
          data-testid="pi-conn-backend"
          title={embeddingState.error ?? `Backend: ${embeddingState.activeBackend}`}
        >
          {embeddingState.onnxReady ? "⚡" : "🔤"}{" "}
          {embeddingState.activeBackend}
        </span>
        {computing && <span className="pi-conn-computing">computing…</span>}
        <span className="pi-conn-count">
          {bridges.length} connection{bridges.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Feedback Loop Diagram */}
      <FeedbackLoopDiagram />

      {/* Tab switcher */}
      <div className="pi-tabs" data-testid="pi-tabs">
        <button
          className={`pi-tab ${activeTab === "bridges" ? "pi-tab-active" : ""}`}
          onClick={() => setActiveTab("bridges")}
          data-testid="pi-tab-bridges"
        >
          Bridge Cards ({bridges.length})
        </button>
        <button
          className={`pi-tab ${activeTab === "actions" ? "pi-tab-active" : ""}`}
          onClick={() => setActiveTab("actions")}
          data-testid="pi-tab-actions"
        >
          Action Cards ({actionCards.length})
        </button>
      </div>

      {/* Bridge Cards tab */}
      {activeTab === "bridges" && (
        <div className="pi-conn-list">
          {bridges.length === 0 && !computing && (
            <div className="pi-conn-status" data-testid="pi-conn-no-matches">
              <p>No significant connections detected between η and μ threads.</p>
            </div>
          )}
          {bridges.slice(0, 20).map((bridge) => (
            <BridgeCard
              key={bridge.id}
              bridge={bridge}
              onToggleComparison={toggleComparison}
              comparisonOpen={openComparisonId === bridge.id}
            />
          ))}
        </div>
      )}

      {/* Action Cards tab */}
      {activeTab === "actions" && (
        <div className="pi-action-list" data-testid="pi-action-list">
          {actionCards.length === 0 && (
            <div className="pi-conn-status">
              <p>No action cards generated yet. Stronger connections yield action cards.</p>
            </div>
          )}
          {actionCards.map((card) => (
            <ActionCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
