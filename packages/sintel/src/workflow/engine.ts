/**
 * Workflow Engine
 * 
 * Implements the workflow state machine for Sintel.
 * Workflows are the operator-facing unit governing all observation collection.
 */

import type {
  UUID,
  ISO8601,
  Workflow,
  WorkflowState,
  WorkflowDisposition,
  StrategyTier,
  ExclusionSet
} from '../core/types.js';

// ============================================================================
// State Machine Definition
// ============================================================================

/**
 * Valid state transitions.
 */
const VALID_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  dormant: ['discovering'],
  discovering: ['verifying', 'dormant'],
  verifying: ['enriching', 'discovering'],
  enriching: ['connecting', 'verifying'],
  connecting: ['resolved', 'enriching'],
  resolved: ['dormant'] // Can be reactivated
};

/**
 * Irreversible audit points.
 * Actions at these points are permanently recorded.
 */
export interface AuditPoint {
  readonly workflow_id: UUID;
  readonly point: 'discovery_initiated' | 'verification_attempted' | 'entity_promoted' | 'workflow_resolved';
  readonly timestamp: ISO8601;
  readonly actor: UUID;
  readonly details: Record<string, unknown>;
}

// ============================================================================
// Workflow Store Interface
// ============================================================================

/**
 * Persistence interface for workflows.
 * Implementations can use in-memory, database, or file storage.
 */
export interface WorkflowStore {
  create(workflow: Workflow): Promise<Workflow>;
  get(id: UUID): Promise<Workflow | null>;
  update(id: UUID, updates: Partial<Workflow>): Promise<Workflow>;
  list(filter?: WorkflowFilter): Promise<Workflow[]>;
  addAuditPoint(point: AuditPoint): Promise<void>;
  getAuditLog(workflowId: UUID): Promise<AuditPoint[]>;
}

/**
 * Filter criteria for workflow listing.
 */
export interface WorkflowFilter {
  readonly state?: WorkflowState;
  readonly strategy?: StrategyTier;
  readonly created_by?: UUID;
  readonly created_after?: ISO8601;
  readonly created_before?: ISO8601;
}

// ============================================================================
// Workflow Engine
// ============================================================================

/**
 * The workflow engine manages state transitions and audit logging.
 */
export class WorkflowEngine {
  constructor(private readonly store: WorkflowStore) {}

  /**
   * Create a new workflow.
   * Strategy tier and exclusions are locked at creation.
   */
  async create(params: {
    goal: string;
    strategy: StrategyTier;
    exclusions: ExclusionSet;
    created_by: UUID;
  }): Promise<Workflow> {
    const workflow: Workflow = {
      id: crypto.randomUUID(),
      goal: params.goal,
      strategy: params.strategy,
      exclusions: params.exclusions,
      state: 'dormant',
      created_at: new Date().toISOString(),
      created_by: params.created_by
    };

    const created = await this.store.create(workflow);
    
    await this.store.addAuditPoint({
      workflow_id: created.id,
      point: 'discovery_initiated',
      timestamp: created.created_at,
      actor: created.created_by,
      details: {
        goal: created.goal,
        strategy: created.strategy,
        exclusion_count: created.exclusions.effective.length
      }
    });

    return created;
  }

  /**
   * Transition workflow to a new state.
   * Throws if transition is invalid.
   */
  async transition(
    workflowId: UUID,
    newState: WorkflowState,
    actor: UUID
  ): Promise<Workflow> {
    const workflow = await this.store.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const validNext = VALID_TRANSITIONS[workflow.state];
    if (!validNext.includes(newState)) {
      throw new Error(
        `Invalid transition: ${workflow.state} → ${newState}. ` +
        `Valid: ${validNext.join(', ')}`
      );
    }

    const updated = await this.store.update(workflowId, { state: newState });

    // Record audit point for specific transitions
    if (newState === 'verifying') {
      await this.store.addAuditPoint({
        workflow_id: workflowId,
        point: 'verification_attempted',
        timestamp: new Date().toISOString(),
        actor,
        details: { from_state: workflow.state }
      });
    }

    return updated;
  }

  /**
   * Resolve a workflow with a disposition.
   */
  async resolve(
    workflowId: UUID,
    disposition: WorkflowDisposition,
    actor: UUID
  ): Promise<Workflow> {
    const workflow = await this.store.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.state !== 'connecting') {
      throw new Error(
        `Can only resolve from 'connecting' state. Current: ${workflow.state}`
      );
    }

    const resolved = await this.store.update(workflowId, {
      state: 'resolved',
      disposition,
      resolved_at: new Date().toISOString(),
      resolved_by: actor
    });

    await this.store.addAuditPoint({
      workflow_id: workflowId,
      point: 'workflow_resolved',
      timestamp: resolved.resolved_at!,
      actor,
      details: { disposition }
    });

    return resolved;
  }

  /**
   * Reactivate a resolved workflow.
   * Creates a new workflow cycle but preserves history.
   */
  async reactivate(workflowId: UUID, actor: UUID): Promise<Workflow> {
    const workflow = await this.store.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.state !== 'resolved') {
      throw new Error(
        `Can only reactivate from 'resolved' state. Current: ${workflow.state}`
      );
    }

    return this.store.update(workflowId, {
      state: 'dormant',
      disposition: undefined,
      resolved_at: undefined,
      resolved_by: undefined
    });
  }

  /**
   * Get the complete audit log for a workflow.
   */
  async getAuditLog(workflowId: UUID): Promise<AuditPoint[]> {
    return this.store.getAuditLog(workflowId);
  }
}

// ============================================================================
// Authorization
// ============================================================================

import { TIER_AUTHORIZATION } from '../core/types.js';

/**
 * Check if an actor can use a strategy tier.
 */
export function canAuthorize(
  strategy: StrategyTier,
  actorRoles: string[]
): boolean {
  const required = TIER_AUTHORIZATION[strategy];
  return required.some(role => actorRoles.includes(role));
}

/**
 * Get human-readable authorization requirements.
 */
export function getAuthorizationRequirement(strategy: StrategyTier): string {
  switch (strategy) {
    case 'passive':
      return 'Any verified operator';
    case 'bounded':
      return 'Senior operator or automated with review';
    case 'unrestricted':
      return 'Human senior operator with explicit justification';
  }
}