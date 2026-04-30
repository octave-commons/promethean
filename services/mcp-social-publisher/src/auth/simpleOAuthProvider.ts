import type { Response } from "express";
import type { AuthorizationParams, OAuthServerProvider } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import {
  InvalidGrantError,
  InvalidScopeError,
  InvalidTokenError,
} from "@modelcontextprotocol/sdk/server/auth/errors.js";
import type {
  OAuthClientInformationFull,
  OAuthTokenRevocationRequest,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";

import { InMemoryClientsStore, type ClientInfo } from "./inMemoryClients.js";
import type {
  Persistence,
  SerializableCode,
  SerializableRefreshTokenReuse,
  SerializableToken,
  SerializableTokenResponse,
} from "./types.js";

type PendingAuth = {
  rid: string;
  clientId: string;
  redirectUri: string;
  state?: string;
  scopes: string[];
  codeChallenge: string;
  resource?: URL;
  subject?: string;
  extra?: Record<string, unknown>;
  createdAt: number;
  used: boolean;
};

type AuthCode = {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scopes: string[];
  resource?: URL;
  subject: string;
  extra?: Record<string, unknown>;
  expiresAt: number;
};

type RefreshToken = {
  token: string;
  clientId: string;
  scopes: string[];
  resource?: URL;
  subject: string;
  extra?: Record<string, unknown>;
  expiresAt: number;
};

type AccessToken = {
  token: string;
  clientId: string;
  scopes: string[];
  resource?: URL;
  subject: string;
  extra?: Record<string, unknown>;
  expiresAt: number;
};

type ProviderConfig = {
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
  refreshReuseWindowSeconds: number;
};

export class SimpleOAuthProvider implements OAuthServerProvider {
  public readonly clientsStore: InMemoryClientsStore;

  private readonly pending = new Map<string, PendingAuth>();
  private readonly codes = new Map<string, AuthCode>();
  private readonly accessTokens = new Map<string, AccessToken>();
  private readonly refreshTokens = new Map<string, RefreshToken>();
  private readonly config: ProviderConfig;

  public constructor(
    private readonly uiBaseUrl: URL,
    private readonly autoApprove: boolean,
    bootstrapClients: readonly ClientInfo[] = [],
    accessTtlSeconds = 60 * 60,
    refreshTtlSeconds = 30 * 24 * 60 * 60,
    private readonly persistence?: Persistence,
  ) {
    this.clientsStore = new InMemoryClientsStore(bootstrapClients, persistence);
    this.config = {
      accessTtlSeconds,
      refreshTtlSeconds,
      refreshReuseWindowSeconds: 60,
    };
  }

  public async stop(): Promise<void> {
    if (this.persistence) {
      await this.persistence.stop();
    }
  }

  public async cleanup(): Promise<void> {
    if (this.persistence) {
      await this.persistence.cleanup();
    }
  }

  public async authorize(client: OAuthClientInformationFull, params: AuthorizationParams, res: Response): Promise<void> {
    const rid = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const scopes = params.scopes ?? [];

    this.pending.set(rid, {
      rid,
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      state: params.state,
      scopes,
      codeChallenge: params.codeChallenge,
      resource: params.resource,
      createdAt: now,
      used: false,
    });

    const loginUrl = new URL("/login", this.uiBaseUrl);
    loginUrl.searchParams.set("rid", rid);
    res.redirect(loginUrl.toString());
  }

  public async challengeForAuthorizationCode(_client: OAuthClientInformationFull, authorizationCode: string): Promise<string> {
    const record = this.codes.get(authorizationCode) ?? await this.getPersistedCode(authorizationCode);
    if (!record) {
      throw new InvalidGrantError("Authorization code not found");
    }
    return record.codeChallenge;
  }

  public async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
    codeVerifier?: string,
    redirectUri?: string,
    resource?: URL,
  ): Promise<OAuthTokens> {
    const record = this.codes.get(authorizationCode) ?? await this.getPersistedCode(authorizationCode);
    if (!record) {
      throw new InvalidGrantError("Authorization code not found");
    }
    if (record.clientId !== client.client_id) {
      throw new InvalidGrantError("Client ID mismatch");
    }
    if (redirectUri && redirectUri !== record.redirectUri) {
      throw new InvalidGrantError("Redirect URI mismatch");
    }
    if (resource && record.resource && resource.toString() !== record.resource.toString()) {
      throw new InvalidGrantError("Resource mismatch");
    }

    if (record.codeChallenge.startsWith("S256=")) {
      if (!codeVerifier) {
        throw new InvalidGrantError("code_verifier required when code_challenge is present");
      }
      const expected = record.codeChallenge.slice(5);
      const actual = await this.hashCodeVerifier(codeVerifier);
      if (expected !== actual) {
        throw new InvalidGrantError("PKCE verification failed");
      }
    }

    this.codes.delete(authorizationCode);
    await this.deletePersistedCode(authorizationCode);

    const scopes = record.scopes.includes("mcp") ? record.scopes : [...record.scopes, "mcp"];
    return this.issueTokens(record.clientId, scopes, record.resource, record.subject, record.extra);
  }

  public async exchangeRefreshToken(
    client: OAuthClientInformationFull,
    refreshToken: string,
    scopes?: string[],
    resource?: URL,
  ): Promise<OAuthTokens> {
    const requestedScopes = scopes && scopes.length > 0 ? scopes : undefined;
    const requestedScopeKey = requestedScopes ? this.toScopeKey(requestedScopes) : undefined;
    const replay = await this.maybeGetRefreshReuse(refreshToken, client.client_id, requestedScopeKey, resource);
    if (replay) {
      return replay;
    }

    const record = this.refreshTokens.get(refreshToken) ?? await this.getPersistedRefreshToken(refreshToken);
    if (!record) {
      throw new InvalidGrantError("Refresh token not found");
    }
    if (record.clientId !== client.client_id) {
      throw new InvalidGrantError("Client ID mismatch");
    }
    if (resource && record.resource && resource.toString() !== record.resource.toString()) {
      throw new InvalidGrantError("Resource mismatch");
    }

    const now = Math.floor(Date.now() / 1000);
    if (record.expiresAt <= now) {
      this.refreshTokens.delete(refreshToken);
      await this.deletePersistedRefreshToken(refreshToken);
      throw new InvalidGrantError("Refresh token expired");
    }

    const finalScopes = requestedScopes ?? record.scopes;
    for (const scope of finalScopes) {
      if (!record.scopes.includes(scope)) {
        throw new InvalidScopeError(`Scope not authorized: ${scope}`);
      }
    }

    this.refreshTokens.delete(refreshToken);
    const consumed = this.persistence
      ? await this.persistence.consumeRefreshToken(refreshToken)
      : this.serializeToken(record);
    if (!consumed) {
      throw new InvalidGrantError("Refresh token not found");
    }

    const scopesWithMcp = finalScopes.includes("mcp") ? finalScopes : [...finalScopes, "mcp"];
    const tokens = await this.issueTokens(record.clientId, scopesWithMcp, record.resource, record.subject, record.extra);
    await this.setPersistedRefreshTokenReuse(refreshToken, {
      oldRefreshToken: refreshToken,
      clientId: record.clientId,
      resource: this.toResourceString(resource ?? record.resource),
      scopeKey: this.toScopeKey(finalScopes),
      tokens: this.buildTokenResponse(tokens),
      expiresAt: now + this.config.refreshReuseWindowSeconds,
    });
    return tokens;
  }

  public async verifyAccessToken(token: string): Promise<AuthInfo> {
    const record = this.accessTokens.get(token) ?? await this.getPersistedAccessToken(token);
    if (!record) {
      throw new InvalidTokenError("Access token not found");
    }
    if (record.expiresAt <= Math.floor(Date.now() / 1000)) {
      this.accessTokens.delete(token);
      await this.deletePersistedAccessToken(token);
      throw new InvalidTokenError("Access token expired");
    }
    return {
      token: record.token,
      clientId: record.clientId,
      scopes: record.scopes,
      expiresAt: record.expiresAt,
      resource: record.resource,
      extra: record.extra,
    };
  }

  public async revokeToken(client: OAuthClientInformationFull, request: OAuthTokenRevocationRequest): Promise<void> {
    const token = (request as { token?: string }).token;
    const hint = (request as { token_type_hint?: string }).token_type_hint;
    if (!token) {
      return;
    }

    if (!hint || hint === "access_token") {
      const accessToken = this.accessTokens.get(token) ?? await this.getPersistedAccessToken(token);
      if (accessToken && accessToken.clientId === client.client_id) {
        this.accessTokens.delete(token);
        await this.deletePersistedAccessToken(token);
      }
    }

    if (!hint || hint === "refresh_token") {
      const refreshToken = this.refreshTokens.get(token) ?? await this.getPersistedRefreshToken(token);
      if (refreshToken && refreshToken.clientId === client.client_id) {
        this.refreshTokens.delete(token);
        await this.deletePersistedRefreshToken(token);
      }
    }
  }

  public getPending(rid: string): PendingAuth | undefined {
    return this.pending.get(rid);
  }

  public setSubject(rid: string, subject: string, extra?: Record<string, unknown>): void {
    const record = this.pending.get(rid);
    if (!record) {
      throw new Error("invalid_request");
    }
    record.subject = subject;
    record.extra = extra;
  }

  public async approve(rid: string): Promise<string> {
    const record = this.pending.get(rid);
    if (!record || record.used || !record.subject) {
      throw new Error("invalid_request");
    }
    record.used = true;

    const now = Math.floor(Date.now() / 1000);
    const code = randomToken();
    const authCode: AuthCode = {
      code,
      clientId: record.clientId,
      redirectUri: record.redirectUri,
      codeChallenge: record.codeChallenge,
      scopes: record.scopes,
      resource: record.resource,
      subject: record.subject,
      extra: record.extra,
      expiresAt: now + 5 * 60,
    };

    this.codes.set(code, authCode);
    await this.setPersistedCode(code, authCode);

    const redirect = new URL(record.redirectUri);
    redirect.searchParams.set("code", code);
    if (record.state) {
      redirect.searchParams.set("state", record.state);
    }
    return redirect.toString();
  }

  public deny(rid: string, error = "access_denied", description?: string): string {
    const record = this.pending.get(rid);
    if (!record) {
      throw new Error("invalid_request");
    }
    record.used = true;
    const redirect = new URL(record.redirectUri);
    redirect.searchParams.set("error", error);
    if (description) {
      redirect.searchParams.set("error_description", description);
    }
    if (record.state) {
      redirect.searchParams.set("state", record.state);
    }
    return redirect.toString();
  }

  public shouldAutoApprove(): boolean {
    return this.autoApprove;
  }

  private async issueTokens(
    clientId: string,
    scopes: string[],
    resource: URL | undefined,
    subject: string,
    extra?: Record<string, unknown>,
  ): Promise<OAuthTokens> {
    const now = Math.floor(Date.now() / 1000);
    const access = randomToken();
    const refresh = randomToken();

    const accessRecord: AccessToken = {
      token: access,
      clientId,
      scopes,
      resource,
      subject,
      extra,
      expiresAt: now + this.config.accessTtlSeconds,
    };
    const refreshRecord: RefreshToken = {
      token: refresh,
      clientId,
      scopes,
      resource,
      subject,
      extra,
      expiresAt: now + this.config.refreshTtlSeconds,
    };

    this.accessTokens.set(access, accessRecord);
    this.refreshTokens.set(refresh, refreshRecord);
    await this.setPersistedAccessToken(access, accessRecord);
    await this.setPersistedRefreshToken(refresh, refreshRecord);

    return {
      access_token: access,
      token_type: "bearer",
      expires_in: this.config.accessTtlSeconds,
      refresh_token: refresh,
      scope: scopes.join(" "),
    };
  }

  private serializeCode(code: AuthCode): SerializableCode {
    return {
      ...code,
      resource: code.resource?.toString(),
    };
  }

  private deserializeCode(data: SerializableCode): AuthCode {
    return {
      ...data,
      resource: data.resource ? new URL(data.resource) : undefined,
    };
  }

  private serializeToken(token: AccessToken | RefreshToken): SerializableToken {
    return {
      ...token,
      resource: token.resource?.toString(),
    };
  }

  private deserializeToken(data: SerializableToken): AccessToken {
    return {
      ...data,
      resource: data.resource ? new URL(data.resource) : undefined,
    };
  }

  private async getPersistedCode(code: string): Promise<AuthCode | undefined> {
    if (!this.persistence) {
      return undefined;
    }
    const data = await this.persistence.getCode(code);
    return data ? this.deserializeCode(data) : undefined;
  }

  private async setPersistedCode(code: string, value: AuthCode): Promise<void> {
    if (this.persistence) {
      await this.persistence.setCode(code, this.serializeCode(value));
    }
  }

  private async deletePersistedCode(code: string): Promise<void> {
    if (this.persistence) {
      await this.persistence.deleteCode(code);
    }
  }

  private async getPersistedAccessToken(token: string): Promise<AccessToken | undefined> {
    if (!this.persistence) {
      return undefined;
    }
    const data = await this.persistence.getAccessToken(token);
    return data ? this.deserializeToken(data) : undefined;
  }

  private async setPersistedAccessToken(token: string, value: AccessToken): Promise<void> {
    if (this.persistence) {
      await this.persistence.setAccessToken(token, this.serializeToken(value));
    }
  }

  private async deletePersistedAccessToken(token: string): Promise<void> {
    if (this.persistence) {
      await this.persistence.deleteAccessToken(token);
    }
  }

  private async getPersistedRefreshToken(token: string): Promise<RefreshToken | undefined> {
    if (!this.persistence) {
      return undefined;
    }
    const data = await this.persistence.getRefreshToken(token);
    return data ? this.deserializeToken(data) : undefined;
  }

  private async setPersistedRefreshToken(token: string, value: RefreshToken): Promise<void> {
    if (this.persistence) {
      await this.persistence.setRefreshToken(token, this.serializeToken(value));
    }
  }

  private async deletePersistedRefreshToken(token: string): Promise<void> {
    if (this.persistence) {
      await this.persistence.deleteRefreshToken(token);
    }
  }

  private async maybeGetRefreshReuse(
    refreshToken: string,
    clientId: string,
    scopeKey: string | undefined,
    resource?: URL,
  ): Promise<OAuthTokens | undefined> {
    const reuse = await this.getPersistedRefreshTokenReuse(refreshToken);
    if (!reuse) {
      return undefined;
    }
    const now = Math.floor(Date.now() / 1000);
    if (reuse.expiresAt <= now) {
      return undefined;
    }
    if (reuse.clientId !== clientId) {
      return undefined;
    }
    if (scopeKey && reuse.scopeKey !== scopeKey) {
      return undefined;
    }
    if ((reuse.resource ?? undefined) !== this.toResourceString(resource)) {
      return undefined;
    }
    return {
      access_token: reuse.tokens.access_token,
      token_type: reuse.tokens.token_type,
      expires_in: reuse.tokens.expires_in,
      refresh_token: reuse.tokens.refresh_token,
      scope: reuse.tokens.scope,
    };
  }

  private async getPersistedRefreshTokenReuse(token: string): Promise<SerializableRefreshTokenReuse | undefined> {
    if (!this.persistence) {
      return undefined;
    }
    return this.persistence.getRefreshTokenReuse(token);
  }

  private async setPersistedRefreshTokenReuse(token: string, value: SerializableRefreshTokenReuse): Promise<void> {
    if (this.persistence) {
      await this.persistence.setRefreshTokenReuse(token, value);
    }
  }

  private buildTokenResponse(tokens: OAuthTokens): SerializableTokenResponse {
    return {
      access_token: tokens.access_token,
      token_type: tokens.token_type ?? "bearer",
      expires_in: tokens.expires_in ?? this.config.accessTtlSeconds,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope ?? "",
    };
  }

  private toScopeKey(scopes: readonly string[]): string {
    return [...scopes].sort().join(" ");
  }

  private toResourceString(resource: URL | undefined): string | undefined {
    return resource ? resource.toString() : undefined;
  }

  private async hashCodeVerifier(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(codeVerifier));
    return Buffer.from(digest).toString("base64url");
  }
}

function randomToken(): string {
  const buffer = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(buffer).toString("base64url");
}
