import postgres from "postgres";

let sql: postgres.Sql | null = null;

export function getSql(): postgres.Sql {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    sql = postgres(url, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}

export async function closeSql(): Promise<void> {
  if (sql) {
    await sql.end();
    sql = null;
  }
}

export async function initSchema(): Promise<void> {
  const s = getSql();
  await s`
    CREATE TABLE IF NOT EXISTS radars (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      template_id TEXT,
      active_module_version_id TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `;
  await s`
    CREATE TABLE IF NOT EXISTS radar_module_versions (
      id TEXT PRIMARY KEY,
      radar_id TEXT NOT NULL REFERENCES radars(id) ON DELETE CASCADE,
      version INTEGER NOT NULL,
      signal_definitions JSONB NOT NULL,
      branch_definitions JSONB NOT NULL,
      source_adapter_refs JSONB NOT NULL,
      model_weight_table JSONB NOT NULL,
      reducer_config JSONB NOT NULL,
      validation_rules JSONB NOT NULL,
      status TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;
  await s`
    CREATE TABLE IF NOT EXISTS radar_sources (
      id TEXT PRIMARY KEY,
      radar_id TEXT NOT NULL REFERENCES radars(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      uri TEXT NOT NULL,
      adapter_config JSONB,
      trust_profile JSONB,
      freshness_policy JSONB,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;
  await s`
    CREATE TABLE IF NOT EXISTS radar_packets (
      id TEXT PRIMARY KEY,
      radar_id TEXT NOT NULL REFERENCES radars(id) ON DELETE CASCADE,
      module_version_id TEXT NOT NULL,
      timestamp_utc TIMESTAMPTZ NOT NULL,
      model_id TEXT NOT NULL,
      sources JSONB NOT NULL,
      signal_scores JSONB NOT NULL,
      branch_assessment JSONB NOT NULL,
      uncertainties JSONB NOT NULL,
      weight REAL NOT NULL,
      received_at TIMESTAMPTZ NOT NULL
    )
  `;
  await s`
    CREATE TABLE IF NOT EXISTS radar_snapshots (
      id TEXT PRIMARY KEY,
      radar_id TEXT NOT NULL REFERENCES radars(id) ON DELETE CASCADE,
      module_version_id TEXT NOT NULL,
      snapshot_kind TEXT NOT NULL,
      as_of_utc TIMESTAMPTZ NOT NULL,
      signals JSONB NOT NULL,
      branches JSONB NOT NULL,
      model_count INTEGER NOT NULL,
      disagreement_index REAL NOT NULL,
      quality_score INTEGER NOT NULL,
      render_state JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await s`
    CREATE TABLE IF NOT EXISTS radar_audit_events (
      id TEXT PRIMARY KEY,
      radar_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await s`
    CREATE INDEX IF NOT EXISTS idx_radar_module_versions_radar ON radar_module_versions(radar_id)
  `;
  await s`
    CREATE INDEX IF NOT EXISTS idx_radar_sources_radar ON radar_sources(radar_id)
  `;
  await s`
    CREATE INDEX IF NOT EXISTS idx_radar_packets_radar ON radar_packets(radar_id)
  `;
  await s`
    CREATE INDEX IF NOT EXISTS idx_radar_snapshots_radar ON radar_snapshots(radar_id)
  `;
  await s`
    CREATE INDEX IF NOT EXISTS idx_radar_snapshots_kind ON radar_snapshots(snapshot_kind)
  `;
  await s`
    CREATE INDEX IF NOT EXISTS idx_radar_audit_radar ON radar_audit_events(radar_id)
  `;
}