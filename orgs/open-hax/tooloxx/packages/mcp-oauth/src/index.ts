import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from "jose";

type HeaderValue = string | string[] | undefined;
type HeaderMap = Record<string, HeaderValue>;

export type VerifiedOAuthToken = {
  token: string;
  clientId?: string;
  scopes: string[];
  expiresAt?: number;
  resource?: string;
  extra?: Record<string, unknown>;
};

export type OAuthTokenVerifier = (token: string) => Promise<VerifiedOAuthToken>;

export type FastifyLikeRequest = {
  url: string;
  headers: HeaderMap;
  socket?: {
    remoteAddress?: string;
  };
};

export type FastifyLikeReply = {
  header(name: string, value: string): FastifyLikeReply;
  code(statusCode: number): FastifyLikeReply;
  send(payload: unknown): void;
};

export type FastifyLikeInstance = {
  addHook(
    name: "onRequest",
    hook: (req: FastifyLikeRequest, reply: FastifyLikeReply) => Promise<void> | void,
  ): void;
};

export type ExpressLikeRequest = {
  url: string;
  headers: HeaderMap;
  socket?: {
    remoteAddress?: string;
  };
};

export type ExpressLikeResponse = {
  setHeader(name: string, value: string): void;
  status(statusCode: number): ExpressLikeResponse;
  json(payload: unknown): void;
};

export type ExpressLikeNext = (error?: unknown) => void;

export type ExpressLikeMiddleware = (
  req: ExpressLikeRequest,
  res: ExpressLikeResponse,
  next: ExpressLikeNext,
) => void;

export class OAuthVerificationError extends Error {
  readonly statusCode: number;
  readonly errorCode: string;

  constructor(message: string, statusCode = 401, errorCode = "invalid_token") {
    super(message);
    this.name = "OAuthVerificationError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export type JwtTokenVerifierOptions = {
  issuer: string;
  audience: string;
};

const jwksCache = new Map<string, JWTVerifyGetKey>();

function getJwks(issuer: string): JWTVerifyGetKey {
  const cached = jwksCache.get(issuer);
  if (cached) {
    return cached;
  }

  const jwks = createRemoteJWKSet(new URL("/.well-known/jwks.json", issuer));
  jwksCache.set(issuer, jwks);
  return jwks;
}

function parseScopeClaim(payload: JWTPayload): string[] {
  const rawScope = payload.scope;
  if (typeof rawScope !== "string") {
    return [];
  }
  return rawScope.split(" ").map((scope) => scope.trim()).filter((scope) => scope.length > 0);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string");
}

function hasScopes(scopes: string[], requiredScopes: string[]): boolean {
  if (requiredScopes.length === 0) {
    return true;
  }
  const set = new Set(scopes);
  return requiredScopes.every((scope) => set.has(scope));
}

function firstHeaderValue(value: HeaderValue): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return "";
}

function parseBearerToken(headers: HeaderMap): string {
  const authHeader = firstHeaderValue(headers.authorization);
  if (!authHeader.startsWith("Bearer ")) {
    throw new OAuthVerificationError("OAuth token required for non-local access", 401, "invalid_token");
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (token.length === 0) {
    throw new OAuthVerificationError("OAuth token required for non-local access", 401, "invalid_token");
  }
  return token;
}

function normalizeHost(raw: string): string {
  const first = raw.split(",")[0]?.trim() ?? "";
  if (first.length === 0) {
    return "";
  }
  const withoutPort = first.split(":")[0] ?? "";
  return withoutPort.toLowerCase();
}

function normalizeForwardedIp(raw: string): string {
  return (raw.split(",")[0] ?? "").trim().toLowerCase();
}

function isLoopbackAddress(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    normalized === "127.0.0.1"
    || normalized === "::1"
    || normalized === "::ffff:127.0.0.1"
    || normalized.startsWith("127.")
  );
}

function isLocalHost(value: string): boolean {
  return value === "localhost" || value === "127.0.0.1" || value === "::1";
}

