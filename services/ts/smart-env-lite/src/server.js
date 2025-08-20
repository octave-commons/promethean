import express from 'express';
import { loadSmartEnv } from './env.js';
import { rebuildIndex, searchIndex } from './indexer.js';

function makeOpenAPISpec() {
    return {
        openapi: '3.0.0',
        info: { title: 'Smart Env Lite', version: '0.1.0' },
        paths: {
            '/index/rebuild': {
                post: { summary: 'Rebuild index', responses: { 200: { description: 'ok' } } },
            },
            '/search': {
                post: {
                    summary: 'Vector search top-k',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: { q: { type: 'string' }, k: { type: 'integer' } },
                                    required: ['q'],
                                },
                            },
                        },
                        responses: { 200: { description: 'ok' } },
                    },
                },
                '/embed': {
                    post: {
                        summary: 'Embed a single text (for testing)',
                        requestBody: {
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: { text: { type: 'string' } },
                                        required: ['text'],
                                    },
                                },
                            },
                            responses: { 200: { description: 'ok' } },
                        },
                    },
                },
            },
        },
    };
}

const VAULT_PATH = process.env.VAULT_PATH || '';
if (!VAULT_PATH) {
    console.error(
        'Set VAULT_PATH to your Obsidian vault root (the folder containing .smart_env/smart_env.json).',
    );
    process.exit(1);
}

const env = await loadSmartEnv(VAULT_PATH);

const app = express();
app.use(express.json({ limit: '10mb' }));

app.get('/openapi.json', (_req, res) => res.json(makeOpenAPISpec()));

app.post('/index/rebuild', async (_req, res) => {
    try {
        const shards = await rebuildIndex(env);
        res.json({ ok: true, shards, index_dir: env.index.dir });
    } catch (e) {
        res.status(500).json({ ok: false, error: String(e?.message || e) });
    }
});

app.post('/search', async (req, res) => {
    try {
        const { q, k } = req.body || {};
        if (!q) return res.status(400).json({ ok: false, error: "Missing 'q'" });
        const results = await searchIndex(env, q, k ?? 8);
        res.json({ ok: true, results });
    } catch (e) {
        res.status(500).json({ ok: false, error: String(e?.message || e) });
    }
});

// simple /embed demo uses search pipeline's embedters indirectly; omitted here for brevity
app.post('/embed', async (req, res) => {
    res.status(501).json({
        ok: false,
        error: 'Use /search or /index/rebuild; direct /embed optional.',
    });
});

app.listen(env.server.port, env.server.hostname, () => {
    console.log(`smart-env-lite listening on http://${env.server.hostname}:${env.server.port}`);
    console.log(`VAULT_PATH=${VAULT_PATH}`);
});
