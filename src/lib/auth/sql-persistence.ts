import type { Sql } from "../db/index.js";
import {
  CREATE_SESSIONS_TABLE,
  CREATE_ACCESS_TOKENS_TABLE,
  CREATE_REFRESH_TOKENS_TABLE,
  CREATE_CLIENTS_TABLE,
} from "../db/schema.js";
import type { AuthSession, AccessToken, RefreshToken, OAuthClient } from "./types.js";

interface SessionRow {
  id: string;
  subject: string;
  client_id: string;
  scopes: string;
  resource: string | null;
  extra: string | null;
  created_at: string;
  expires_at: string;
}

interface AccessTokenRow {
  token: string;
  client_id: string;
  subject: string;
  scopes: string;
  resource: string | null;
  extra: string | null;
  created_at: string;
  expires_at: string;
}

interface RefreshTokenRow {
  token: string;
  client_id: string;
  subject: string;
  scopes: string;
  resource: string | null;
  extra: string | null;
  created_at: string;
  expires_at: string;
}

interface ClientRow {
  client_id: string;
  client_secret: string;
  client_name: string;
  redirect_uris: string;
  token_endpoint_auth_method: string;
  grant_types: string;
  response_types: string;
}

function parseJson<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function toAuthSession(row: SessionRow): AuthSession {
  return {
    id: row.id,
    subject: row.subject,
    clientId: row.client_id,
    scopes: parseJson<string[]>(row.scopes) ?? [],
    resource: row.resource ?? undefined,
    extra: parseJson<Record<string, unknown>>(row.extra),
    createdAt: Math.floor(new Date(row.created_at).getTime() / 1000),
    expiresAt: Number(row.expires_at),
  };
}

function toAccessToken(row: AccessTokenRow): AccessToken {
  return {
    token: row.token,
    clientId: row.client_id,
    subject: row.subject,
    scopes: parseJson<string[]>(row.scopes) ?? [],
    resource: row.resource ?? undefined,
    extra: parseJson<Record<string, unknown>>(row.extra),
    expiresAt: Number(row.expires_at),
  };
}

function toRefreshToken(row: RefreshTokenRow): RefreshToken {
  return {
    token: row.token,
    clientId: row.client_id,
    subject: row.subject,
    scopes: parseJson<string[]>(row.scopes) ?? [],
    resource: row.resource ?? undefined,
    extra: parseJson<Record<string, unknown>>(row.extra),
    expiresAt: Number(row.expires_at),
  };
}

function toOAuthClient(row: ClientRow): OAuthClient {
  return {
    clientId: row.client_id,
    clientSecret: row.client_secret,
    clientName: row.client_name,
    redirectUris: parseJson<string[]>(row.redirect_uris) ?? [],
    tokenEndpointAuthMethod: row.token_endpoint_auth_method,
    grantTypes: parseJson<string[]>(row.grant_types) ?? ["authorization_code", "refresh_token"],
    responseTypes: parseJson<string[]>(row.response_types) ?? ["code"],
  };
}

export class SqlAuthPersistence {
  public constructor(private readonly sql: Sql) {}

  public async init(): Promise<void> {
    await this.sql.unsafe(CREATE_SESSIONS_TABLE);
    await this.sql.unsafe(CREATE_ACCESS_TOKENS_TABLE);
    await this.sql.unsafe(CREATE_REFRESH_TOKENS_TABLE);
    await this.sql.unsafe(CREATE_CLIENTS_TABLE);
  }

  public async getSession(id: string): Promise<AuthSession | undefined> {
    const now = Math.floor(Date.now() / 1000);
    const rows = await this.sql<SessionRow[]>`
      SELECT * FROM sessions WHERE id = ${id} AND expires_at > ${now}
    `;
    return rows[0] ? toAuthSession(rows[0]) : undefined;
  }

  public async setSession(session: AuthSession): Promise<void> {
    await this.sql`
      INSERT INTO sessions (id, subject, client_id, scopes, resource, extra, expires_at)
      VALUES (
        ${session.id},
        ${session.subject},
        ${session.clientId},
        ${JSON.stringify(session.scopes)},
        ${session.resource ?? null},
        ${session.extra ? JSON.stringify(session.extra) : null},
        ${session.expiresAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        subject = EXCLUDED.subject,
        client_id = EXCLUDED.client_id,
        scopes = EXCLUDED.scopes,
        resource = EXCLUDED.resource,
        extra = EXCLUDED.extra,
        expires_at = EXCLUDED.expires_at
    `;
  }

