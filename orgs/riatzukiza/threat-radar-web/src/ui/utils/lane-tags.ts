// ---------------------------------------------------------------------------
// Shared UI utility: lane-tag mappings
// Provides consistent lane symbol, label, and CSS class mappings across
// all lane components (η, μ, Π).
// ---------------------------------------------------------------------------

/** Lane identifier type */
export type LaneId = "eta" | "mu" | "pi";

/** Lane display metadata */
export interface LaneTagConfig {
  /** Greek symbol */
  readonly symbol: string;
  /** Human-readable label */
  readonly label: string;
  /** CSS class for the lane tag element */
  readonly tagClass: string;
}

/** Canonical lane configuration map */
export const LANE_TAGS: Readonly<Record<LaneId, LaneTagConfig>> = {
  eta: { symbol: "η", label: "Global", tagClass: "pi-conn-tag-eta" },
  mu: { symbol: "μ", label: "Local", tagClass: "pi-conn-tag-mu" },
  pi: { symbol: "Π", label: "Connections", tagClass: "pi-conn-tag-pi" },
} as const;
