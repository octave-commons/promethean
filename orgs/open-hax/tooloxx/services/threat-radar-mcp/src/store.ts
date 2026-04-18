import { getSql } from "./lib/postgres.js";
import type { Radar, RadarModuleVersion, SourceDefinition, RadarAssessmentPacket, ReducedSnapshot, ModelSubmission } from "@workspace/radar-core";

type RadarRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  status: string;
  template_id: string | null;
  active_module_version_id: string | null;
  created_at: Date;
  updated_at: Date;
};

type ModuleVersionRow = {
  id: string;
  radar_id: string;
  version: number;
  signal_definitions: unknown;
  branch_definitions: unknown;
  source_adapter_refs: unknown;
  model_weight_table: unknown;
  reducer_config: unknown;
  validation_rules: unknown;
  status: string;
  created_by: string;
  created_at: Date;
};

type SourceRow = {
  id: string;
  radar_id: string;
  kind: string;
  name: string;
  uri: string;
  adapter_config: unknown;
  trust_profile: unknown;
  freshness_policy: unknown;
  status: string;
  created_at: Date;
};

type PacketRow = {
  id: string;
  radar_id: string;
  module_version_id: string;
  timestamp_utc: Date;
  model_id: string;
  sources: unknown;
  signal_scores: unknown;
  branch_assessment: unknown;
  uncertainties: unknown;
  weight: number;
  received_at: Date;
};

type SnapshotRow = {
  id: string;
  radar_id: string;
  module_version_id: string;
  snapshot_kind: string;
  as_of_utc: Date;
  signals: unknown;
  branches: unknown;
  model_count: number;
  disagreement_index: number;
  quality_score: number;
  render_state: unknown;
  created_at: Date;
};

type AuditRow = {
  id: string;
  radar_id: string;
  event_type: string;
  payload: unknown;
  created_at: Date;
};

