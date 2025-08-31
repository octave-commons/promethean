// context-builder.js (ESM) — provider-agnostic context assembly utilities
// vanilla, no deps. Split into sections you can extract into separate files later.
//
// Provides:
//  - createEventBus() — tiny pub/sub
//  - estimateTokens(), countChipTokens() — tiktoken-lite heuristic
//  - makeChip(), hashId() — stable chip ids
//  - trimToBudget(), packBlocks() — greedy budget packer with priority
//  - ContextBuilder.build() — orchestrates: last M msgs + pins + files + RAG + search
//  - ContextBuilder.assemblePrompt() — deterministic prompt sections for transparency
//  - Adapters: chromaHttpProvider, filesHttpProvider, simpleSearchProvider
//
// Everything is provider-agnostic. Supply providers you already have (Ollama, Cephalon, Bridge).

// -----------------------------
// Event Bus
// -----------------------------
export function createEventBus() {
    const subs = new Map();
    return {
        on(type, fn) {
            (subs.get(type) ?? subs.set(type, new Set()).get(type)).add(fn);
            return () => subs.get(type)?.delete(fn);
        },
        emit(evt) {
            subs.get(evt.type)?.forEach((fn) => {
                try {
                    fn(evt);
                } catch (e) {
                    console.error('bus handler error', e);
                }
            });
        },
    };
}

// -----------------------------
// Token estimation (fast heuristic)
// -----------------------------
// Roughly 4 chars/token for English; add small structure overhead.
export function estimateTokens(text) {
    if (!text) return 0;
    const chars = typeof text === 'string' ? text.length : ('' + text).length;
    return Math.ceil(chars / 4) + 4; // +structure overhead
}

export function countChipTokens(chip) {
    const base = estimateTokens(chip?.payload?.text || '');
    const meta = estimateTokens(chip?.title || '') + 6; // id, labels, etc.
    return base + meta;
}

// -----------------------------
// IDs & Chips
// -----------------------------
export function hashId(s) {
    // FNV-1a 32-bit
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
}

/**
 * @typedef {Object} Chip
 * @property {string} id             // stable id (hash)
 * @property {('pin'|'file'|'rag'|'search'|'msg')} kind
 * @property {string} title          // short label
 * @property {boolean} selected      // included in prompt?
 * @property {number} tokens         // estimated tokens
 * @property {{text:string, citation?:string}} payload
 * @property {Object} [meta]         // arbitrary (score, path, lines, ts, etc.)
 */

export function makeChip(kind, title, payload, meta = {}) {
    const rawId = `${kind}|${title}|${payload?.citation || ''}|${
        payload?.text?.slice(0, 128) || ''
    }`;
    const id = hashId(rawId);
    const chip = { id, kind, title, selected: true, payload, meta, tokens: 0 };
    chip.tokens = countChipTokens(chip);
    return chip;
}

export function dedupeChips(chips) {
    const seen = new Map();
    for (const c of chips || []) {
        if (!seen.has(c.id)) seen.set(c.id, c);
    }
    return [...seen.values()];
}

// -----------------------------
// Budget packing & trimming
// -----------------------------
export function trimToBudget(blocks, budget) {
    // blocks: [label, Chip[]]
    const out = [];
    let used = 0;
    for (const [label, arr] of blocks) {
        const kept = [];
        for (const c of arr) {
            const t = c.tokens || countChipTokens(c);
            if (used + t <= budget) {
                kept.push(c);
                used += t;
            } else {
                /* drop */
            }
        }
        out.push([label, kept]);
    }
    return { blocks: out, used };
}

export function packBlocks(blocks, budget, priorityOrder) {
    // priorityOrder: array of labels in priority sequence
    const byLabel = new Map(blocks.map(([l, a]) => [l, [...a]]));
    const out = priorityOrder.map((l) => [l, []]);
    let used = 0;

    for (const label of priorityOrder) {
        const src = byLabel.get(label) || [];
        const dst = out.find(([l]) => l === label)[1];
        for (const c of src) {
            const t = c.tokens || countChipTokens(c);
            if (used + t <= budget) {
                dst.push(c);
                used += t;
            } else break;
        }
    }
    return { blocks: out, used };
}

// -----------------------------
// Providers (adapters)
// -----------------------------
// 1) Files — SmartGPT Bridge files API (robust to line/lines param)
export function filesHttpProvider({ baseUrl = '/v1/files' } = {}) {
    return {
        async view(path, opts = {}) {
            const q = new URLSearchParams();
            if (opts.lines != null) q.set('lines', String(opts.lines));
            if (opts.line != null) q.set('line', String(opts.line)); // fallback for older handler
            if (opts.context != null) q.set('context', String(opts.context));
            const res = await fetch(
                `${baseUrl.replace(/\/$/, '')}/view/${encodeURIComponent(path)}?${q.toString()}`,
            );
            if (!res.ok) throw new Error(`files.view ${res.status}`);
            return res.json(); // expected: { ok:true, path, text, start, end, ... }
        },
        async list(params = {}) {
            const q = new URLSearchParams(params);
            const res = await fetch(`${baseUrl.replace(/\/$/, '')}?${q.toString()}`);
            if (!res.ok) throw new Error(`files.list ${res.status}`);
            return res.json();
        },
    };
}

