/**
 * Database Store for Sintel
 * 
 * PostgreSQL + TimescaleDB persistence layer.
 * Provides observation history, workflow state, and entity tracking.
 */

import type { 
  Observation, 
  Workflow, 
  Entity,
  UUID,
  ISO8601 
} from '../core/types.js';
import type { Exclusion, ExclusionStore } from '../policy/exclusions.js';
import type { SignalObservation, CorrelationEdge, RadarFinding } from '@open-hax/signal-contracts';

// ============================================================================
// Database Configuration
// ============================================================================

export interface DatabaseConfig {
  /** PostgreSQL connection URL */
  readonly url?: string;
  /** Host (default: localhost) */
  readonly host?: string;
  /** Port (default: 5432) */
  readonly port?: number;
  /** Database name */
  readonly database?: string;
  /** Username */
  readonly user?: string;
  /** Password (prefer PGPASSWORD env var) */
  readonly password?: string;
  /** Max connections in pool */
  readonly maxPoolSize?: number;
  /** Enable TimescaleDB hypertables */
  readonly useTimescaleDB?: boolean;
}

// ============================================================================
// Schema Constants
// ============================================================================

export const SCHEMA_VERSION = 'sintel.v1';

export const CREATE_SCHEMA_SQL = `
-- Observations table (append-only)
CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY,
  workflow_id UUID NOT NULL,
  collector_id UUID NOT NULL,
  collector_name TEXT NOT NULL,
  strategy TEXT NOT NULL CHECK (strategy IN ('passive', 'bounded', 'unrestricted')),
  observation_type TEXT NOT NULL,
  evidence JSONB NOT NULL,
  confidence JSONB NOT NULL,
  state TEXT NOT NULL DEFAULT 'raw' CHECK (state IN ('raw', 'verified', 'enriched', 'promoted')),
  promoted_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY,
  goal TEXT NOT NULL,
  strategy TEXT NOT NULL CHECK (strategy IN ('passive', 'bounded', 'unrestricted')),
  exclusions JSONB NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('dormant', 'discovering', 'verifying', 'enriching', 'connecting', 'resolved')),
  disposition TEXT CHECK (disposition IN ('promoted', 'dismissed', 'escalated', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

-- Entities table
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('host', 'domain', 'service', 'organization', 'person')),
  attributes JSONB NOT NULL,
  confidence REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_observed_at TIMESTAMPTZ NOT NULL
);

-- Entity to observation mapping
CREATE TABLE IF NOT EXISTS entity_observations (
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  observation_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  PRIMARY KEY (entity_id, observation_id)
);

-- Signal observations (radar-compatible)
CREATE TABLE IF NOT EXISTS signal_observations (
  id TEXT PRIMARY KEY,
  record TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  scope TEXT NOT NULL,
  profile TEXT NOT NULL,
  category TEXT NOT NULL,
  severity INTEGER NOT NULL,
  confidence REAL NOT NULL,
  direction TEXT NOT NULL,
  subject_refs JSONB NOT NULL,
  evidence_refs JSONB NOT NULL,
  tags JSONB NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  summary TEXT NOT NULL,
  source_observation_id UUID REFERENCES observations(id)
);

-- Correlation edges
CREATE TABLE IF NOT EXISTS correlation_edges (
  id TEXT PRIMARY KEY,
  record TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  kind TEXT NOT NULL,
  from_signal_id TEXT NOT NULL REFERENCES signal_observations(id),
  to_signal_id TEXT NOT NULL REFERENCES signal_observations(id),
  score REAL NOT NULL,
  confidence REAL NOT NULL,
  rationale JSONB NOT NULL,
  tags JSONB NOT NULL
);

-- Radar findings
CREATE TABLE IF NOT EXISTS radar_findings (
  id TEXT PRIMARY KEY,
  record TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  profile TEXT NOT NULL,
  domain TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  signal_ids JSONB NOT NULL,
  correlation_ids JSONB NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  evidence_refs JSONB NOT NULL,
  tags JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_observations_workflow ON observations(workflow_id);
CREATE INDEX IF NOT EXISTS idx_observations_collector ON observations(collector_id);
CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(observation_type);
CREATE INDEX IF NOT EXISTS idx_observations_created ON observations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_state ON workflows(state);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_signal_observations_domain ON signal_observations(category);
CREATE INDEX IF NOT EXISTS idx_radar_findings_domain ON radar_findings(domain);
`;

