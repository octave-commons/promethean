import { DEFAULT_TENANT_ID } from "./tenant-api-key.js";

export interface TenantApiKeyAuthMatch {
  readonly id: string;
  readonly tenantId: string;
  readonly label: string;
  readonly prefix: string;
  readonly scopes: readonly string[];
}

export type RequestAuthRole = "owner" | "admin" | "member" | "viewer";

export interface RequestAuthMembership {
  readonly tenantId: string;
  readonly tenantName?: string;
  readonly tenantStatus?: string;
  readonly role: RequestAuthRole;
}

export interface UiSessionAuthMatch {
  readonly userId: string;
  readonly subject: string;
  readonly activeTenantId: string;
  readonly role: RequestAuthRole;
  readonly memberships: readonly RequestAuthMembership[];
}

export interface ResolvedRequestAuth {
  readonly kind: "legacy_admin" | "tenant_api_key" | "ui_session" | "unauthenticated";
  readonly tenantId?: string;
  readonly role?: RequestAuthRole;
  readonly source: "bearer" | "cookie" | "none";
  readonly userId?: string;
  readonly subject?: string;
  readonly keyId?: string;
  readonly scopes?: readonly string[];
  readonly memberships?: readonly RequestAuthMembership[];
}

function extractBearerToken(authorization: string | undefined): string | undefined {
  if (!authorization) {
    return undefined;
  }

  const trimmed = authorization.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) {
    return undefined;
  }

  const token = trimmed.slice(7).trim();
  return token.length > 0 ? token : undefined;
}

export async function resolveRequestAuth(input: {
  readonly allowUnauthenticated: boolean;
  readonly proxyAuthToken?: string;
  readonly authorization?: string;
  readonly cookieToken?: string;
  readonly oauthAccessToken?: string;
  readonly resolveTenantApiKey?: (token: string) => Promise<TenantApiKeyAuthMatch | undefined>;
  readonly resolveUiSession?: (token: string) => Promise<UiSessionAuthMatch | undefined>;
}): Promise<ResolvedRequestAuth | undefined> {
  const bearerToken = extractBearerToken(input.authorization);
  const cookieToken = typeof input.cookieToken === "string" && input.cookieToken.trim().length > 0
    ? input.cookieToken.trim()
    : undefined;
  const oauthAccessToken = typeof input.oauthAccessToken === "string" && input.oauthAccessToken.trim().length > 0
    ? input.oauthAccessToken.trim()
    : undefined;

  if (input.proxyAuthToken) {
    if (bearerToken === input.proxyAuthToken) {
      return {
        kind: "legacy_admin",
        tenantId: DEFAULT_TENANT_ID,
        role: "owner",
        source: "bearer",
        subject: "legacy:proxy-auth-token",
      };
    }

    if (cookieToken === input.proxyAuthToken) {
      return {
        kind: "legacy_admin",
        tenantId: DEFAULT_TENANT_ID,
        role: "owner",
        source: "cookie",
        subject: "legacy:proxy-auth-token",
      };
    }
  }

  if (bearerToken && input.resolveTenantApiKey) {
    const match = await input.resolveTenantApiKey(bearerToken);
    if (match) {
      return {
        kind: "tenant_api_key",
        tenantId: match.tenantId,
        role: "member",
        source: "bearer",
        subject: `tenant_api_key:${match.id}`,
        keyId: match.id,
        scopes: match.scopes,
      };
    }
  }

  if (input.resolveUiSession) {
    if (bearerToken) {
      const match = await input.resolveUiSession(bearerToken);
      if (match) {
        return {
          kind: "ui_session",
          tenantId: match.activeTenantId,
          role: match.role,
          source: "bearer",
          userId: match.userId,
          subject: match.subject,
          memberships: match.memberships,
        };
      }
    }

    if (oauthAccessToken && oauthAccessToken !== bearerToken) {
      const match = await input.resolveUiSession(oauthAccessToken);
      if (match) {
        return {
          kind: "ui_session",
          tenantId: match.activeTenantId,
          role: match.role,
          source: "cookie",
          userId: match.userId,
          subject: match.subject,
          memberships: match.memberships,
        };
      }
    }
  }

  if (input.allowUnauthenticated) {
    return {
      kind: "unauthenticated",
      source: "none",
    };
  }

  return undefined;
}
