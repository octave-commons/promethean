import Fastify from 'fastify';
import { jwks, signAccessToken, verifyToken, initKeys } from './keys.js';
import { configDotenv } from 'dotenv';
configDotenv();

type ClientDef = {
    client_secret: string;
    scopes?: string[];
    aud?: string | string[];
};

function readClients(): Record<string, ClientDef> {
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

export async function buildServer() {
    await initKeys();
    const app = Fastify({ logger: true });

    app.get('/healthz', async () => ({ status: 'ok' }));

    app.get('/.well-known/jwks.json', async (_req, reply) => {
        return reply.send(await jwks());
    });

    app.post('/oauth/token', async (req, reply) => {
        const clients = readClients();
        const ctype = (req.headers['content-type'] || '').toString();
        let body: any = (req as any).body || {};
        if (ctype.includes('application/x-www-form-urlencoded') && typeof body === 'string') {
            body = Object.fromEntries(new URLSearchParams(body));
        }
        const grantType = body.grant_type || 'client_credentials';
        if (grantType !== 'client_credentials') {
            return reply.code(400).send({ error: 'unsupported_grant_type' });
        }

        // Basic auth fallback
        let client_id = body.client_id as string | undefined;
        let client_secret = body.client_secret as string | undefined;
        const auth = req.headers.authorization;
        if ((!client_id || !client_secret) && auth?.startsWith('Basic ')) {
            const creds = Buffer.from(auth.slice(6), 'base64').toString('utf8');
            const [id, secret] = creds.split(':');
            client_id = client_id || id;
            client_secret = client_secret || secret;
        }
        if (!client_id || !client_secret) {
            return reply.code(401).send({ error: 'invalid_client' });
        }
        const client = clients[client_id];
        if (!client || client.client_secret !== client_secret) {
            return reply.code(401).send({ error: 'invalid_client' });
        }

        const reqScopes =
            (body.scope as string | undefined)?.split(/\s+/).filter(Boolean) || DEFAULT_SCOPES;
        const allowed = new Set((client.scopes || []).concat(DEFAULT_SCOPES));
        const granted = reqScopes.filter((s) => allowed.has(s));
        const scopeStr = granted.join(' ');

        const aud = body.aud || client.aud || process.env.AUTH_AUDIENCE;
        const ttl = process.env.AUTH_TOKEN_TTL_SECONDS
            ? Number(process.env.AUTH_TOKEN_TTL_SECONDS)
            : 3600;
        const access_token = await signAccessToken(
            { sub: client_id, aud, scope: scopeStr, iss: ISSUER },
            { expiresIn: ttl },
        );
        return reply.send({
            access_token,
            token_type: 'Bearer',
            expires_in: ttl,
            scope: scopeStr,
            issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        });
    });

    app.post('/oauth/introspect', async (req, reply) => {
        const ctype = (req.headers['content-type'] || '').toString();
        let body: any = (req as any).body || {};
        if (ctype.includes('application/x-www-form-urlencoded') && typeof body === 'string') {
            body = Object.fromEntries(new URLSearchParams(body));
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
    });

    return app;
}

if (process.env.NODE_ENV !== 'test') {
    buildServer()
        .then((app) => app.listen({ port: PORT, host: '0.0.0.0' }))
        .catch((err) => {
            console.error('Failed to start auth-service', err);
            process.exit(1);
        });
}
