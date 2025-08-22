import nodeFetch from 'node-fetch';
import { createLogger } from './logger.js';

export type SearchHit = {
    path: string;
    snippet?: string;
    text?: string;
    startLine?: number;
    endLine?: number;
};

export type RetrieverResult = {
    search: SearchHit[];
    grep?: Array<{
        path: string;
        line: number;
        lineText?: string;
        startLine?: number;
        endLine?: number;
    }>;
    symbols?: Array<{
        path: string;
        name: string;
        kind: string;
        startLine?: number;
        endLine?: number;
        signature?: string;
    }>;
};

export type RetrieverOptions = {
    baseUrl?: string;
    token?: string;
    n?: number;
};

export interface Retriever {
    retrieve(query: string, opts?: Partial<RetrieverOptions>): Promise<RetrieverResult>;
}

export class SmartGptrRetriever implements Retriever {
    private fetcher: (url: string, init?: any) => Promise<any>;
    private log = createLogger('codex-context', { component: 'retriever' });
    constructor(
        private baseUrl: string,
        private token?: string,
        fetchImpl?: (url: string, init?: any) => Promise<any>,
    ) {
        // Prefer provided impl, then global fetch, then node-fetch
        // @ts-ignore
        this.fetcher = fetchImpl || (globalThis as any).fetch || (nodeFetch as any);
    }

    private headers() {
        const h: Record<string, string> = { 'content-type': 'application/json' };
        if (this.token) h['authorization'] = `Bearer ${this.token}`;
        return h;
    }

    async retrieve(query: string, opts: Partial<RetrieverOptions> = {}): Promise<RetrieverResult> {
        const base = opts.baseUrl || this.baseUrl;
        const n = opts.n ?? 6;
        const headers = this.headers();
        const out: RetrieverResult = { search: [] };
        const t0 = process.hrtime.bigint();
        try {
            const s = await this.fetcher(`${base}/search`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ q: query, n }),
            });
            const js = (await s.json()) as any;
            const results = Array.isArray(js?.results) ? js.results : js?.results?.results || [];
            out.search = results.map((r: any) => ({
                path: String(r.path || r.metadata?.path || r.file || 'unknown'),
                snippet: String(r.snippet || r.text || r.chunk || ''),
                startLine: Number(r.startLine || r.metadata?.startLine || 1) || undefined,
                endLine: Number(r.endLine || r.metadata?.endLine || 1) || undefined,
            }));
            const t1 = process.hrtime.bigint();
            this.log.info('search.ok', {
                hits: out.search.length,
                ms: Number((t1 - t0) / 1000000n),
            });
        } catch (e) {
            // Swallow and proceed; no context available
            const t1 = process.hrtime.bigint();
            out.search = [];
            this.log.warn('search.error', {
                ms: Number((t1 - t0) / 1000000n),
                err: String((e as any)?.message || e),
            });
        }
        // Best-effort symbols
        try {
            const resp = await this.fetcher(`${base}/symbols/find`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query, limit: 50 }),
            });
            const js = (await resp.json()) as any;
            const arr = Array.isArray(js?.results) ? js.results : [];
            out.symbols = arr.map((s: any) => ({
                path: String(s.path || ''),
                name: String(s.name || ''),
                kind: String(s.kind || ''),
                startLine: s.startLine ? Number(s.startLine) : undefined,
                endLine: s.endLine ? Number(s.endLine) : undefined,
                signature: s.signature ? String(s.signature) : undefined,
            }));
            this.log.debug('symbols.ok', { count: out.symbols ? out.symbols.length : 0 });
        } catch (e) {
            this.log.debug('symbols.skip', { err: String((e as any)?.message || e) });
        }
        // Best-effort grep
        try {
            const resp = await this.fetcher(`${base}/grep`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    pattern: String(query),
                    flags: 'i',
                    maxMatches: 40,
                    context: 1,
                }),
            });
            const js = (await resp.json()) as any;
            const arr = Array.isArray(js?.results) ? js.results : [];
            out.grep = arr.map((g: any) => ({
                path: String(g.path || ''),
                line: Number(g.line || 1),
                lineText: g.lineText ? String(g.lineText) : undefined,
                startLine: g.startLine ? Number(g.startLine) : undefined,
                endLine: g.endLine ? Number(g.endLine) : undefined,
            }));
            this.log.debug('grep.ok', { count: out.grep ? out.grep.length : 0 });
        } catch (e) {
            this.log.debug('grep.skip', { err: String((e as any)?.message || e) });
        }
        return out;
    }
}
