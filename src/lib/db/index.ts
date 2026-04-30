import postgres from "postgres";

export type Sql = postgres.Sql;

export interface DbConfig {
  readonly connectionString: string;
  readonly maxConnections?: number;
  readonly idleTimeoutSeconds?: number;
  readonly connectionTimeoutSeconds?: number;
  readonly prepare?: boolean;
}

export function createSqlConnection(config: DbConfig): Sql {
  return postgres(config.connectionString, {
    max: config.maxConnections ?? 10,
    idle_timeout: config.idleTimeoutSeconds ?? 30,
    connect_timeout: config.connectionTimeoutSeconds ?? 10,
    prepare: config.prepare ?? false,
  });
}

export async function closeConnection(sql: Sql): Promise<void> {
  await sql.end();
}