import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test.serial('openapi shows bearer security when auth enabled', async (t) => {
    const prev = {
        AUTH_ENABLED: process.env.AUTH_ENABLED,
        AUTH_MODE: process.env.AUTH_MODE,
    };
    process.env.AUTH_ENABLED = 'true';
    process.env.AUTH_MODE = 'static';
    try {
        await withServer(ROOT, async (req) => {
            const res = await req.get('/openapi.json').expect(200);
            t.truthy(res.body.components?.securitySchemes?.bearerAuth);
            t.true(Array.isArray(res.body.security));
            t.deepEqual(res.body.security, [{ bearerAuth: [] }]);
        });
    } finally {
        process.env.AUTH_ENABLED = prev.AUTH_ENABLED;
        process.env.AUTH_MODE = prev.AUTH_MODE;
    }
});

test.serial('/auth/me requires valid token when enabled', async (t) => {
    const prev = {
        AUTH_ENABLED: process.env.AUTH_ENABLED,
        AUTH_MODE: process.env.AUTH_MODE,
    };
    process.env.AUTH_ENABLED = 'true';
    process.env.AUTH_MODE = 'static';
    try {
        await withServer(ROOT, async (req) => {
            await req.get('/auth/me').expect(401);
            const res = await req.get('/auth/me').set('Authorization', 'Bearer secret').expect(401);
            t.false(res.body.ok);
        });
    } finally {
        process.env.AUTH_ENABLED = prev.AUTH_ENABLED;
        process.env.AUTH_MODE = prev.AUTH_MODE;
    }
});
