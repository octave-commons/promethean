/**
 * Threat Radar Integration
 * 
 * Bridges Sintel observations to Threat Radar format.
 */

import type { 
  SignalObservation, 
  CorrelationEdge, 
  RadarFinding 
} from '@open-hax/signal-contracts';
import {
  SIGNAL_OBSERVATION_RECORD,
  SIGNAL_OBSERVATION_SCHEMA_VERSION,
  CORRELATION_EDGE_RECORD,
  CORRELATION_EDGE_SCHEMA_VERSION,
  RADAR_FINDING_RECORD,
  RADAR_FINDING_SCHEMA_VERSION
} from '@open-hax/signal-contracts';
import {
  resolveThreatRiskLevel,
  clamp01,
  type ThreatProximityStrategy
} from '@open-hax/signal-radar-core';
import type { Observation } from '../core/types.js';
import { randomUUID } from 'crypto';

// ============================================================================
// Signal Conversion
// ============================================================================

/**
 * Convert a Sintel observation to a Signal Observation for the radar.
 */
export function toSignalObservation(obs: Observation, profile: string = 'default'): SignalObservation {
  return {
    record: SIGNAL_OBSERVATION_RECORD,
    schema_version: SIGNAL_OBSERVATION_SCHEMA_VERSION,
    id: obs.id,
    scope: 'sintel',
    profile,
    category: obs.evidence.type,
    severity: Math.round((1 - obs.confidence.overall) * 100),
    confidence: obs.confidence.overall,
    direction: 'inbound',
    subject_refs: [],
    evidence_refs: [],
    tags: [],
    observed_at: obs.created_at,
    summary: `Sintel observation: ${obs.evidence.type}`
  };
}

// ============================================================================
// Correlation
// ============================================================================

export interface RadarFindingInput {
  readonly profile: string;
  readonly domain: string;
  readonly risk_score: number;
  readonly signal_ids: readonly string[];
  readonly correlation_ids: readonly string[];
  readonly title: string;
  readonly summary: string;
  readonly evidence_refs: readonly string[];
  readonly tags: readonly string[];
}

/**
 * Create a correlation edge between two signals.
 */
export function createCorrelationEdge(
  fromSignalId: string,
  toSignalId: string,
  options: {
    kind?: string;
    score?: number;
    confidence?: number;
    rationale?: string[];
    tags?: string[];
  } = {}
): CorrelationEdge {
  return {
    record: CORRELATION_EDGE_RECORD,
    schema_version: CORRELATION_EDGE_SCHEMA_VERSION,
    id: randomUUID(),
    kind: options.kind || 'temporal',
    from_signal_id: fromSignalId,
    to_signal_id: toSignalId,
    score: options.score ?? 0.7,
    confidence: options.confidence ?? 0.8,
    rationale: options.rationale ?? [],
    tags: options.tags ?? []
  };
}

/**
 * Generate a radar finding from aggregated signals.
 */
export function generateRadarFinding(input: RadarFindingInput): RadarFinding {
  return {
    record: RADAR_FINDING_RECORD,
    schema_version: RADAR_FINDING_SCHEMA_VERSION,
    id: randomUUID(),
    profile: input.profile,
    domain: input.domain,
    risk_score: input.risk_score,
    risk_level: resolveThreatRiskLevel(input.risk_score),
    signal_ids: input.signal_ids,
    correlation_ids: input.correlation_ids,
    title: input.title,
    summary: input.summary,
    evidence_refs: input.evidence_refs,
    tags: input.tags
  };
}

// ============================================================================
// Threat Scoring
// ============================================================================

/**
 * Calculate threat proximity based on signals.
 */
export function calculateThreatProximity(
  signals: string[],
  strategy: ThreatProximityStrategy
): number {
  if (signals.includes(strategy.signal)) {
    return clamp01(strategy.boost);
  }
  return 0;
}

/**
 * Score a domain based on observations.
 */
export function scoreDomain(
  domain: string,
  observations: Observation[],
  profile: string = 'default'
): { finding: RadarFinding; riskScore: number; riskLevel: string } {
  // Calculate combined risk score from observations
  const baseRisk = observations.reduce((sum, obs) => {
    const severityFactor = 1 - obs.confidence.overall;
    return sum + severityFactor * obs.confidence.source_trust;
  }, 0);
  
  // Normalize to 0-100 scale
  const riskScore = Math.min(100, Math.round(baseRisk * 50));
  const riskLevel = resolveThreatRiskLevel(riskScore);
  
  const signalObservations = observations.map(o => toSignalObservation(o, profile));
  
  const finding = generateRadarFinding({
    profile,
    domain,
    risk_score: riskScore,
    signal_ids: signalObservations.map(s => s.id),
    correlation_ids: [],
    title: `Risk assessment for ${domain}`,
    summary: `Domain ${domain} has ${riskLevel} risk (score: ${riskScore})`,
    evidence_refs: [],
    tags: ['sintel', 'automated']
  });
  
  return { finding, riskScore, riskLevel };
}