function isAllowedHost(hostname: string, allowedHosts: string[]): boolean {
  if (allowedHosts.length === 0) {
    return true;
  }

  return allowedHosts.some((allowed) => {
    const trimmed = allowed.trim().toLowerCase();
    if (trimmed.length === 0) {
      return false;
    }
    if (trimmed.startsWith(".")) {
      return hostname.endsWith(trimmed);
    }
    return hostname === trimmed;
  });
}

function extractPathname(urlText: string): string {
  const [pathname] = urlText.split("?");
  return pathname ?? "/";
}

function formatWwwAuthenticate(realm: string, errorCode: string): string {
  return `Bearer realm="${realm}", error="${errorCode}"`;
}

type GuardEvaluation =
  | { ok: true }
  | { ok: false; statusCode: number; error: string; message: string; wwwAuthenticate?: string };

type GuardRequest = {
  url: string;
  headers: HeaderMap;
  remoteAddress?: string;
};

export type OAuthGuardOptions = {
  verifier: OAuthTokenVerifier;
  realm?: string;
  requiredScopes?: string[];
  allowLocalhostBypass?: boolean;
  allowedHosts?: string[];
  isPublicPath?: (pathname: string) => boolean;
  shouldBypassTokenVerification?: (pathname: string) => boolean;
  onTokenVerified?: (token: VerifiedOAuthToken, req: GuardRequest) => void | Promise<void>;
};

async function evaluateGuardRequest(req: GuardRequest, options: OAuthGuardOptions): Promise<GuardEvaluation> {
  const realm = options.realm ?? "api-gateway";
  const requiredScopes = options.requiredScopes ?? [];
  const allowedHosts = options.allowedHosts ?? [];
  const pathname = extractPathname(req.url);

  if (options.isPublicPath?.(pathname) === true) {
    return { ok: true };
  }

  const forwardedHost = firstHeaderValue(req.headers["x-forwarded-host"]);
  const hostHeader = firstHeaderValue(req.headers.host);
  const host = normalizeHost(forwardedHost.length > 0 ? forwardedHost : hostHeader);
  const forwardedFor = normalizeForwardedIp(firstHeaderValue(req.headers["x-forwarded-for"]));
  const remoteAddress = (req.remoteAddress ?? "").toLowerCase();

  const isLoopbackOnly = isLoopbackAddress(remoteAddress)
    && (forwardedFor.length === 0 || isLoopbackAddress(forwardedFor))
    && (host.length === 0 || isLocalHost(host));

  if (options.allowLocalhostBypass === true && isLoopbackOnly) {
    return { ok: true };
  }

  if (host.length > 0 && !isAllowedHost(host, allowedHosts)) {
    return {
      ok: false,
      statusCode: 403,
      error: "Forbidden",
      message: "Access from this host is blocked",
    };
  }

  if (options.shouldBypassTokenVerification?.(pathname) === true) {
    return { ok: true };
  }

  let bearerToken = "";
  try {
    bearerToken = parseBearerToken(req.headers);
  } catch (error) {
    const authError = error instanceof OAuthVerificationError
      ? error
      : new OAuthVerificationError("Invalid or expired OAuth token");
    return {
      ok: false,
      statusCode: authError.statusCode,
      error: "Unauthorized",
      message: authError.message,
      wwwAuthenticate: formatWwwAuthenticate(realm, authError.errorCode),
    };
  }

  try {
    const verifiedToken = await options.verifier(bearerToken);
    if (!hasScopes(verifiedToken.scopes, requiredScopes)) {
      return {
        ok: false,
        statusCode: 403,
        error: "Forbidden",
        message: "OAuth token missing required scope",
        wwwAuthenticate: formatWwwAuthenticate(realm, "insufficient_scope"),
      };
    }
    await options.onTokenVerified?.(verifiedToken, req);
    return { ok: true };
  } catch (error) {
    const authError = error instanceof OAuthVerificationError
      ? error
      : new OAuthVerificationError("Invalid or expired OAuth token");
    return {
      ok: false,
      statusCode: authError.statusCode,
      error: authError.statusCode === 403 ? "Forbidden" : "Unauthorized",
      message: authError.message,
      wwwAuthenticate: formatWwwAuthenticate(realm, authError.errorCode),
    };
  }
}

