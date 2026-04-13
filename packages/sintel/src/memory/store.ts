/**
 * In-Memory Store Implementations
 * 
 * Simple in-memory implementations for testing and development.
 * For production, replace with database-backed implementations.
 */

import type {
  Workflow,
  UUID,
  EvidenceBlob,
  Observation,
  Entity
} from '../core/types.js';
import type {
  WorkflowStore,
  AuditPoint,
  WorkflowFilter
} from '../workflow/engine.js';
import type { ObservationStore } from '../observation/collector.js';
import type { Exclusion, ExclusionStore } from '../policy/exclusions.js';
import type { EntityStore } from '../entity/promotion.js';

// ============================================================================
// In-Memory Workflow Store
// ============================================================================

export class InMemoryWorkflowStore implements WorkflowStore {
  private workflows = new Map<UUID, Workflow>();
  private auditLog = new Map<UUID, AuditPoint[]>();

  async create(workflow: Workflow): Promise<Workflow> {
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async get(id: UUID): Promise<Workflow | null> {
    return this.workflows.get(id) || null;
  }

  async update(id: UUID, updates: Partial<Workflow>): Promise<Workflow> {
    const existing = this.workflows.get(id);
    if (!existing) {
      throw new Error(`Workflow not found: ${id}`);
    }
    const updated = { ...existing, ...updates };
    this.workflows.set(id, updated);
    return updated;
  }

  async list(filter?: WorkflowFilter): Promise<Workflow[]> {
    let results = Array.from(this.workflows.values());

    if (filter) {
      if (filter.state) {
        results = results.filter(w => w.state === filter.state);
      }
      if (filter.strategy) {
        results = results.filter(w => w.strategy === filter.strategy);
      }
      if (filter.created_by) {
        results = results.filter(w => w.created_by === filter.created_by);
      }
      if (filter.created_after) {
        const after = new Date(filter.created_after);
        results = results.filter(w => new Date(w.created_at) >= after);
      }
      if (filter.created_before) {
        const before = new Date(filter.created_before);
        results = results.filter(w => new Date(w.created_at) <= before);
      }
    }

    return results;
  }

  async addAuditPoint(point: AuditPoint): Promise<void> {
    const workflowLog = this.auditLog.get(point.workflow_id) || [];
    workflowLog.push(point);
    this.auditLog.set(point.workflow_id, workflowLog);
  }

  async getAuditLog(workflowId: UUID): Promise<AuditPoint[]> {
    return this.auditLog.get(workflowId) || [];
  }
}

// ============================================================================
// In-Memory Observation Store
// ============================================================================

export class InMemoryObservationStore implements ObservationStore {
  private observations = new Map<UUID, Observation>();
  private byWorkflow = new Map<UUID, UUID[]>();

  async create(observation: Observation): Promise<Observation> {
    this.observations.set(observation.id, observation);
    
    const workflowObs = this.byWorkflow.get(observation.workflow_id) || [];
    workflowObs.push(observation.id);
    this.byWorkflow.set(observation.workflow_id, workflowObs);
    
    return observation;
  }

  async get(id: UUID): Promise<Observation | null> {
    return this.observations.get(id) || null;
  }

  async getByWorkflow(workflowId: UUID): Promise<Observation[]> {
    const ids = this.byWorkflow.get(workflowId) || [];
    const observations = [];
    for (const id of ids) {
      const obs = this.observations.get(id);
      if (obs) observations.push(obs);
    }
    return observations;
  }

  async update(id: UUID, updates: Partial<Observation>): Promise<Observation> {
    const existing = this.observations.get(id);
    if (!existing) {
      throw new Error(`Observation not found: ${id}`);
    }
    const updated = { ...existing, ...updates };
    this.observations.set(id, updated);
    return updated;
  }

  async findSimilar(evidence: EvidenceBlob): Promise<Observation[]> {
    // Simplified: find by type and hostname
    const results: Observation[] = [];
    for (const obs of this.observations.values()) {
      if (obs.evidence.type === evidence.type) {
        results.push(obs);
      }
    }
    return results;
  }
}

// ============================================================================
// In-Memory Exclusion Store
// ============================================================================

export class InMemoryExclusionStore implements ExclusionStore {
  private orgExclusions = new Map<UUID, Exclusion[]>();
  private workflowExclusions = new Map<UUID, Exclusion[]>();

  async getGlobal(): Promise<Exclusion[]> {
    // Return constitutional exclusions
    return [];
  }

  async getOrg(orgId: UUID): Promise<Exclusion[]> {
    return this.orgExclusions.get(orgId) || [];
  }

  async getWorkflow(workflowId: UUID): Promise<Exclusion[]> {
    return this.workflowExclusions.get(workflowId) || [];
  }

  async addOrgExclusion(orgId: UUID, exclusion: Exclusion): Promise<void> {
    const existing = this.orgExclusions.get(orgId) || [];
    existing.push(exclusion);
    this.orgExclusions.set(orgId, existing);
  }

  async addWorkflowExclusion(workflowId: UUID, exclusion: Exclusion): Promise<void> {
    const existing = this.workflowExclusions.get(workflowId) || [];
    existing.push(exclusion);
    this.workflowExclusions.set(workflowId, existing);
  }
}

// ============================================================================
// In-Memory Entity Store
// ============================================================================

export class InMemoryEntityStore implements EntityStore {
  private entities = new Map<UUID, Entity>();
  private byObservation = new Map<UUID, UUID>();

  async create(entity: Entity): Promise<Entity> {
    this.entities.set(entity.id, entity);
    
    for (const obsId of entity.source_observation_ids) {
      this.byObservation.set(obsId, entity.id);
    }
    
    return entity;
  }

  async get(id: UUID): Promise<Entity | null> {
    return this.entities.get(id) || null;
  }

  async getByObservation(observationId: UUID): Promise<Entity | null> {
    const entityId = this.byObservation.get(observationId);
    if (!entityId) return null;
    return this.entities.get(entityId) || null;
  }

  async findSimilar(partial: Partial<Entity>): Promise<Entity[]> {
    const results: Entity[] = [];
    
    for (const entity of this.entities.values()) {
      if (partial.entity_type && entity.entity_type !== partial.entity_type) {
        continue;
      }
      if (partial.attributes) {
        const keys = Object.keys(partial.attributes);
        const matches = keys.some(k => 
          entity.attributes[k] === partial.attributes![k]
        );
        if (!matches) continue;
      }
      results.push(entity);
    }
    
    return results;
  }

  async update(id: UUID, updates: Partial<Entity>): Promise<Entity> {
    const existing = this.entities.get(id);
    if (!existing) {
      throw new Error(`Entity not found: ${id}`);
    }
    const updated = { ...existing, ...updates };
    this.entities.set(id, updated);
    return updated;
  }
}