import postgres from "postgres";
import type { Persistence, SerializableClient, SerializableCode, SerializableRefreshTokenReuse, SerializableToken } from "./types.js";

let sql: postgres.Sql | null = null;

export function getSql(): postgres.Sql {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    sql = postgres(databaseUrl);
  }
  return sql;
}

export async function initSchema(): Promise<void> {
  const db = getSql();
  await db`
    CREATE TABLE IF NOT EXISTS oauth_codes (
      code TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS oauth_tokens (
      token TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
      token TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS oauth_refresh_reuse (
      old_token TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS oauth_clients (
      client_id TEXT PRIMARY KEY,
      value JSONB NOT NULL
    )
  `;
}

export async function closeSql(): Promise<void> {
  if (sql) {
    await sql.end();
    sql = null;
  }
}

export class PostgresPersistence implements Persistence {
  async init(): Promise<void> {
    await initSchema();
    await this.cleanup();
  }

  async stop(): Promise<void> {}

  async getCode(code: string): Promise<SerializableCode | undefined> {
    const rows = await getSql()<{ value: string }[]>`
      SELECT value FROM oauth_codes WHERE code = ${code} AND expires_at > NOW()
    `;
    if (rows.length === 0) return undefined;
    return JSON.parse(rows[0].value) as SerializableCode;
  }

  async setCode(code: string, value: SerializableCode): Promise<void> {
    const expiresAt = new Date(value.expiresAt * 1000);
    await getSql()`
      INSERT INTO oauth_codes (code, value, expires_at)
      VALUES (${code}, ${JSON.stringify(value)}::jsonb, ${expiresAt})
      ON CONFLICT (code) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
    `;
  }

  async deleteCode(code: string): Promise<void> {
    await getSql()`DELETE FROM oauth_codes WHERE code = ${code}`;
  }

  async getAccessToken(token: string): Promise<SerializableToken | undefined> {
    const rows = await getSql()<{ value: string }[]>`
      SELECT value FROM oauth_tokens WHERE token = ${token} AND expires_at > NOW()
    `;
    if (rows.length === 0) return undefined;
    return JSON.parse(rows[0].value) as SerializableToken;
  }

  async setAccessToken(token: string, value: SerializableToken): Promise<void> {
    const expiresAt = new Date(value.expiresAt * 1000);
    await getSql()`
      INSERT INTO oauth_tokens (token, value, expires_at)
      VALUES (${token}, ${JSON.stringify(value)}::jsonb, ${expiresAt})
      ON CONFLICT (token) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
    `;
  }

  async deleteAccessToken(token: string): Promise<void> {
    await getSql()`DELETE FROM oauth_tokens WHERE token = ${token}`;
  }

  async getRefreshToken(token: string): Promise<SerializableToken | undefined> {
    const rows = await getSql()<{ value: string }[]>`
      SELECT value FROM oauth_refresh_tokens WHERE token = ${token} AND expires_at > NOW()
    `;
    if (rows.length === 0) return undefined;
    return JSON.parse(rows[0].value) as SerializableToken;
  }

  async setRefreshToken(token: string, value: SerializableToken): Promise<void> {
    const expiresAt = new Date(value.expiresAt * 1000);
    await getSql()`
      INSERT INTO oauth_refresh_tokens (token, value, expires_at)
      VALUES (${token}, ${JSON.stringify(value)}::jsonb, ${expiresAt})
      ON CONFLICT (token) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
    `;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await getSql()`DELETE FROM oauth_refresh_tokens WHERE token = ${token}`;
  }

  async consumeRefreshToken(token: string): Promise<SerializableToken | undefined> {
    const rows = await getSql()<{ value: string }[]>`
      SELECT value FROM oauth_refresh_tokens WHERE token = ${token} AND expires_at > NOW()
    `;
    if (rows.length === 0) return undefined;
    await getSql()`DELETE FROM oauth_refresh_tokens WHERE token = ${token}`;
    return JSON.parse(rows[0].value) as SerializableToken;
  }

  async getRefreshTokenReuse(oldRefreshToken: string): Promise<SerializableRefreshTokenReuse | undefined> {
    const rows = await getSql()<{ value: string }[]>`
      SELECT value FROM oauth_refresh_reuse WHERE old_token = ${oldRefreshToken} AND expires_at > NOW()
    `;
    if (rows.length === 0) return undefined;
    return JSON.parse(rows[0].value) as SerializableRefreshTokenReuse;
  }

  async setRefreshTokenReuse(oldRefreshToken: string, value: SerializableRefreshTokenReuse): Promise<void> {
    const expiresAt = new Date(value.expiresAt * 1000);
    await getSql()`
      INSERT INTO oauth_refresh_reuse (old_token, value, expires_at)
      VALUES (${oldRefreshToken}, ${JSON.stringify(value)}::jsonb, ${expiresAt})
      ON CONFLICT (old_token) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
    `;
  }

  async getClient(clientId: string): Promise<SerializableClient | undefined> {
    const rows = await getSql()<{ value: string }[]>`
      SELECT value FROM oauth_clients WHERE client_id = ${clientId}
    `;
    if (rows.length === 0) return undefined;
    return JSON.parse(rows[0].value) as SerializableClient;
  }

  async setClient(clientId: string, value: SerializableClient): Promise<void> {
    await getSql()`
      INSERT INTO oauth_clients (client_id, value)
      VALUES (${clientId}, ${JSON.stringify(value)}::jsonb)
      ON CONFLICT (client_id) DO UPDATE SET value = EXCLUDED.value
    `;
  }

  async cleanup(): Promise<number> {
    const codes = await getSql()`DELETE FROM oauth_codes WHERE expires_at <= NOW()`;
    const tokens = await getSql()`DELETE FROM oauth_tokens WHERE expires_at <= NOW()`;
    const refresh = await getSql()`DELETE FROM oauth_refresh_tokens WHERE expires_at <= NOW()`;
    const reuse = await getSql()`DELETE FROM oauth_refresh_reuse WHERE expires_at <= NOW()`;
    return codes.count + tokens.count + refresh.count + reuse.count;
  }
}