import crypto from 'node:crypto';

import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { configDotenv } from 'dotenv';

import { jwks, signAccessToken, verifyToken, initKeys } from './keys.js';

configDotenv();

// Rate limit for /oauth/introspect endpoint
const INTROSPECTION_RATE_LIMIT = (() => {
  const fallback = 60; // 60 requests per minute per IP
  const raw = process.env.AUTH_INTROSPECT_RATE_LIMIT;
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
})();

const INTROSPECTION_TIME_WINDOW = process.env.AUTH_INTROSPECT_RATE_WINDOW || '1 minute';
type ClientDef = {
  client_secret?: string;
  scopes?: string[];
  aud?: string | string[];
};

type AuthCode = {
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  sub: string;
  scope: string;
};

type RefreshToken = {
  client_id: string;
  sub: string;
  scope: string;
};

function readClients(): Readonly<Record<string, ClientDef>> {
  const raw = process.env.AUTH_STATIC_CLIENTS;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Invalid AUTH_STATIC_CLIENTS JSON');
    return {};
  }
}

const PORT = Number(process.env.PORT || 8088);
const ISSUER = process.env.AUTH_ISSUER || `http://localhost:${PORT}`;
const DEFAULT_SCOPES = (process.env.AUTH_DEFAULT_SCOPES || '').split(/\s+/).filter(Boolean);

const authCodes = new Map<string, AuthCode>();
const refreshTokens = new Map<string, RefreshToken>();

function randomString(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

function pkceChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

async function handleAuthorizeRoute(
  req: Readonly<FastifyRequest>,
  reply: Readonly<FastifyReply>,
): Promise<void> {
  const q = (req.query || {}) as Record<string, string>;
  if (q.response_type !== 'code') {
    return reply.code(400).send({ error: 'unsupported_response_type' });
  }
  const {
    client_id,
    redirect_uri,
    state,
    scope = '',
    code_challenge,
    code_challenge_method,
    login_hint,
  } = q;
  if (!client_id || !redirect_uri || !code_challenge) {
    return reply.code(400).send({ error: 'invalid_request' });
  }
  if (code_challenge_method && code_challenge_method !== 'S256') {
    return reply.code(400).send({ error: 'invalid_request' });
  }
  const sub = login_hint || client_id;
  const code = randomString();
  authCodes.set(code, {
    client_id,
    redirect_uri,
    code_challenge,
    sub,
    scope,
  });
  const redir = new URL(redirect_uri);
  redir.searchParams.set('code', code);
  if (state) redir.searchParams.set('state', state);
  return reply.redirect(redir.toString());
}

function extractClientCredentials(
  body: Record<string, string>,
  req: Readonly<FastifyRequest>
): readonly [string | undefined, string | undefined] {
  let client_id = body.client_id as string | undefined;
  let client_secret = body.client_secret as string | undefined;
  const auth = req.headers.authorization;
  
  if ((!client_id || !client_secret) && auth?.startsWith('Basic ')) {
    const creds = Buffer.from(auth.slice(6), 'base64').toString('utf8');
    const [id, secret] = creds.split(':');
    client_id = client_id || id;
    client_secret = client_secret || secret;
  }
  
  return [client_id, client_secret] as const;
}

function validateClient(
  client_id: string | undefined,
  client_secret: string | undefined,
  clients: Readonly<Record<string, ClientDef>>
): ClientDef | null {
  if (!client_id || !client_secret) {
    return null;
  }
  
  const client = clients[client_id];
  if (!client || client.client_secret !== client_secret) {
    return null;
  }
  
  return client;
}

function calculateGrantedScopes(
  requestedScope: string | undefined,
  clientScopes: string[] | undefined
): string {
  const reqScopes = requestedScope?.split(/\s+/).filter(Boolean) || DEFAULT_SCOPES;
  const allowed = new Set((clientScopes || []).concat(DEFAULT_SCOPES));
  const granted = reqScopes.filter((s) => allowed.has(s));
  return granted.join(' ');
}

async function handleClientCredentialsGrant(
  body: Record<string, string>,
  req: Readonly<FastifyRequest>,
  reply: Readonly<FastifyReply>,
  clients: Readonly<Record<string, ClientDef>>
): Promise<void> {
  const [client_id, client_secret] = extractClientCredentials(body, req);
  const client = validateClient(client_id, client_secret, clients);
  
  if (!client) {
    return reply.code(401).send({ error: 'invalid_client' });
  }

  const scopeStr = calculateGrantedScopes(body.scope, client.scopes);
  const aud = body.aud || client.aud || process.env.AUTH_AUDIENCE;
  const ttl = process.env.AUTH_TOKEN_TTL_SECONDS
    ? Number(process.env.AUTH_TOKEN_TTL_SECONDS)
    : 3600;
    
  const access_token = await signAccessToken(
    { sub: client_id!, aud, scope: scopeStr, iss: ISSUER },
    { expiresIn: ttl },
  );
  
  return reply.send({
    access_token,
    token_type: 'Bearer',
    expires_in: ttl,
    scope: scopeStr,
    issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
  });
}
    { expiresIn: ttl },
  );
  return reply.send({
    access_token,
    token_type: 'Bearer',
    expires_in: ttl,
    scope: scopeStr,
    issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
  });
}

