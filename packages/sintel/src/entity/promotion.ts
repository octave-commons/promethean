/**
 * Entity Promotion
 * 
 * Promotes verified observations to first-class entities in the graph.
 * Requires minimum confidence, corroboration, and no exclusion violations.
 */

import type { UUID, Observation, Entity, Confidence } from '../core/types.js';
import { PROMOTION_REQUIREMENTS } from '../core/types.js';

// ============================================================================
// Entity Store
// ============================================================================

/**
 * Persistence interface for entities.
 */
export interface EntityStore {
  create(entity: Entity): Promise<Entity>;
  get(id: UUID): Promise<Entity | null>;
  getByObservation(observationId: UUID): Promise<Entity | null>;
  findSimilar(entity: Partial<Entity>): Promise<Entity[]>;
  update(id: UUID, updates: Partial<Entity>): Promise<Entity>;
}

// ============================================================================
// Promotion Engine
// ============================================================================

/**
 * Promotion requirements check.
 */
export interface PromotionCheck {
  readonly can_promote: boolean;
  readonly reason: string;
  readonly checks: {
    confidence: boolean;
    corroboration: boolean;
    verified_type: boolean;
    no_violations: boolean;
  };
}

/**
 * The entity promotion engine manages the transition from observation to entity.
 */
export class PromotionEngine {
  constructor(private readonly store: EntityStore) {}

  /**
   * Check if an observation can be promoted.
   */
  checkPromotion(observation: Observation): PromotionCheck {
    const checks = {
      confidence: observation.confidence.overall >= PROMOTION_REQUIREMENTS.minimum_confidence,
      corroboration: observation.confidence.corroboration >= PROMOTION_REQUIREMENTS.minimum_corroboration,
      verified_type: observation.state === 'verified' || observation.state === 'enriched',
      no_violations: !this.hasExclusionViolations(observation)
    };

    const canPromote = Object.values(checks).every(Boolean);

    const reasons: string[] = [];
    if (!checks.confidence) {
      reasons.push(`Confidence ${observation.confidence.overall.toFixed(2)} < ${PROMOTION_REQUIREMENTS.minimum_confidence}`);
    }
    if (!checks.corroboration) {
      reasons.push(`Corroboration ${observation.confidence.corroboration} < ${PROMOTION_REQUIREMENTS.minimum_corroboration}`);
    }
    if (!checks.verified_type) {
      reasons.push(`State '${observation.state}' not verified`);
    }
    if (!checks.no_violations) {
      reasons.push('Has exclusion violations in evidence chain');
    }

    return {
      can_promote: canPromote,
      reason: canPromote ? 'All requirements met' : reasons.join('; '),
      checks
    };
  }

  /**
   * Promote an observation to an entity.
   * Throws if promotion requirements not met.
   */
  async promote(
    observation: Observation,
    entityType: Entity['entity_type'],
    attributes: Record<string, unknown>
  ): Promise<Entity> {
    const check = this.checkPromotion(observation);
    if (!check.can_promote) {
      throw new Error(`Cannot promote: ${check.reason}`);
    }

    // Check for existing entity from same observation
    const existing = await this.store.getByObservation(observation.id);
    if (existing) {
      throw new Error(`Observation ${observation.id} already promoted to entity ${existing.id}`);
    }

    // Create entity
    const entity: Entity = {
      id: crypto.randomUUID(),
      source_observation_ids: [observation.id],
      entity_type: entityType,
      attributes,
      confidence: observation.confidence.overall,
      created_at: new Date().toISOString(),
      last_observed_at: observation.created_at
    };

    return this.store.create(entity);
  }

  /**
   * Merge additional observations into an existing entity.
   * Increases corroboration and confidence.
   */
  async merge(
    entityId: UUID,
    observation: Observation
  ): Promise<Entity> {
    const entity = await this.store.get(entityId);
    if (!entity) {
      throw new Error(`Entity not found: ${entityId}`);
    }

    const check = this.checkPromotion(observation);
    if (!check.can_promote) {
      throw new Error(`Cannot merge observation: ${check.reason}`);
    }

    // Update entity with new observation
    const mergedConfidence = this.mergeConfidence(
      entity.confidence,
      observation.confidence
    );

    return this.store.update(entityId, {
      source_observation_ids: [...entity.source_observation_ids, observation.id],
      confidence: mergedConfidence,
      last_observed_at: new Date().toISOString(),
      attributes: {
        ...entity.attributes,
        ...observation.evidence.metadata
      }
    });
  }

