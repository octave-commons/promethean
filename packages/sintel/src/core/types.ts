/**
 * Sintel Core Types
 * 
 * The perception layer for infrastructure signals intelligence.
 * All observations are append-only and require provenance, exclusions,
 * strategy tier, and workflow context.
 */

// Re-export signal types from @open-hax/signal-contracts
export type { 
  SignalObservation,
  CorrelationEdge,
  RadarFinding,
  WatchlistSeedRow
} from '@open-hax/signal-contracts';

// Re-export constants from @open-hax/signal-contracts
export {
  SIGNAL_OBSERVATION_RECORD,
  SIGNAL_OBSERVATION_SCHEMA_VERSION,
  CORRELATION_EDGE_RECORD,
  CORRELATION_EDGE_SCHEMA_VERSION,
  RADAR_FINDING_RECORD,
  RADAR_FINDING_SCHEMA_VERSION,
  RISK_LEVELS,
  SIGNAL_DIRECTIONS,
  normalizeRiskLevel,
  normalizeSignalDirection
} from '@open-hax/signal-contracts';

// Re-export radar utilities from @open-hax/signal-radar-core
export {
  clamp01,
  resolveThreatRiskLevel,
  resolveThreatProximityStrategy,
  applyThreatSignalStrategy,
  buildThreatLlmFallback,
  resolveThreatScoringMode
} from '@open-hax/signal-radar-core';
export type { 
  ThreatProximityStrategy,
  ThreatLlmFallback 
} from '@open-hax/signal-radar-core';

// Re-export ExclusionSet for convenience
export type { ExclusionSet } from '../policy/exclusions.js';

// ============================================================================
// UUID and Timestamp Types
// ============================================================================

export type UUID = string;
export type ISO8601 = string;

// ============================================================================
// Strategy Tiers
// ============================================================================

/**
 * Strategy tiers define the interaction risk level for discovery.
 * - passive: Observe existing public data without interaction
 * - bounded: Targeted active verification within defined bounds
 * - unrestricted: Active discovery with broader scope
 */
export type StrategyTier = 'passive' | 'bounded' | 'unrestricted';

/**
 * Authorization requirements for each strategy tier.
 */
export const TIER_AUTHORIZATION: Record<StrategyTier, string[]> = {
  passive: ['operator'],
  bounded: ['senior_operator', 'automated_with_review'],
  unrestricted: ['senior_operator_with_justification']
};

// ============================================================================
// Provenance
// ============================================================================

import type { ExclusionSet } from '../policy/exclusions.js';

/**
 * Provenance tracks who collected what, when, and how.
 */
export interface Provenance {
  readonly collector_id: UUID;
  readonly collector_name: string;
  readonly strategy: StrategyTier;
  readonly exclusions_snapshot: ExclusionSet;
  readonly started_at: ISO8601;
  readonly completed_at?: ISO8601;
}

// ============================================================================
// Evidence
// ============================================================================

/**
 * Types of observations Sintel can collect.
 */
export type ObservationType =
  | 'port_scan'
  | 'dns_record'
  | 'certificate'
  | 'whois'
  | 'http_response'
  | 'tls_handshake'
  | 'service_banner'
  | 'vulnerability'
  | 'correlation'
  | 'entity_match';

/**
 * Raw evidence blob with metadata.
 */
export interface EvidenceBlob {
  readonly type: ObservationType;
  readonly raw: Record<string, unknown>;
  readonly metadata: Record<string, unknown>;
  readonly collected_at: ISO8601;
}

// ============================================================================
// Confidence Scoring
// ============================================================================

/**
 * Confidence weights combine source reliability, freshness, strategy risk,
 * corroboration count, and exclusion compliance.
 */
export interface Confidence {
  /** Source reliability: 0.0 to 1.0 */
  readonly source_trust: number;
  /** Freshness decay: 0.0 (stale) to 1.0 (fresh) */
  readonly freshness: number;
  /** Corroboration count */
  readonly corroboration: number;
  /** Strategy risk adjustment */
  readonly strategy_risk: number;
  /** Overall computed confidence */
  readonly overall: number;
}

/**
 * Trust weights by strategy tier.
 */
export const STRATEGY_TRUST_WEIGHTS: Record<StrategyTier, number> = {
  passive: 0.9,
  bounded: 0.7,
  unrestricted: 0.4
};

/**
 * Freshness decay rates by strategy tier.
 */
export const STRATEGY_FRESHNESS_FACTORS: Record<StrategyTier, number> = {
  passive: 0.95,
  bounded: 0.8,
  unrestricted: 0.6
};

// ============================================================================
// Workflow States
// ============================================================================

/**
 * Workflow state machine.
 */
export type WorkflowState = 
  | 'dormant'
  | 'discovering'
  | 'verifying'
  | 'enriching'
  | 'connecting'
  | 'resolved';

/**
 * Workflow disposition on resolution.
 */
export type WorkflowDisposition = 
  | 'promoted'      // Entities promoted to graph
  | 'dismissed'     // False positive or irrelevant
  | 'escalated'     // Requires human review
  | 'expired';      // Stale/inactive

// ============================================================================
// Workflow
// ============================================================================

/**
 * A workflow is the operator-facing unit. It governs all observation collection.
 */
export interface Workflow {
  readonly id: UUID;
  readonly goal: string;
  readonly strategy: StrategyTier;
  readonly exclusions: ExclusionSet;
  readonly state: WorkflowState;
  readonly disposition?: WorkflowDisposition;
  readonly created_at: ISO8601;
  readonly created_by: UUID;
  readonly resolved_at?: ISO8601;
  readonly resolved_by?: UUID;
}

// ============================================================================
// Observation
// ============================================================================

/**
 * The core observation record.
 * All observations are append-only.
 */
export interface Observation {
  readonly id: UUID;
  readonly workflow_id: UUID;
  readonly provenance: Provenance;
  readonly evidence: EvidenceBlob;
  readonly confidence: Confidence;
  readonly state: 'raw' | 'verified' | 'enriched' | 'promoted';
  readonly promoted_to?: UUID; // Entity ID if promoted
  readonly created_at: ISO8601;
}

// ============================================================================
// Entity Promotion
// ============================================================================

/**
 * Requirements for promoting an observation to a first-class entity.
 */
export const PROMOTION_REQUIREMENTS = {
  minimum_confidence: 0.7,
  minimum_corroboration: 2,
  requires_verified_type: true,
  requires_no_exclusion_violations: true
} as const;

/**
 * An entity in the graph (promoted from observations).
 */
export interface Entity {
  readonly id: UUID;
  readonly source_observation_ids: readonly UUID[];
  readonly entity_type: 'host' | 'domain' | 'service' | 'organization' | 'person';
  readonly attributes: Record<string, unknown>;
  readonly confidence: number;
  readonly created_at: ISO8601;
  readonly last_observed_at: ISO8601;
}