// 2) Chroma HTTP — query by embedding (you provide embedder)
export function chromaHttpProvider({ baseUrl, collection }) {
    if (!baseUrl || !collection) console.warn('chromaHttpProvider: missing baseUrl/collection');
    return {
        async query({ embedding, topK = 8, where = {} }) {
            const body = {
                topK,
                vector: embedding,
                where,
                include: ['metadatas', 'documents', 'distances', 'ids'],
            };
            const res = await fetch(
                `${baseUrl.replace(/\/$/, '')}/collections/${encodeURIComponent(collection)}/query`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                },
            );
            if (!res.ok) throw new Error('chroma.query ' + res.status);
            const j = await res.json();
            // Normalize to array of { id, text, score, meta }
            const out = [];
            const ids = j.ids?.[0] || [];
            const docs = j.documents?.[0] || [];
            const metas = j.metadatas?.[0] || [];
            const dists = j.distances?.[0] || [];
            for (let i = 0; i < ids.length; i++) {
                out.push({
                    id: ids[i],
                    text: docs[i],
                    score: typeof dists[i] === 'number' ? 1 - dists[i] : undefined,
                    meta: metas[i],
                });
            }
            return out;
        },
    };
}

// 3) Simple search provider — expects a server endpoint returning filename/snippet
export function simpleSearchProvider({ url }) {
    return {
        async search(q, { topS = 3 } = {}) {
            const res = await fetch(`${url}?${new URLSearchParams({ q, k: String(topS) })}`);
            if (!res.ok) throw new Error('search ' + res.status);
            const j = await res.json(); // [{ title, snippet, path, score, url }]
            return j;
        },
    };
}