async function handleAuthorizationCodeGrant(
  body: Record<string, string>,
  reply: FastifyReply,
): Promise<void> {
  const { code, redirect_uri, code_verifier, client_id } = body as Record<string, string>;
  if (!code || !redirect_uri || !code_verifier || !client_id) {
    return reply.code(400).send({ error: 'invalid_request' });
  }
  const entry = authCodes.get(code);
  if (!entry || entry.client_id !== client_id || entry.redirect_uri !== redirect_uri) {
    return reply.code(400).send({ error: 'invalid_grant' });
  }
  if (pkceChallenge(code_verifier) !== entry.code_challenge) {
    return reply.code(400).send({ error: 'invalid_grant' });
  }
  authCodes.delete(code);
  const ttl = process.env.AUTH_TOKEN_TTL_SECONDS
    ? Number(process.env.AUTH_TOKEN_TTL_SECONDS)
    : 3600;
  const access_token = await signAccessToken(
    { sub: entry.sub, aud: client_id, scope: entry.scope, iss: ISSUER },
    { expiresIn: ttl },
  );
  const refresh = randomString();
  refreshTokens.set(refresh, {
    client_id,
    sub: entry.sub,
    scope: entry.scope,
  });
  return reply.send({
    access_token,
    refresh_token: refresh,
    token_type: 'Bearer',
    expires_in: ttl,
    scope: entry.scope,
    issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
  });
}

async function handleRefreshTokenGrant(
  body: Record<string, string>,
  reply: FastifyReply,
): Promise<void> {
  const { refresh_token, client_id } = body as Record<string, string>;
  if (!refresh_token || !client_id) {
    return reply.code(400).send({ error: 'invalid_request' });
  }
  const entry = refreshTokens.get(refresh_token);
  if (!entry || entry.client_id !== client_id) {
    return reply.code(400).send({ error: 'invalid_grant' });
  }
  const ttl = process.env.AUTH_TOKEN_TTL_SECONDS
    ? Number(process.env.AUTH_TOKEN_TTL_SECONDS)
    : 3600;
  const access_token = await signAccessToken(
    { sub: entry.sub, aud: client_id, scope: entry.scope, iss: ISSUER },
    { expiresIn: ttl },
  );
  return reply.send({
    access_token,
    token_type: 'Bearer',
    expires_in: ttl,
    scope: entry.scope,
    issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
  });
}

async function handleTokenRoute(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const clients = readClients();
  const ctype = (req.headers['content-type'] || '').toString();
  let body: Record<string, string> = {};
  const rawBody = req.body as string | Record<string, string> | undefined;

  if (ctype.includes('application/x-www-form-urlencoded') && typeof rawBody === 'string') {
    body = Object.fromEntries(new URLSearchParams(rawBody));
  } else if (rawBody && typeof rawBody === 'object') {
    body = rawBody;
  }

  const grantType = body.grant_type || 'client_credentials';

  if (grantType === 'client_credentials') {
    return handleClientCredentialsGrant(body, req, reply, clients);
  } else if (grantType === 'authorization_code') {
    return handleAuthorizationCodeGrant(body, reply);
  } else if (grantType === 'refresh_token') {
    return handleRefreshTokenGrant(body, reply);
  }

  return reply.code(400).send({ error: 'unsupported_grant_type' });
}

async function handleIntrospectionRoute(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const ctype = (req.headers['content-type'] || '').toString();
  let body: Record<string, string> = {};
  const rawBody = req.body as string | Record<string, string> | undefined;

  if (ctype.includes('application/x-www-form-urlencoded') && typeof rawBody === 'string') {
    body = Object.fromEntries(new URLSearchParams(rawBody));
  } else if (rawBody && typeof rawBody === 'object') {
    body = rawBody;
  }

  const token =
    body.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);
  if (!token) return reply.code(400).send({ active: false, error: 'missing_token' });
  try {
    const v = await verifyToken(token);
    return reply.send({
      active: true,
      iss: v.payload.iss,
      sub: v.payload.sub,
      aud: v.payload.aud,
      scope: v.payload.scope,
      exp: v.payload.exp,
      iat: v.payload.iat,
    });
  } catch (e) {
    return reply.code(200).send({ active: false });
  }
}

export async function buildServer(): Promise<FastifyInstance> {
  await initKeys();
  const app = Fastify({ logger: true });

  try {
    await app.register(rateLimit, {
      global: false,
    });
  } catch (err) {
    app.log.warn({ err }, 'Failed to register rate limit plugin');
  }

  app.addContentTypeParser(
    'application/x-www-form-urlencoded',
    { parseAs: 'string' },
    (_req, body, done) => done(null, body as string),
  );

  app.get('/healthz', async () => ({ status: 'ok' }));

  app.get('/.well-known/jwks.json', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await jwks());
  });

  app.get('/oauth/authorize', handleAuthorizeRoute);
  app.post('/oauth/token', handleTokenRoute);

  app.post(
    '/oauth/introspect',
    {
      config: {
        rateLimit: {
          max: INTROSPECTION_RATE_LIMIT,
          timeWindow: INTROSPECTION_TIME_WINDOW,
        },
      },
    },
    handleIntrospectionRoute,
  );

  return app;
}

// Only auto-start when this module is the entrypoint (not when imported by tests)
if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  buildServer()
    .then((app) => app.listen({ port: PORT, host: '0.0.0.0' }))
    .catch((err) => {
      console.error('Failed to start auth-service', err);
      process.exit(1);
    });
}
