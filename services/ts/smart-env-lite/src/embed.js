let haveFetch = typeof fetch === 'function';
if (!haveFetch) {
    // Node 18+ has fetch; if not, lazy import undici (not listed by default)
    try {
        const { fetch: undiciFetch } = await import('undici');
        globalThis.fetch = undiciFetch;
    } catch {
        throw new Error(
            'No global fetch and undici not installed. Use Node 18+ or install undici.',
        );
    }
}

export async function embedTexts(texts, embeddingCfg) {
    const { adapter, model, host } = embeddingCfg;
    if (adapter === 'ollama') {
        return await embedOllama(texts, model, host || 'http://127.0.0.1:11434');
    } else if (adapter === 'transformers') {
        return await embedTransformers(texts, model, embeddingCfg.legacy_transformers);
    } else {
        throw new Error(`Unsupported adapter: ${adapter}`);
    }
}

// Simple per-text calls to Ollama embeddings API.
async function embedOllama(texts, model, host) {
    const out = [];
    for (const t of texts) {
        const r = await fetch(`${host.replace(/\/+$/, '')}/api/embeddings`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ model, input: t }),
        });
        if (!r.ok) {
            const msg = await r.text();
            throw new Error(`ollama embeddings failed: ${r.status} ${msg}`);
        }
        const j = await r.json();
        if (!j || !Array.isArray(j.embedding))
            throw new Error("ollama response missing 'embedding'");
        out.push(j.embedding);
    }
    return out;
}

let tfPipeline = null;
export async function ensureTransformers() {
    if (!tfPipeline) {
        const transformers = await import('@xenova/transformers');
        tfPipeline = await transformers.pipeline('feature-extraction', undefined, {
            model: undefined,
        });
    }
    return tfPipeline;
}

async function embedTransformers(texts, model, legacy = false) {
    const transformers = await import('@xenova/transformers');
    const pipeline = await transformers.pipeline('feature-extraction', model);
    const out = [];
    for (const t of texts) {
        const res = await pipeline(t, { pooling: 'mean', normalize: true });
        out.push(Array.from(res.data));
    }
    return out;
}

export function cosine(a, b) {
    let s = 0,
        na = 0,
        nb = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
        const ai = a[i],
            bi = b[i];
        s += ai * bi;
        na += ai * ai;
        nb += bi * bi;
    }
    return s / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}