export type OpaqueTokenVerifierOptions = {
  introspectionUrl: string;
  sharedSecret?: string;
  requiredScopes?: string[];
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export type RedisOpaqueTokenVerifierOptions = {
  keyPrefix: string;
  getTokenByKey: (key: string) => Promise<string | null>;
  deleteTokenByKey?: (key: string) => Promise<unknown>;
};

type StoredOpaqueTokenRecord = {
  token: string;
  clientId: string;
  scopes: string[];
  resource?: string;
  extra?: Record<string, unknown>;
  expiresAt: number;
};

type OpaqueIntrospectionResponse = {
  active: boolean;
  clientId?: string;
  scopes?: string[];
  expiresAt?: number;
  resource?: string;
  extra?: Record<string, unknown>;
  message?: string;
};

function parseOpaqueResponse(value: unknown): OpaqueIntrospectionResponse {
  const payload = asRecord(value);
  if (!payload) {
    return { active: false, message: "Malformed introspection response" };
  }

  return {
    active: payload.active === true,
    clientId: typeof payload.clientId === "string" ? payload.clientId : undefined,
    scopes: parseStringArray(payload.scopes),
    expiresAt: typeof payload.expiresAt === "number" ? payload.expiresAt : undefined,
    resource: typeof payload.resource === "string" ? payload.resource : undefined,
    extra: asRecord(payload.extra) ?? undefined,
    message: typeof payload.message === "string" ? payload.message : undefined,
  };
}

function parseStoredOpaqueToken(value: unknown): StoredOpaqueTokenRecord | null {
  const payload = asRecord(value);
  if (!payload) {
    return null;
  }

  if (
    typeof payload.token !== "string"
    || typeof payload.clientId !== "string"
    || typeof payload.expiresAt !== "number"
  ) {
    return null;
  }

  const scopes = parseStringArray(payload.scopes);
  if (scopes.length === 0) {
    return null;
  }

  const resourceValue = payload.resource;
  const extraValue = payload.extra;

  return {
    token: payload.token,
    clientId: payload.clientId,
    scopes,
    resource: typeof resourceValue === "string" ? resourceValue : undefined,
    extra: asRecord(extraValue) ?? undefined,
    expiresAt: payload.expiresAt,
  };
}

function normalizePrefix(prefix: string): string {
  const trimmed = prefix.trim();
  if (trimmed.length === 0) {
    return "oauth";
  }
  return trimmed;
}

export function createRedisOpaqueTokenVerifier(options: RedisOpaqueTokenVerifierOptions): OAuthTokenVerifier {
  const keyPrefix = normalizePrefix(options.keyPrefix);

  return async (token: string): Promise<VerifiedOAuthToken> => {
    const tokenKey = `${keyPrefix}:access_tokens:${token}`;

    let rawToken: string | null;
    try {
      rawToken = await options.getTokenByKey(tokenKey);
    } catch {
      throw new OAuthVerificationError("Failed to verify OAuth token", 401, "invalid_token");
    }

    if (!rawToken) {
      throw new OAuthVerificationError("Invalid or expired OAuth token", 401, "invalid_token");
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(rawToken) as unknown;
    } catch {
      throw new OAuthVerificationError("Invalid or expired OAuth token", 401, "invalid_token");
    }

    const parsed = parseStoredOpaqueToken(parsedPayload);
    if (!parsed) {
      throw new OAuthVerificationError("Invalid or expired OAuth token", 401, "invalid_token");
    }

    const now = Math.floor(Date.now() / 1000);
    if (parsed.expiresAt <= now) {
      if (options.deleteTokenByKey) {
        try {
          await options.deleteTokenByKey(tokenKey);
        } catch {
          // Best-effort cleanup only.
        }
      }
      throw new OAuthVerificationError("Invalid or expired OAuth token", 401, "invalid_token");
    }

    return {
      token: parsed.token,
      clientId: parsed.clientId,
      scopes: parsed.scopes,
      expiresAt: parsed.expiresAt,
      resource: parsed.resource,
      extra: parsed.extra,
    };
  };
}

export function createOpaqueTokenVerifier(options: OpaqueTokenVerifierOptions): OAuthTokenVerifier {
  const fetchFn = options.fetchImpl ?? globalThis.fetch;
  if (!fetchFn) {
    throw new Error("No fetch implementation available for opaque token verifier");
  }

  const timeoutMs = options.timeoutMs ?? 5000;
  const requiredScopes = options.requiredScopes ?? [];
  const sharedSecret = options.sharedSecret?.trim();

  return async (token: string): Promise<VerifiedOAuthToken> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      if (sharedSecret && sharedSecret.length > 0) {
        headers["x-mcp-internal-shared-secret"] = sharedSecret;
      }

      const response = await fetchFn(options.introspectionUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ token, requiredScopes }),
        signal: controller.signal,
      });

      const payload = parseOpaqueResponse(await response.json().catch(() => undefined));

      if (!response.ok || !payload.active) {
        if (response.status === 403) {
          throw new OAuthVerificationError(payload.message ?? "OAuth token missing required scope", 403, "insufficient_scope");
        }
        throw new OAuthVerificationError(payload.message ?? "Invalid or expired OAuth token", 401, "invalid_token");
      }

      if (!hasScopes(payload.scopes ?? [], requiredScopes)) {
        throw new OAuthVerificationError("OAuth token missing required scope", 403, "insufficient_scope");
      }

      return {
        token,
        clientId: payload.clientId,
        scopes: payload.scopes ?? [],
        expiresAt: payload.expiresAt,
        resource: payload.resource,
        extra: payload.extra,
      };
    } catch (error) {
      if (error instanceof OAuthVerificationError) {
        throw error;
      }
      throw new OAuthVerificationError("Failed to verify OAuth token", 401, "invalid_token");
    } finally {
      clearTimeout(timeout);
    }
  };
}