export const CREATE_TIMESCALE_HYPERTABLES_SQL = `
-- Convert to TimescaleDB hypertables for time-series queries
SELECT create_hypertable('observations', 'created_at', if_not_exists => true);
SELECT create_hypertable('signal_observations', 'observed_at', if_not_exists => true);
SELECT create_hypertable('radar_findings', 'created_at', if_not_exists => true);
`;

// ============================================================================
// Database Store Interfaces
// ============================================================================

export interface DbObservationStore {
  append(observation: Observation): Promise<void>;
  get(id: UUID): Promise<Observation | null>;
  listByWorkflow(workflowId: UUID, limit?: number): Promise<Observation[]>;
  listByType(type: string, limit?: number): Promise<Observation[]>;
  updateState(id: UUID, state: Observation['state'], promotedTo?: UUID): Promise<void>;
}

export interface DbWorkflowStore {
  create(workflow: Workflow): Promise<void>;
  get(id: UUID): Promise<Workflow | null>;
  updateState(id: UUID, state: Workflow['state'], disposition?: Workflow['disposition']): Promise<void>;
  listActive(limit?: number): Promise<Workflow[]>;
  listByCreator(createdBy: UUID, limit?: number): Promise<Workflow[]>;
}

export interface DbEntityStore {
  create(entity: Entity, sourceObservationIds: UUID[]): Promise<void>;
  get(id: UUID): Promise<Entity | null>;
  listByType(type: Entity['entity_type'], limit?: number): Promise<Entity[]>;
  touch(id: UUID, lastObservedAt: ISO8601): Promise<void>;
  addObservations(entityId: UUID, observationIds: UUID[]): Promise<void>;
}

export interface DbSignalStore {
  storeSignal(signal: SignalObservation, sourceObservationId?: UUID): Promise<void>;
  storeCorrelation(edge: CorrelationEdge): Promise<void>;
  storeFinding(finding: RadarFinding): Promise<void>;
  getSignalsForDomain(domain: string, limit?: number): Promise<SignalObservation[]>;
  getFindingsForDomain(domain: string, limit?: number): Promise<RadarFinding[]>;
}

// ============================================================================
// PostgreSQL Implementations
// ============================================================================

export class PostgresObservationStore implements DbObservationStore {
  constructor(private readonly pool: any) {} // pg.Pool
  