  public async deleteSession(id: string): Promise<void> {
    await this.sql`DELETE FROM sessions WHERE id = ${id}`;
  }

  public async getAccessToken(token: string): Promise<AccessToken | undefined> {
    const now = Math.floor(Date.now() / 1000);
    const rows = await this.sql<AccessTokenRow[]>`
      SELECT * FROM access_tokens WHERE token = ${token} AND expires_at > ${now}
    `;
    return rows[0] ? toAccessToken(rows[0]) : undefined;
  }

  public async setAccessToken(token: AccessToken): Promise<void> {
    await this.sql`
      INSERT INTO access_tokens (token, client_id, subject, scopes, resource, extra, expires_at)
      VALUES (
        ${token.token},
        ${token.clientId},
        ${token.subject},
        ${JSON.stringify(token.scopes)},
        ${token.resource ?? null},
        ${token.extra ? JSON.stringify(token.extra) : null},
        ${token.expiresAt}
      )
    `;
  }

  public async deleteAccessToken(token: string): Promise<void> {
    await this.sql`DELETE FROM access_tokens WHERE token = ${token}`;
  }

  public async updateAccessTokenExtra(token: string, extra?: Record<string, unknown>): Promise<boolean> {
    const rows = await this.sql.unsafe<Array<{ token: string }>>(
      "UPDATE access_tokens SET extra = $2::jsonb WHERE token = $1 RETURNING token",
      [token, extra ? JSON.stringify(extra) : null],
    );
    return rows.length > 0;
  }

  public async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    const now = Math.floor(Date.now() / 1000);
    const rows = await this.sql<RefreshTokenRow[]>`
      SELECT * FROM refresh_tokens WHERE token = ${token} AND expires_at > ${now}
    `;
    return rows[0] ? toRefreshToken(rows[0]) : undefined;
  }

  public async setRefreshToken(token: RefreshToken): Promise<void> {
    await this.sql`
      INSERT INTO refresh_tokens (token, client_id, subject, scopes, resource, extra, expires_at)
      VALUES (
        ${token.token},
        ${token.clientId},
        ${token.subject},
        ${JSON.stringify(token.scopes)},
        ${token.resource ?? null},
        ${token.extra ? JSON.stringify(token.extra) : null},
        ${token.expiresAt}
      )
    `;
  }

  public async deleteRefreshToken(token: string): Promise<void> {
    await this.sql`DELETE FROM refresh_tokens WHERE token = ${token}`;
  }

  public async updateRefreshTokenExtra(token: string, extra?: Record<string, unknown>): Promise<boolean> {
    const rows = await this.sql.unsafe<Array<{ token: string }>>(
      "UPDATE refresh_tokens SET extra = $2::jsonb WHERE token = $1 RETURNING token",
      [token, extra ? JSON.stringify(extra) : null],
    );
    return rows.length > 0;
  }

  public async getClient(clientId: string): Promise<OAuthClient | undefined> {
    const rows = await this.sql<ClientRow[]>`
      SELECT * FROM clients WHERE client_id = ${clientId}
    `;
    return rows[0] ? toOAuthClient(rows[0]) : undefined;
  }

  public async setClient(client: OAuthClient): Promise<void> {
    await this.sql`
      INSERT INTO clients (client_id, client_secret, client_name, redirect_uris, token_endpoint_auth_method, grant_types, response_types)
      VALUES (
        ${client.clientId},
        ${client.clientSecret},
        ${client.clientName},
        ${JSON.stringify(client.redirectUris)},
        ${client.tokenEndpointAuthMethod},
        ${JSON.stringify(client.grantTypes)},
        ${JSON.stringify(client.responseTypes)}
      )
      ON CONFLICT (client_id) DO UPDATE SET
        client_secret = EXCLUDED.client_secret,
        client_name = EXCLUDED.client_name,
        redirect_uris = EXCLUDED.redirect_uris,
        token_endpoint_auth_method = EXCLUDED.token_endpoint_auth_method,
        grant_types = EXCLUDED.grant_types,
        response_types = EXCLUDED.response_types
    `;
  }

  public async cleanup(): Promise<number> {
    const now = Math.floor(Date.now() / 1000);

    const sessions = await this.sql`DELETE FROM sessions WHERE expires_at <= ${now}`;
    const accessTokens = await this.sql`DELETE FROM access_tokens WHERE expires_at <= ${now}`;
    const refreshTokens = await this.sql`DELETE FROM refresh_tokens WHERE expires_at <= ${now}`;

    return sessions.count + accessTokens.count + refreshTokens.count;
  }
}
