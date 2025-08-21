import crypto from 'crypto';
import { createRemoteJWKSet, jwtVerify, decodeProtectedHeader } from 'jose';

function parseCookies(req) {
    const header = req.headers?.cookie;
    if (!header) return {};
    const out = {};
    for (const raw of header.split(';')) {
        const p = raw.trim();
        const idx = p.indexOf('=');
        if (idx < 0) continue;
        const k = p.slice(0, idx).trim();
        let v = p.slice(idx + 1).trim();
        try {
            v = decodeURIComponent(v);
        } catch {}
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        out[k] = v;
    }
    return out;
}
function timingSafeEqual(a, b) {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

async function verifyJwtHS(token, secret, expected = {}) {
    const [h, p, s] = String(token).split('.');
    if (!h || !p || !s) throw new Error('malformed');
    let header, payload;
    try {
        header = JSON.parse(Buffer.from(h, 'base64url').toString('utf8'));
    } catch {
        throw new Error('bad header');
    }
    if (!/^HS(256|384|512)$/.test(header.alg)) throw new Error('unsupported alg');
    const data = `${h}.${p}`;
    const sig = crypto.createHmac('sha256', String(secret)).update(data).digest('base64url');
    if (!timingSafeEqual(sig, s)) throw new Error('bad signature');
    try {
        payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    } catch {
        throw new Error('bad payload');
    }
    const now = Math.floor(Date.now() / 1000);
    const LEEWAY = 60;
    if (payload.nbf && now + LEEWAY < payload.nbf) throw new Error('not active');
    if (payload.exp && now - LEEWAY >= payload.exp) throw new Error('expired');
    if (expected.iss && payload.iss !== expected.iss) throw new Error('iss');
    if (expected.aud) {
        const aud = payload.aud;
        const ok = Array.isArray(aud) ? aud.includes(expected.aud) : aud === expected.aud;
        if (!ok) throw new Error('aud');
    }
    return payload;
}

export function createFastifyAuth() {
    const enabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
    const mode = (process.env.AUTH_MODE || 'static').toLowerCase();
    const cookieName = process.env.AUTH_COOKIE || 'smartgpt_auth';
    const staticTokens = String(process.env.AUTH_TOKENS || process.env.AUTH_TOKEN || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const jwtSecret = process.env.AUTH_JWT_SECRET;
    const jwtIssuer = process.env.AUTH_JWT_ISSUER;
    const jwtAudience = process.env.AUTH_JWT_AUDIENCE;
    const jwksUrlEnv = process.env.AUTH_JWKS_URL;

    let jwksCache = null;
    function getJwks() {
        if (jwksCache) return jwksCache;
        let url = jwksUrlEnv;
        if (!url && jwtIssuer) {
            const base = String(jwtIssuer).replace(/\/$/, '');
            url = `${base}/.well-known/jwks.json`;
        }
        if (!url) return null;
        try {
            jwksCache = createRemoteJWKSet(new URL(url));
            return jwksCache;
        } catch {
            return null;
        }
    }

    async function verifyJwtAny(token) {
        const { alg } = decodeProtectedHeader(String(token)) || {};
        const opts = {
            issuer: jwtIssuer || undefined,
            audience: jwtAudience || undefined,
            clockTolerance: '60s',
        };
        const allowHs = Boolean(jwtSecret);
        const allowedAsym = [
            'RS256',
            'RS384',
            'RS512',
            'ES256',
            'ES384',
            'ES512',
            'PS256',
            'PS384',
            'PS512',
        ];
        const allowed = allowHs ? [...allowedAsym, 'HS256', 'HS384', 'HS512'] : allowedAsym;
        if (!alg || !allowed.includes(alg)) throw new Error('unsupported alg');
        if (alg.startsWith('HS')) {
            if (!jwtSecret) throw new Error('missing jwt secret');
            const key = new TextEncoder().encode(String(jwtSecret));
            const { payload } = await jwtVerify(String(token), key, {
                ...opts,
                algorithms: ['HS256', 'HS384', 'HS512'],
            });
            return payload;
        }
        const jwks = getJwks();
        if (!jwks) throw new Error('missing jwks');
        const { payload } = await jwtVerify(String(token), jwks, {
            ...opts,
            algorithms: allowedAsym,
        });
        return payload;
    }

    function getToken(req) {
        const auth = req.headers?.authorization || '';
        if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
        const cookies = parseCookies(req);
        if (cookies[cookieName]) return cookies[cookieName];
        return null;
    }

    async function preHandler(req, reply) {
        if (!enabled) return;
        const token = getToken(req);
        if (!token) return reply.code(401).send({ ok: false, error: 'unauthorized' });
        try {
            if (mode === 'static') {
                const ok = staticTokens.some((t) => timingSafeEqual(t, token));
                if (!ok) return reply.code(401).send({ ok: false, error: 'unauthorized' });
                req.user = { sub: 'static', mode: 'static' };
                return;
            }
            if (mode === 'jwt') {
                let payload;
                try {
                    payload = await verifyJwtAny(token);
                } catch (err) {
                    const msg = String(err?.message || err);
                    if (/missing jwks/.test(msg) && jwtSecret)
                        payload = await verifyJwtHS(token, jwtSecret, {
                            iss: jwtIssuer,
                            aud: jwtAudience,
                        });
                    else throw err;
                }
                req.user = payload;
                return;
            }
            return reply.code(500).send({ ok: false, error: 'auth misconfigured' });
        } catch (e) {
            const msg = String(e?.message || e);
            if (
                /(unauthorized|bad signature|expired|not active|iss|aud|malformed|bad header|bad payload|unsupported alg)/i.test(
                    msg,
                )
            ) {
                return reply.code(401).send({ ok: false, error: 'unauthorized' });
            }
            return reply.code(500).send({ ok: false, error: 'auth misconfigured' });
        }
    }

    function registerRoutes(fastify) {
        fastify.get('/auth/me', async (req, reply) => {
            if (!enabled) return reply.send({ ok: true, auth: false, cookie: cookieName });
            const t = getToken(req);
            if (!t) return reply.code(401).send({ ok: false, error: 'unauthorized' });
            try {
                if (mode === 'static') {
                    const ok = staticTokens.some((x) => timingSafeEqual(x, t));
                    if (!ok) return reply.code(401).send({ ok: false, error: 'unauthorized' });
                    return reply.send({ ok: true, auth: true, mode: 'static', cookie: cookieName });
                }
                if (mode === 'jwt') {
                    try {
                        await verifyJwtAny(t);
                        return reply.send({
                            ok: true,
                            auth: true,
                            mode: 'jwt',
                            cookie: cookieName,
                        });
                    } catch (err) {
                        const msg = String(err?.message || err);
                        if (/missing jwks/.test(msg) && jwtSecret) {
                            await verifyJwtHS(t, jwtSecret, { iss: jwtIssuer, aud: jwtAudience });
                            return reply.send({
                                ok: true,
                                auth: true,
                                mode: 'jwt',
                                cookie: cookieName,
                            });
                        }
                        throw err;
                    }
                }
                return reply.code(500).send({ ok: false, error: 'auth misconfigured' });
            } catch {
                return reply.code(401).send({ ok: false, error: 'unauthorized' });
            }
        });
    }

    return { enabled, preHandler, registerRoutes };
}