// -----------------------------
// ContextBuilder
// -----------------------------
export const ContextBuilder = {
    /**
     * Build chips and organized blocks based on policy and budget.
     * @param {Object} params
     * @param {{id:string, role:'user'|'assistant'|'system'|'tool', content:string, ts?:number}[]} params.messages
     * @param {{ path:string, cursorLine?:number }[]} [params.openFiles]
     * @param {Chip[]} [params.pins]
     * @param {number} [params.M=6]  // last chat tail messages
     * @param {number} [params.K=8]  // RAG hits
     * @param {number} [params.S=3]  // search results
     * @param {number} [params.F=4]  // file chunks
     * @param {number} [params.ctxBudgetTokens=9000]
     * @param {{ embed:(text:string)=>Promise<number[]>, ragQuery:({embedding:any, topK:number})=>Promise<any[]> }} [params.rag]
     * @param {{ search:(q:string,{topS?:number})=>Promise<any[]> }} [params.search]
     * @param {{ view:(path:string,opts:{lines?:number,line?:number,context?:number})=>Promise<any> }} [params.files]
     * @param {string} [params.query] // user live query for RAG/search
     */
    async build(params) {
        const {
            messages = [],
            openFiles = [],
            pins = [],
            M = 6,
            K = 8,
            S = 3,
            F = 4,
            ctxBudgetTokens = 9000,
            rag,
            search,
            files,
            query,
        } = params;

        // 1) Pinned chips — already chips
        const pinChips = (pins || []).map((c) => ({ ...c, selected: true }));

        // 2) File chips — fetch top F recent open files, one chunk each
        const fileChips = [];
        if (files && openFiles?.length) {
            const take = openFiles.slice(-F);
            for (const ofile of take) {
                try {
                    const info = await files.view(ofile.path, {
                        line: ofile.cursorLine ?? undefined,
                        lines: 400,
                        context: 120,
                    });
                    const title = `${ofile.path}${
                        info?.start != null && info?.end != null
                            ? `#L${info.start}-L${info.end}`
                            : ''
                    }`;
                    fileChips.push(
                        makeChip(
                            'file',
                            title,
                            { text: info?.text || '', citation: title },
                            { path: ofile.path, start: info?.start, end: info?.end },
                        ),
                    );
                } catch (e) {
                    console.warn('file view failed', ofile.path, e);
                }
            }
        }

        // 3) RAG chips — K best matches
        const ragChips = [];
        if (rag && query) {
            try {
                const emb = await rag.embed(query);
                const hits = await rag.ragQuery({ embedding: emb, topK: K });
                for (const h of hits) {
                    const title = h.meta?.title || h.meta?.path || h.id || 'RAG';
                    ragChips.push(
                        makeChip(
                            'rag',
                            title,
                            { text: h.text || '', citation: h.id },
                            { score: h.score, ...h.meta },
                        ),
                    );
                }
            } catch (e) {
                console.warn('rag query failed', e);
            }
        }

        // 4) Search chips — S best results
        const searchChips = [];
        if (search && query) {
            try {
                const results = await search.search(query, { topS: S });
                for (const r of results) {
                    const title = r.title || r.path || r.url || 'Search';
                    const snippet = r.snippet || '';
                    searchChips.push(
                        makeChip(
                            'search',
                            title,
                            { text: snippet, citation: r.url || r.path },
                            { score: r.score, path: r.path, url: r.url },
                        ),
                    );
                }
            } catch (e) {
                console.warn('search failed', e);
            }
        }

        // 5) Chat tail chips — last M non-system/tool messages (as one combined block or per-message chips)
        const tailMsgs = messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .slice(-M);
        const msgChips = tailMsgs.map((m, idx) =>
            makeChip(
                'msg',
                `${m.role}#${tailMsgs.length - idx}`,
                { text: m.content },
                { ts: m.ts },
            ),
        );

        // Combine and dedupe
        let allChips = dedupeChips([
            ...pinChips,
            ...fileChips,
            ...ragChips,
            ...searchChips,
            ...msgChips,
        ]);

        // Default selection policy: all selected; will be trimmed by budget
        allChips = allChips.map((c) => ({ ...c, selected: true, tokens: countChipTokens(c) }));

        // Organize into labeled blocks for deterministic packing
        const blocks = [
            ['[PIN]', allChips.filter((c) => c.kind === 'pin')],
            ['[FILE]', allChips.filter((c) => c.kind === 'file')],
            ['[RAG]', allChips.filter((c) => c.kind === 'rag')],
            ['[SEARCH]', allChips.filter((c) => c.kind === 'search')],
            ['[CHAT]', allChips.filter((c) => c.kind === 'msg')],
        ];

        // Greedy pack according to policy (pinned highest)
        const priority = ['[PIN]', '[FILE]', '[RAG]', '[SEARCH]', '[CHAT]'];
        const { blocks: packed, used } = packBlocks(blocks, ctxBudgetTokens, priority);

        // Create final selected set based on packing result
        const selectedIds = new Set(packed.flatMap(([_, arr]) => arr.map((c) => c.id)));
        const chips = allChips.map((c) => ({ ...c, selected: selectedIds.has(c.id) }));

        return { chips, blocks: packed, usedTokens: used };
    },

    /**
     * Build a transparent, sectioned prompt from chips + system + tail messages.
     * @param {Object} params
     * @param {Chip[]} params.chips
     * @param {string} [params.systemPrompt]
     * @param {number} [params.M=6]
     */
    assemblePrompt({ chips, systemPrompt = '', M = 6 }) {
        const sections = [];
        if (systemPrompt) sections.push(`<System>\n${systemPrompt}\n</System>`);

        function lines(label) {
            const arr = chips.filter((c) => c.selected && label === kindToLabel(c.kind));
            if (!arr.length) return '';
            const body = arr.map((c) => `[#${c.id}] ${c.payload?.text || ''}`).join('\n\n');
            return `${label}\n${body}`;
        }

        sections.push(lines('[PIN]'));
        sections.push(lines('[FILE]'));
        sections.push(lines('[RAG]'));
        sections.push(lines('[SEARCH]'));

        // Chat tail as role-tagged, in natural order
        const tail = chips.filter((c) => c.selected && c.kind === 'msg');
        if (tail.length) {
            const msgs = tail
                .map((c) =>
                    c.title.startsWith('user')
                        ? `user: ${c.payload.text}`
                        : `assistant: ${c.payload.text}`,
                )
                .join('\n');
            sections.push(`[CHAT]\n${msgs}`);
        }

        return sections.filter(Boolean).join('\n\n');
    },
};

function kindToLabel(k) {
    return k === 'pin'
        ? '[PIN]'
        : k === 'file'
          ? '[FILE]'
          : k === 'rag'
            ? '[RAG]'
            : k === 'search'
              ? '[SEARCH]'
              : '[CHAT]';
}

// -----------------------------
// Example wiring (opt-in, remove if bundling elsewhere)
// -----------------------------
export async function exampleBuild(bus, opts) {
    const {
        messages,
        openFiles,
        pins,
        query,
        files = filesHttpProvider({ baseUrl: '/v1/files' }),
        rag = null, // supply { embed, ragQuery }
        search = null,
        M = 6,
        K = 8,
        S = 3,
        F = 4,
        ctxBudgetTokens = 9000,
    } = opts;

    const { chips, blocks, usedTokens } = await ContextBuilder.build({
        messages,
        openFiles,
        pins,
        query,
        files,
        rag,
        search,
        M,
        K,
        S,
        F,
        ctxBudgetTokens,
    });
    bus?.emit({ type: 'CONTEXT_BUILT', chips, blocks, usedTokens });
    return { chips, blocks, usedTokens };
}

// -----------------------------
// Mermaid reference: end-to-end data flow
// -----------------------------
export const CONTEXT_FLOW_MERMAID = `
flowchart LR
  UI[Chat Panel] -->|compose| BuildCtx{{Build Context}}
  Files[File API] -->|view chunks| BuildCtx
  RAG[Chroma] -->|K best| BuildCtx
  Search[Search API] -->|S best| BuildCtx
  BuildCtx -->|chips\nblocks| Preview[Prompt Preview]
  Preview --> Send[Provider/Ollama/Broker]
`;
