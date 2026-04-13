/**
 * Observation Collector
 * 
 * Collects observations according to workflow strategy and exclusions.
 * All observations are append-only.
 */

import type {
  UUID,
  ISO8601,
  Observation,
  ObservationType,
  EvidenceBlob,
  Confidence,
  Provenance,
  StrategyTier
} from '../core/types.js';
import {
  STRATEGY_TRUST_WEIGHTS,
  STRATEGY_FRESHNESS_FACTORS
} from '../core/types.js';
import type { ExclusionSet, ExclusionTarget, Exclusion } from '../policy/exclusions.js';
import { ExclusionPolicy } from '../policy/exclusions.js';

// ============================================================================
// Observation Store
// ============================================================================

/**
 * Persistence interface for observations.
 */
export interface ObservationStore {
  create(observation: Observation): Promise<Observation>;
  get(id: UUID): Promise<Observation | null>;
  getByWorkflow(workflowId: UUID): Promise<Observation[]>;
  update(id: UUID, updates: Partial<Observation>): Promise<Observation>;
  findSimilar(evidence: EvidenceBlob): Promise<Observation[]>;
}

// ============================================================================
// Discovery Strategy Interface
// ============================================================================

/**
 * Strategy-specific discovery interface.
 * Implementations handle passive, bounded, or unrestricted discovery.
 */
export interface DiscoveryStrategy {
  readonly tier: StrategyTier;
  discover(targets: DiscoveryTarget[]): AsyncGenerator<RawEvidence>;
}

/**
 * Raw evidence from discovery.
 */
export interface RawEvidence {
  readonly type: ObservationType;
  readonly target: DiscoveryTarget;
  readonly raw: Record<string, unknown>;
  readonly collected_at: ISO8601;
}

/**
 * Target for discovery.
 */
export interface DiscoveryTarget extends ExclusionTarget {
  readonly id: UUID;
  readonly scope: string;
}

// ============================================================================
// Observation Collector
// ============================================================================

/**
 * The observation collector manages discovery according to strategy and exclusions.
 */
export class ObservationCollector {
  constructor(
    private readonly store: ObservationStore,
    private readonly exclusionPolicy: ExclusionPolicy
  ) {}

  /**
   * Collect observations from targets using the given strategy.
   * Respects exclusion policy - excluded targets are skipped.
   */
  async *collect(
    workflowId: UUID,
    provenance: Provenance,
    exclusions: ExclusionSet,
    strategy: DiscoveryStrategy,
    targets: DiscoveryTarget[]
  ): AsyncGenerator<Observation | CollectionError> {
    for (const target of targets) {
      // Check exclusion policy
      const excluded = this.exclusionPolicy.isExcluded(target, exclusions);
      if (excluded) {
        yield {
          type: 'exclusion_violation',
          target,
          exclusion: excluded.exclusion,
          message: `Target ${target.hostname || target.ip} matches exclusion: ${excluded.matched_pattern}`
        };
        continue;
      }

      // Run discovery strategy
      try {
        for await (const evidence of strategy.discover([target])) {
          const observation = await this.createObservation(
            workflowId,
            provenance,
            evidence
          );
          yield observation;
        }
      } catch (error) {
        yield {
          type: 'discovery_error',
          target,
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  }

  /**
   * Create an observation from raw evidence.
   */
  private async createObservation(
    workflowId: UUID,
    provenance: Provenance,
    evidence: RawEvidence
  ): Promise<Observation> {
    const confidence = this.computeConfidence(provenance, evidence);

    const observation: Observation = {
      id: crypto.randomUUID(),
      workflow_id: workflowId,
      provenance,
      evidence: {
        type: evidence.type,
        raw: evidence.raw,
        metadata: {
          target_id: evidence.target.id,
          scope: evidence.target.scope
        },
        collected_at: evidence.collected_at
      },
      confidence,
      state: 'raw',
      created_at: new Date().toISOString()
    };

    return this.store.create(observation);
  }

  /**
   * Compute confidence score for an observation.
   */
  private computeConfidence(provenance: Provenance, evidence: RawEvidence): Confidence {
    const sourceTrust = STRATEGY_TRUST_WEIGHTS[provenance.strategy];
    const freshnessFactor = STRATEGY_FRESHNESS_FACTORS[provenance.strategy];
    
    // Freshness decay - more recent = higher score
    const collectedMs = new Date(evidence.collected_at).getTime();
    const nowMs = Date.now();
    const ageMs = nowMs - collectedMs;
    const ageHours = ageMs / (1000 * 60 * 60);
    const freshness = Math.max(0, freshnessFactor * Math.exp(-ageHours / 24));

    // Corroboration starts at 0 for new observations
    const corroboration = 0;

    // Strategy risk adjustment
    const strategyRisk = 1 - sourceTrust;

    // Overall confidence
    const overall = sourceTrust * freshness * (1 - strategyRisk * 0.3);

    return {
      source_trust: sourceTrust,
      freshness,
      corroboration,
      strategy_risk: strategyRisk,
      overall: Math.min(1, Math.max(0, overall))
    };
  }

  /**
   * Verify an observation (transition from raw to verified).
   */
  async verify(
    observationId: UUID,
    verificationMethod: string,
    result: 'confirmed' | 'refuted' | 'inconclusive'
  ): Promise<Observation> {
    const obs = await this.store.get(observationId);
    if (!obs) {
      throw new Error(`Observation not found: ${observationId}`);
    }

    if (obs.state !== 'raw') {
      throw new Error(`Can only verify raw observations. Current state: ${obs.state}`);
    }

    // Update confidence based on verification
    const verifiedConfidence: Confidence = {
      ...obs.confidence,
      source_trust: result === 'confirmed' ? Math.min(1, obs.confidence.source_trust + 0.1) : 
                    result === 'refuted' ? Math.max(0, obs.confidence.source_trust - 0.3) : 
                    obs.confidence.source_trust,
      corroboration: obs.confidence.corroboration + 1,
      overall: this.recomputeOverall(obs, result)
    };

    return this.store.update(observationId, {
      state: 'verified',
      confidence: verifiedConfidence
    });
  }

  /**
   * Enrich an observation with additional metadata.
   */
  async enrich(
    observationId: UUID,
    enrichment: Record<string, unknown>
  ): Promise<Observation> {
    const obs = await this.store.get(observationId);
    if (!obs) {
      throw new Error(`Observation not found: ${observationId}`);
    }

    if (obs.state === 'promoted') {
      throw new Error('Cannot enrich promoted observations');
    }

    const enrichedMetadata = {
      ...obs.evidence.metadata,
      enrichment,
      enriched_at: new Date().toISOString()
    };

    const updatedState = obs.state === 'verified' ? 'enriched' : obs.state;

    return this.store.update(observationId, {
      state: updatedState,
      evidence: {
        ...obs.evidence,
        metadata: enrichedMetadata
      }
    });
  }

  /**
   * Recompute overall confidence after verification.
   */
  private recomputeOverall(obs: Observation, result: 'confirmed' | 'refuted' | 'inconclusive'): number {
    const factor = result === 'confirmed' ? 1.1 : result === 'refuted' ? 0.5 : 0.9;
    return Math.min(1, Math.max(0, obs.confidence.overall * factor));
  }
}

// ============================================================================
// Collection Error Types
// ============================================================================

export type CollectionError = 
  | { type: 'exclusion_violation'; target: DiscoveryTarget; exclusion: Exclusion; message: string }
  | { type: 'discovery_error'; target: DiscoveryTarget; message: string };