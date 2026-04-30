/**
 * Shared types for the threat-radar-web API layer.
 * Mirrors the shape returned by GET /api/radars from threat-radar-mcp.
 */

export type SignalData = {
  median: number;
  range: [number, number];
  agreement: number;
  sample_size: number;
};

export type BranchData = {
  name: string;
  support: string;
  agreement: number;
  triggers: string[];
};

/** Score range from the deterministic reducer (per dimension) */
export type ScoreRangeData = {
  dimension: string;
  min: number;
  max: number;
  median: number;
};

/** Narrative branch from the deterministic reducer */
export type NarrativeBranchData = {
  label: string;
  probability: number;
  evidence: string[];
  realism: number;
  fear: number;
  public_benefit: number;
  actionability: number;
  polarization_risk: number;
  compression_loss: number;
};

/** Output of the deterministic thread-based reducer stored in render_state */
export type DeterministicSnapshotData = {
  scoreRanges: ScoreRangeData[];
  disagreementIndex: number;
  narrativeBranches: NarrativeBranchData[];
  compressionLoss: number;
};

/** Thread member reference */
export type ThreadMemberData = {
  signal_event_id: string;
  relevance: number;
  added_at: string;
};

/** Thread object from the API */
export type ThreadData = {
  id: string;
  radar_id?: string;
  kind: "event" | "narrative" | "local_opportunity";
  title: string;
  summary?: string;
  members: ThreadMemberData[];
  source_distribution: Record<string, number>;
  confidence: number;
  timeline: {
    first_seen: string;
    last_updated: string;
    peak_activity?: string;
  };
  domain_tags: string[];
  status: "emerging" | "active" | "cooling" | "archived";
};

export type RadarTile = {
  radar: {
    id: string;
    slug: string;
    name: string;
    category: string;
    status: string;
  };
  sourceCount: number;
  submissionCount: number;
  liveSnapshot?: {
    as_of_utc: string;
    disagreement_index: number;
    quality_score: number;
    signals: Record<string, SignalData>;
    branches: BranchData[];
    model_count: number;
    render_state?: {
      deterministicSnapshot?: DeterministicSnapshotData;
    };
  };
  latestDailySnapshot?: { as_of_utc: string };
  threads?: ThreadData[];
};