export function createJwtTokenVerifier(options: JwtTokenVerifierOptions): OAuthTokenVerifier {
  const jwks = getJwks(options.issuer);
  return async (token: string): Promise<VerifiedOAuthToken> => {
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: options.issuer,
        audience: options.audience,
      });
      return {
        token,
        clientId: typeof payload.client_id === "string" ? payload.client_id : undefined,
        scopes: parseScopeClaim(payload),
        expiresAt: payload.exp,
        resource: typeof payload.aud === "string" ? payload.aud : undefined,
        extra: asRecord(payload) ?? undefined,
      };
    } catch {
      throw new OAuthVerificationError("Invalid or expired OAuth token", 401, "invalid_token");
    }
  };
}

export function addFastifyOAuthGuard(app: FastifyLikeInstance, options: OAuthGuardOptions): void {
  app.addHook("onRequest", async (req, reply) => {
    const guard = await evaluateGuardRequest(
      {
        url: req.url,
        headers: req.headers,
        remoteAddress: req.socket?.remoteAddress,
      },
      options,
    );

    if (guard.ok) {
      return;
    }

    if (guard.wwwAuthenticate) {
      reply.header("WWW-Authenticate", guard.wwwAuthenticate);
    }
    reply.code(guard.statusCode).send({ error: guard.error, message: guard.message });
  });
}

export function createExpressOAuthMiddleware(options: OAuthGuardOptions): ExpressLikeMiddleware {
  return (req: ExpressLikeRequest, res: ExpressLikeResponse, next: ExpressLikeNext): void => {
    void (async () => {
      const guard = await evaluateGuardRequest(
        {
          url: req.url,
          headers: req.headers,
          remoteAddress: req.socket?.remoteAddress,
        },
        options,
      );

      if (guard.ok) {
        next();
        return;
      }

      if (guard.wwwAuthenticate) {
        res.setHeader("WWW-Authenticate", guard.wwwAuthenticate);
      }
      res.status(guard.statusCode).json({ error: guard.error, message: guard.message });
    })().catch(next);
  };
}