function nowIso(): string {
  return new Date().toISOString();
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function decodeJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export class PostgresRadarStore {
  private json(value: unknown) {
    return getSql().json(cloneJsonValue(value) as never);
  }

  async getRadar(radarId: string): Promise<Radar | null> {
    const sql = getSql();
    const rows = await sql<RadarRow[]>`
      SELECT * FROM radars WHERE id = ${radarId}
    `;
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category,
      status: r.status as Radar["status"],
      template_id: r.template_id ?? undefined,
      active_module_version_id: r.active_module_version_id ?? undefined,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    };
  }

  async listRadars(): Promise<Radar[]> {
    const sql = getSql();
    const rows = await sql<RadarRow[]>`
      SELECT * FROM radars ORDER BY created_at DESC
    `;
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category,
      status: r.status as Radar["status"],
      template_id: r.template_id ?? undefined,
      active_module_version_id: r.active_module_version_id ?? undefined,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    }));
  }

  async createRadar(radar: Radar): Promise<void> {
    const sql = getSql();
    await sql`
      INSERT INTO radars (id, slug, name, category, status, template_id, active_module_version_id, created_at, updated_at)
      VALUES (
        ${radar.id},
        ${radar.slug},
        ${radar.name},
        ${radar.category},
        ${radar.status},
        ${radar.template_id ?? null},
        ${radar.active_module_version_id ?? null},
        ${radar.created_at},
        ${radar.updated_at}
      )
    `;
  }

  async updateRadar(radarId: string, updates: Partial<Radar>): Promise<void> {
    const sql = getSql();
    await sql`
      UPDATE radars SET
        updated_at = ${nowIso()},
        ${updates.status !== undefined ? sql`status = ${updates.status},` : sql``}
        ${updates.active_module_version_id !== undefined ? sql`active_module_version_id = ${updates.active_module_version_id ?? null},` : sql``}
      WHERE id = ${radarId}
    `;
  }

  async getModuleVersion(moduleVersionId: string): Promise<RadarModuleVersion | null> {
    const sql = getSql();
    const rows = await sql<ModuleVersionRow[]>`
      SELECT * FROM radar_module_versions WHERE id = ${moduleVersionId}
    `;
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      radar_id: r.radar_id,
      version: r.version,
      signal_definitions: decodeJsonField<RadarModuleVersion["signal_definitions"]>(r.signal_definitions, []),
      branch_definitions: decodeJsonField<RadarModuleVersion["branch_definitions"]>(r.branch_definitions, []),
      source_adapter_refs: decodeJsonField<RadarModuleVersion["source_adapter_refs"]>(r.source_adapter_refs, []),
      model_weight_table: decodeJsonField<RadarModuleVersion["model_weight_table"]>(r.model_weight_table, {}),
      reducer_config: decodeJsonField<RadarModuleVersion["reducer_config"]>(r.reducer_config, {
        signal_quantile_low: 0.25,
        signal_quantile_high: 0.75,
        disagreement_divisor: 2,
      }),
      validation_rules: decodeJsonField<RadarModuleVersion["validation_rules"]>(r.validation_rules, {}),
      status: r.status as RadarModuleVersion["status"],
      created_by: r.created_by,
      created_at: r.created_at.toISOString(),
    };
  }

  async listModuleVersions(radarId: string): Promise<RadarModuleVersion[]> {
    const sql = getSql();
    const rows = await sql<ModuleVersionRow[]>`
      SELECT * FROM radar_module_versions WHERE radar_id = ${radarId} ORDER BY version DESC
    `;
    return rows.map((r) => ({
      id: r.id,
      radar_id: r.radar_id,
      version: r.version,
      signal_definitions: decodeJsonField<RadarModuleVersion["signal_definitions"]>(r.signal_definitions, []),
      branch_definitions: decodeJsonField<RadarModuleVersion["branch_definitions"]>(r.branch_definitions, []),
      source_adapter_refs: decodeJsonField<RadarModuleVersion["source_adapter_refs"]>(r.source_adapter_refs, []),
      model_weight_table: decodeJsonField<RadarModuleVersion["model_weight_table"]>(r.model_weight_table, {}),
      reducer_config: decodeJsonField<RadarModuleVersion["reducer_config"]>(r.reducer_config, {
        signal_quantile_low: 0.25,
        signal_quantile_high: 0.75,
        disagreement_divisor: 2,
      }),
      validation_rules: decodeJsonField<RadarModuleVersion["validation_rules"]>(r.validation_rules, {}),
      status: r.status as RadarModuleVersion["status"],
      created_by: r.created_by,
      created_at: r.created_at.toISOString(),
    }));
  }

  async createModuleVersion(mv: RadarModuleVersion): Promise<void> {
    const sql = getSql();
    await sql`
      INSERT INTO radar_module_versions (
        id, radar_id, version, signal_definitions, branch_definitions,
        source_adapter_refs, model_weight_table, reducer_config, validation_rules,
        status, created_by, created_at
      ) VALUES (
        ${mv.id},
        ${mv.radar_id},
        ${mv.version},
        ${this.json(mv.signal_definitions)},
        ${this.json(mv.branch_definitions)},
        ${this.json(mv.source_adapter_refs)},
        ${this.json(mv.model_weight_table)},
        ${this.json(mv.reducer_config)},
        ${this.json(mv.validation_rules)},
        ${mv.status},
        ${mv.created_by},
        ${mv.created_at}
      )
    `;
  }

  async listSources(radarId: string): Promise<SourceDefinition[]> {
    const sql = getSql();
    const rows = await sql<SourceRow[]>`
      SELECT * FROM radar_sources WHERE radar_id = ${radarId}
    `;
    return rows.map((r) => ({
      id: r.id,
      radar_id: r.radar_id,
      kind: r.kind as SourceDefinition["kind"],
      name: r.name,
      uri: r.uri,
      adapter_config: decodeJsonField<SourceDefinition["adapter_config"]>(r.adapter_config, {}),
      trust_profile: decodeJsonField<SourceDefinition["trust_profile"]>(r.trust_profile, {
        default_confidence: 0.5,
        quality: "secondary",
      }),
      freshness_policy: decodeJsonField<SourceDefinition["freshness_policy"]>(r.freshness_policy, {}),
      status: r.status as SourceDefinition["status"],
    }));
  }

  async createSource(source: SourceDefinition): Promise<void> {
    const sql = getSql();
    await sql`
      INSERT INTO radar_sources (id, radar_id, kind, name, uri, adapter_config, trust_profile, freshness_policy, status, created_at)
      VALUES (
        ${source.id},
        ${source.radar_id},
        ${source.kind},
        ${source.name},
        ${source.uri},
        ${this.json(source.adapter_config ?? {})},
        ${this.json(source.trust_profile ?? {})},
        ${this.json(source.freshness_policy ?? {})},
        ${source.status},
        ${nowIso()}
      )
    `;
  }

  async listSubmissions(radarId: string): Promise<ModelSubmission[]> {
    const sql = getSql();
    const rows = await sql<PacketRow[]>`
      SELECT * FROM radar_packets WHERE radar_id = ${radarId} ORDER BY received_at ASC
    `;
    return rows.map((r) => ({
      packet: {
        thread_id: r.id,
        radar_id: r.radar_id,
        module_version_id: r.module_version_id,
        timestamp_utc: r.timestamp_utc.toISOString(),
        model_id: r.model_id,
        sources: decodeJsonField<RadarAssessmentPacket["sources"]>(r.sources, []),
        signal_scores: decodeJsonField<RadarAssessmentPacket["signal_scores"]>(r.signal_scores, {}),
        branch_assessment: decodeJsonField<RadarAssessmentPacket["branch_assessment"]>(r.branch_assessment, []),
        uncertainties: decodeJsonField<RadarAssessmentPacket["uncertainties"]>(r.uncertainties, []),
      },
      weight: r.weight,
      receivedAt: r.received_at.toISOString(),
    }));
  }

  async createSubmission(packet: RadarAssessmentPacket, weight: number): Promise<void> {
    const sql = getSql();
    await sql`
      INSERT INTO radar_packets (
        id, radar_id, module_version_id, timestamp_utc, model_id,
        sources, signal_scores, branch_assessment, uncertainties,
        weight, received_at
      ) VALUES (
        ${packet.thread_id},
        ${packet.radar_id},
        ${packet.module_version_id},
        ${packet.timestamp_utc},
        ${packet.model_id},
        ${this.json(packet.sources)},
        ${this.json(packet.signal_scores)},
        ${this.json(packet.branch_assessment)},
        ${this.json(packet.uncertainties)},
        ${weight},
        ${nowIso()}
      )
    `;
  }

  async getLatestLiveSnapshot(radarId: string): Promise<ReducedSnapshot | null> {
    const sql = getSql();
    const rows = await sql<SnapshotRow[]>`
      SELECT * FROM radar_snapshots
      WHERE radar_id = ${radarId} AND snapshot_kind = 'live'
      ORDER BY as_of_utc DESC LIMIT 1
    `;
    if (rows.length === 0) return null;
    return this.rowToSnapshot(rows[0]);
  }

  async getLatestDailySnapshot(radarId: string): Promise<ReducedSnapshot | null> {
    const sql = getSql();
    const rows = await sql<SnapshotRow[]>`
      SELECT * FROM radar_snapshots
      WHERE radar_id = ${radarId} AND snapshot_kind = 'daily'
      ORDER BY as_of_utc DESC LIMIT 1
    `;
    if (rows.length === 0) return null;
    return this.rowToSnapshot(rows[0]);
  }

  async createSnapshot(snapshot: ReducedSnapshot): Promise<void> {
    const sql = getSql();
    await sql`
      INSERT INTO radar_snapshots (
        id, radar_id, module_version_id, snapshot_kind, as_of_utc,
        signals, branches, model_count, disagreement_index, quality_score, render_state
      ) VALUES (
        ${snapshot.id},
        ${snapshot.radar_id},
        ${snapshot.module_version_id},
        ${snapshot.snapshot_kind},
        ${snapshot.as_of_utc},
        ${this.json(snapshot.signals)},
        ${this.json(snapshot.branches)},
        ${snapshot.model_count},
        ${snapshot.disagreement_index},
        ${snapshot.quality_score},
        ${this.json(snapshot.render_state)}
      )
    `;
  }

  async listDailySnapshots(radarId: string): Promise<ReducedSnapshot[]> {
    const sql = getSql();
    const rows = await sql<SnapshotRow[]>`
      SELECT * FROM radar_snapshots
      WHERE radar_id = ${radarId} AND snapshot_kind = 'daily'
      ORDER BY as_of_utc DESC
    `;
    return rows.map((r) => this.rowToSnapshot(r));
  }

  private rowToSnapshot(r: SnapshotRow): ReducedSnapshot {
    return {
      id: r.id,
      radar_id: r.radar_id,
      module_version_id: r.module_version_id,
      snapshot_kind: r.snapshot_kind as ReducedSnapshot["snapshot_kind"],
      as_of_utc: r.as_of_utc.toISOString(),
      signals: decodeJsonField<ReducedSnapshot["signals"]>(r.signals, {}),
      branches: decodeJsonField<ReducedSnapshot["branches"]>(r.branches, []),
      model_count: r.model_count,
      disagreement_index: r.disagreement_index,
      quality_score: r.quality_score,
      render_state: decodeJsonField<ReducedSnapshot["render_state"]>(r.render_state, {}),
    };
  }

  async createAuditEvent(radarId: string, eventType: string, payload: object): Promise<void> {
    const sql = getSql();
    const id = `${radarId}:${eventType}:${Date.now()}`;
    await sql`
      INSERT INTO radar_audit_events (id, radar_id, event_type, payload)
      VALUES (${id}, ${radarId}, ${eventType}, ${this.json(payload)})
    `;
  }

  async listAuditEvents(radarId: string, limit = 100): Promise<Array<{ event_type: string; payload: object; created_at: string }>> {
    const sql = getSql();
    const rows = await sql<AuditRow[]>`
      SELECT * FROM radar_audit_events
      WHERE radar_id = ${radarId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => ({
      event_type: r.event_type,
      payload: decodeJsonField<object>(r.payload, {}),
      created_at: r.created_at.toISOString(),
    }));
  }
}