  async append(obs: Observation): Promise<void> {
    const sql = `
      INSERT INTO observations (
        id, workflow_id, collector_id, collector_name, strategy,
        observation_type, evidence, confidence, state, promoted_to, created_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    
    await this.pool.query(sql, [
      obs.id,
      obs.workflow_id,
      obs.provenance.collector_id,
      obs.provenance.collector_name,
      obs.provenance.strategy,
      obs.evidence.type,
      JSON.stringify(obs.evidence),
      JSON.stringify(obs.confidence),
      obs.state,
      obs.promoted_to || null,
      obs.created_at,
      obs.provenance.completed_at || null
    ]);
  }
  
  async get(id: UUID): Promise<Observation | null> {
    const result = await this.pool.query(
      'SELECT * FROM observations WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.rowToObservation(result.rows[0]) : null;
  }
  
  async listByWorkflow(workflowId: UUID, limit: number = 100): Promise<Observation[]> {
    const result = await this.pool.query(
      'SELECT * FROM observations WHERE workflow_id = $1 ORDER BY created_at DESC LIMIT $2',
      [workflowId, limit]
    );
    return result.rows.map(this.rowToObservation);
  }
  
  async listByType(type: string, limit: number = 100): Promise<Observation[]> {
    const result = await this.pool.query(
      'SELECT * FROM observations WHERE observation_type = $1 ORDER BY created_at DESC LIMIT $2',
      [type, limit]
    );
    return result.rows.map(this.rowToObservation);
  }
  
  async updateState(id: UUID, state: Observation['state'], promotedTo?: UUID): Promise<void> {
    await this.pool.query(
      'UPDATE observations SET state = $1, promoted_to = $2 WHERE id = $3',
      [state, promotedTo || null, id]
    );
  }
  
  private rowToObservation(row: any): Observation {
    return {
      id: row.id,
      workflow_id: row.workflow_id,
      provenance: {
        collector_id: row.collector_id,
        collector_name: row.collector_name,
        strategy: row.strategy,
        exclusions_snapshot: { global: [], org: [], workflow: [], effective: [] },
        started_at: row.created_at,
        completed_at: row.completed_at
      },
      evidence: row.evidence,
      confidence: row.confidence,
      state: row.state,
      promoted_to: row.promoted_to,
      created_at: row.created_at
    };
  }
}

export class PostgresWorkflowStore implements DbWorkflowStore {
  constructor(private readonly pool: any) {}
  
  async create(workflow: Workflow): Promise<void> {
    const sql = `
      INSERT INTO workflows (
        id, goal, strategy, exclusions, state, disposition, created_at, created_by, resolved_at, resolved_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    await this.pool.query(sql, [
      workflow.id, workflow.goal, workflow.strategy, JSON.stringify(workflow.exclusions),
      workflow.state, workflow.disposition, workflow.created_at, workflow.created_by,
      workflow.resolved_at, workflow.resolved_by
    ]);
  }
  
  async get(id: UUID): Promise<Workflow | null> {
    const result = await this.pool.query('SELECT * FROM workflows WHERE id = $1', [id]);
    return result.rows[0] ? this.rowToWorkflow(result.rows[0]) : null;
  }
  
  async updateState(id: UUID, state: Workflow['state'], disposition?: Workflow['disposition']): Promise<void> {
    await this.pool.query(
      'UPDATE workflows SET state = $1, disposition = $2 WHERE id = $3',
      [state, disposition || null, id]
    );
  }
  
  async listActive(limit: number = 50): Promise<Workflow[]> {
    const result = await this.pool.query(
      "SELECT * FROM workflows WHERE state NOT IN ('resolved') ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
    return result.rows.map(this.rowToWorkflow);
  }
  
  async listByCreator(createdBy: UUID, limit: number = 50): Promise<Workflow[]> {
    const result = await this.pool.query(
      'SELECT * FROM workflows WHERE created_by = $1 ORDER BY created_at DESC LIMIT $2',
      [createdBy, limit]
    );
    return result.rows.map(this.rowToWorkflow);
  }
  
  private rowToWorkflow(row: any): Workflow {
    return {
      id: row.id,
      goal: row.goal,
      strategy: row.strategy,
      exclusions: row.exclusions,
      state: row.state,
      disposition: row.disposition,
      created_at: row.created_at,
      created_by: row.created_by,
      resolved_at: row.resolved_at,
      resolved_by: row.resolved_by
    };
  }
}

export class PostgresEntityStore implements DbEntityStore {
  constructor(private readonly pool: any) {}
  
  async create(entity: Entity, sourceObservationIds: UUID[]): Promise<void> {
    await this.pool.query(
      `INSERT INTO entities (id, entity_type, attributes, confidence, created_at, last_observed_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [entity.id, entity.entity_type, JSON.stringify(entity.attributes), entity.confidence, 
       entity.created_at, entity.last_observed_at]
    );
    
    for (const obsId of sourceObservationIds) {
      await this.pool.query(
        `INSERT INTO entity_observations (entity_id, observation_id) VALUES ($1, $2)`,
        [entity.id, obsId]
      );
    }
  }
  
  async get(id: UUID): Promise<Entity | null> {
    const result = await this.pool.query('SELECT * FROM entities WHERE id = $1', [id]);
    return result.rows[0] ? this.rowToEntity(result.rows[0]) : null;
  }
  
  async listByType(type: Entity['entity_type'], limit: number = 100): Promise<Entity[]> {
    const result = await this.pool.query(
      'SELECT * FROM entities WHERE entity_type = $1 ORDER BY last_observed_at DESC LIMIT $2',
      [type, limit]
    );
    return result.rows.map(this.rowToEntity);
  }
  
  async touch(id: UUID, lastObservedAt: ISO8601): Promise<void> {
    await this.pool.query(
      'UPDATE entities SET last_observed_at = $1 WHERE id = $2',
      [lastObservedAt, id]
    );
  }
  
  async addObservations(entityId: UUID, observationIds: UUID[]): Promise<void> {
    for (const obsId of observationIds) {
      await this.pool.query(
        `INSERT INTO entity_observations (entity_id, observation_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [entityId, obsId]
      );
    }
  }
  
  private rowToEntity(row: any): Entity {
    return {
      id: row.id,
      source_observation_ids: [],
      entity_type: row.entity_type,
      attributes: row.attributes,
      confidence: row.confidence,
      created_at: row.created_at,
      last_observed_at: row.last_observed_at
    };
  }
}

export class PostgresSignalStore implements DbSignalStore {
  constructor(private readonly pool: any) {}
  
  async storeSignal(signal: SignalObservation, sourceObservationId?: UUID): Promise<void> {
    await this.pool.query(
      `INSERT INTO signal_observations (
        id, record, schema_version, scope, profile, category, severity, confidence,
        direction, subject_refs, evidence_refs, tags, observed_at, summary, source_observation_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [signal.id, signal.record, signal.schema_version, signal.scope, signal.profile, 
       signal.category, signal.severity, signal.confidence, signal.direction,
       JSON.stringify(signal.subject_refs), JSON.stringify(signal.evidence_refs),
       JSON.stringify(signal.tags), signal.observed_at, signal.summary, sourceObservationId || null]
    );
  }
  
  async storeCorrelation(edge: CorrelationEdge): Promise<void> {
    await this.pool.query(
      `INSERT INTO correlation_edges (
        id, record, schema_version, kind, from_signal_id, to_signal_id, score, confidence, rationale, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [edge.id, edge.record, edge.schema_version, edge.kind, edge.from_signal_id, edge.to_signal_id,
       edge.score, edge.confidence, JSON.stringify(edge.rationale), JSON.stringify(edge.tags)]
    );
  }
  
  async storeFinding(finding: RadarFinding): Promise<void> {
    await this.pool.query(
      `INSERT INTO radar_findings (
        id, record, schema_version, profile, domain, risk_score, risk_level,
        signal_ids, correlation_ids, title, summary, evidence_refs, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [finding.id, finding.record, finding.schema_version, finding.profile, finding.domain,
       finding.risk_score, finding.risk_level, JSON.stringify(finding.signal_ids),
       JSON.stringify(finding.correlation_ids), finding.title, finding.summary,
       JSON.stringify(finding.evidence_refs), JSON.stringify(finding.tags)]
    );
  }
  
  async getSignalsForDomain(domain: string, limit: number = 50): Promise<SignalObservation[]> {
    const result = await this.pool.query(
      'SELECT * FROM signal_observations WHERE category = $1 ORDER BY observed_at DESC LIMIT $2',
      [domain, limit]
    );
    return result.rows;
  }
  
  async getFindingsForDomain(domain: string, limit: number = 50): Promise<RadarFinding[]> {
    const result = await this.pool.query(
      'SELECT * FROM radar_findings WHERE domain = $1 ORDER BY created_at DESC LIMIT $2',
      [domain, limit]
    );
    return result.rows;
  }
}

export class PostgresExclusionStore implements ExclusionStore {
  constructor(private readonly pool: any) {}
  
  async getGlobal(): Promise<Exclusion[]> {
    const result = await this.pool.query(
      'SELECT * FROM exclusions WHERE scope = $1',
      ['global']
    );
    return result.rows;
  }
  
  async getOrg(orgId: UUID): Promise<Exclusion[]> {
    const result = await this.pool.query(
      'SELECT * FROM exclusions WHERE scope = $1 AND scope_id = $2',
      ['org', orgId]
    );
    return result.rows;
  }
  
  async getWorkflow(workflowId: UUID): Promise<Exclusion[]> {
    const result = await this.pool.query(
      'SELECT * FROM exclusions WHERE scope = $1 AND scope_id = $2',
      ['workflow', workflowId]
    );
    return result.rows;
  }
  
  async addOrgExclusion(orgId: UUID, exclusion: Exclusion): Promise<void> {
    await this.pool.query(
      `INSERT INTO exclusions (category, pattern, rationale, added_by, added_at, scope, scope_id)
       VALUES ($1, $2, $3, $4, $5, 'org', $6)`,
      [exclusion.category, exclusion.pattern, exclusion.rationale, exclusion.added_by, exclusion.added_at, orgId]
    );
  }
  
  async addWorkflowExclusion(workflowId: UUID, exclusion: Exclusion): Promise<void> {
    await this.pool.query(
      `INSERT INTO exclusions (category, pattern, rationale, added_by, added_at, scope, scope_id)
       VALUES ($1, $2, $3, $4, $5, 'workflow', $6)`,
      [exclusion.category, exclusion.pattern, exclusion.rationale, exclusion.added_by, exclusion.added_at, workflowId]
    );
  }
}