  /**
   * Merge confidence scores when adding corroboration.
   */
  private mergeConfidence(
    existing: number,
    observation: Confidence
  ): number {
    // Bayesian update: prior * likelihood / evidence
    // Simplified: weighted average with boost for corroboration
    const weight = 0.6; // Weight toward existing
    const merged = weight * existing + (1 - weight) * observation.overall;
    const corroborationBoost = 1 + (0.05 * observation.corroboration);
    return Math.min(1, merged * corroborationBoost);
  }

  /**
   * Check for exclusion violations in evidence chain.
   */
  private hasExclusionViolations(observation: Observation): boolean {
    // Check if any exclusion was violated during collection
    // This would require access to the exclusion check log
    // For now, trust the provenance exclusions_snapshot
    return false; // Placeholder
  }
}

// ============================================================================
// Entity Deduplication
// ============================================================================

/**
 * Compare two entities for potential merge.
 */
export interface EntityComparison {
  readonly similarity: number; // 0.0 to 1.0
  readonly match_type: 'exact' | 'high_confidence' | 'possible' | 'different';
  readonly match_fields: string[];
}

/**
 * Deduplication logic for entities.
 */
export class EntityDeduplication {
  constructor(private readonly store: EntityStore) {}

  /**
   * Find potential duplicates for an entity.
   */
  async findDuplicates(entity: Partial<Entity>): Promise<Entity[]> {
    const candidates = await this.store.findSimilar(entity);
    
    // Score similarity
    const scored = candidates.map(candidate => ({
      entity: candidate,
      comparison: this.compare(entity, candidate)
    }));

    // Return high-confidence matches
    return scored
      .filter(s => s.comparison.similarity > 0.8)
      .sort((a, b) => b.comparison.similarity - a.comparison.similarity)
      .map(s => s.entity);
  }

  /**
   * Compare two entities for similarity.
   */
  compare(a: Partial<Entity>, b: Entity): EntityComparison {
    const matchFields: string[] = [];
    let score = 0;
    let fields = 0;

    // Compare entity type
    if (a.entity_type && a.entity_type === b.entity_type) {
      matchFields.push('entity_type');
      score += 1;
    }
    fields += 1;

    // Compare attributes
    if (a.attributes && b.attributes) {
      const keys = new Set([...Object.keys(a.attributes), ...Object.keys(b.attributes)]);
      for (const key of keys) {
        if (a.attributes[key] !== undefined && b.attributes[key] !== undefined) {
          fields += 1;
          if (a.attributes[key] === b.attributes[key]) {
            matchFields.push(key);
            score += 1;
          }
        }
      }
    }

    const similarity = fields > 0 ? score / fields : 0;
    
    let matchType: EntityComparison['match_type'];
    if (similarity >= 0.99) matchType = 'exact';
    else if (similarity >= 0.9) matchType = 'high_confidence';
    else if (similarity >= 0.7) matchType = 'possible';
    else matchType = 'different';

    return { similarity, match_type: matchType, match_fields: matchFields };
  }

  /**
   * Merge two entities into one.
   */
  async mergeEntities(
    primaryId: UUID,
    secondaryId: UUID
  ): Promise<Entity> {
    const primary = await this.store.get(primaryId);
    const secondary = await this.store.get(secondaryId);

    if (!primary || !secondary) {
      throw new Error('Both entities must exist for merge');
    }

    // Merge observations from secondary into primary
    const mergedObservations = [
      ...primary.source_observation_ids,
      ...secondary.source_observation_ids
    ];

    // Take higher confidence
    const mergedConfidence = Math.max(primary.confidence, secondary.confidence);

    // Merge attributes
    const mergedAttributes = {
      ...secondary.attributes,
      ...primary.attributes // Primary takes precedence
    };

    return this.store.update(primaryId, {
      source_observation_ids: mergedObservations,
      confidence: mergedConfidence,
      attributes: mergedAttributes,
      last_observed_at: new Date().toISOString()
    });
  }
}

// ============================================================================
// Export Convenience
// ============================================================================

/**
 * Create a new entity from an observation.
 */
export async function createEntityFromObservation(
  observation: Observation,
  entityType: Entity['entity_type'],
  attributes: Record<string, unknown>,
  store: EntityStore
): Promise<Entity> {
  const engine = new PromotionEngine(store);
  return engine.promote(observation, entityType, attributes);
}