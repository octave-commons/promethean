import ollama from 'ollama';
import type { ChatMessage } from './types/openai.js';
import { createLogger } from './logger.js';
import nodeFetch from 'node-fetch';

export type GenerationParams = {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stop?: string | string[] | null;
};

export type BackendConfig =
    | ({
          driver: 'ollama';
          model: string;
      } & GenerationParams)
    | ({
          driver: 'ollama-openai';
          model: string;
          baseUrl?: string; // e.g. http://127.0.0.1:11434/v1
          apiKey?: string; // optional; Ollama ignores but OpenAI client expects it
      } & GenerationParams);

export interface BackendClient {
    chat(
        messages: ChatMessage[],
        cfg?: Partial<BackendConfig>,
    ): Promise<
        | string
        | {
              text: string;
              usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
              raw?: any;
          }
    >;
    listModels(cfg?: Partial<BackendConfig>): Promise<any>;
    getModel(id: string, cfg?: Partial<BackendConfig>): Promise<any | null>;
}

export class OllamaBackend implements BackendClient {
    private log = createLogger('codex-context', { component: 'backend', driver: 'ollama' });
    constructor(private model: string) {}

    async chat(
        messages: ChatMessage[],
        cfg: Partial<BackendConfig> = {},
    ): Promise<
        | string
        | {
              text: string;
              usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
              raw?: any;
          }
    > {
        const t0 = process.hrtime.bigint();
        try {
            this.log.debug('chat.start', { model: this.model, msgs: messages.length });
            const res: any = await (ollama as any).chat({
                model: this.model,
                messages: messages.map((m) => ({ role: m.role as any, content: m.content })),
                options: {
                    temperature: cfg.temperature,
                    top_p: cfg.top_p,
                    num_predict: cfg.max_tokens,
                    stop: Array.isArray((cfg as any).stop)
                        ? ((cfg as any).stop as string[])
                        : typeof (cfg as any).stop === 'string'
                          ? [String((cfg as any).stop)]
                          : undefined,
                },
            });
            const t1 = process.hrtime.bigint();
            const text = res?.message?.content || '';
            const usage = {
                prompt_tokens:
                    typeof res?.prompt_eval_count === 'number' ? res.prompt_eval_count : undefined,
                completion_tokens: typeof res?.eval_count === 'number' ? res.eval_count : undefined,
                total_tokens:
                    typeof res?.eval_count === 'number' &&
                    typeof res?.prompt_eval_count === 'number'
                        ? res.eval_count + res.prompt_eval_count
                        : undefined,
            };
            this.log.info('chat.ok', { ms: Number((t1 - t0) / 1000000n), out_len: text.length });
            return { text, usage, raw: res };
        } catch (e: any) {
            const t1 = process.hrtime.bigint();
            this.log.error('chat.error', {
                ms: Number((t1 - t0) / 1000000n),
                err: String(e?.message || e),
            });
            throw e;
        }
    }

    async listModels(): Promise<any> {
        // Map Ollama's list to OpenAI-like schema
        const t0 = process.hrtime.bigint();
        try {
            const res: any = await (ollama as any).list();
            const now = Math.floor(Date.now() / 1000);
            const data = (res?.models || []).map((m: any) => {
                const id = m?.name || m?.model || m?.id || 'unknown';
                let created = now;
                const ts = m?.modified_at || m?.created_at;
                if (ts) {
                    const k = Date.parse(ts);
                    if (!Number.isNaN(k)) created = Math.floor(k / 1000);
                }
                return { id, object: 'model', created, owned_by: 'system' };
            });
            const t1 = process.hrtime.bigint();
            this.log.info('models.ok', { count: data.length, ms: Number((t1 - t0) / 1000000n) });
            return { object: 'list', data };
        } catch (e: any) {
            const t1 = process.hrtime.bigint();
            this.log.error('models.error', {
                ms: Number((t1 - t0) / 1000000n),
                err: String(e?.message || e),
            });
            throw e;
        }
    }

    async getModel(id: string): Promise<any | null> {
        const t0 = process.hrtime.bigint();
        try {
            const now = Math.floor(Date.now() / 1000);
            // Prefer show() for detail if available
            let created = now;
            try {
                const detail: any = await (ollama as any).show({ model: id });
                const ts = detail?.modified_at || detail?.created_at;
                if (ts) {
                    const k = Date.parse(ts);
                    if (!Number.isNaN(k)) created = Math.floor(k / 1000);
                }
                const obj = { id, object: 'model', created, owned_by: 'system' };
                const t1 = process.hrtime.bigint();
                this.log.info('model.ok', { id, ms: Number((t1 - t0) / 1000000n) });
                return obj;
            } catch {
                // fallback to list() and find
                const res: any = await (ollama as any).list();
                const hit = (res?.models || []).find(
                    (m: any) => m?.name === id || m?.model === id || m?.id === id,
                );
                if (!hit) return null;
                const ts = hit?.modified_at || hit?.created_at;
                if (ts) {
                    const k = Date.parse(ts);
                    if (!Number.isNaN(k)) created = Math.floor(k / 1000);
                }
                const obj = { id, object: 'model', created, owned_by: 'system' };
                const t1 = process.hrtime.bigint();
                this.log.info('model.ok', { id, ms: Number((t1 - t0) / 1000000n) });
                return obj;
            }
        } catch (e: any) {
            const t1 = process.hrtime.bigint();
            this.log.error('model.error', {
                id,
                ms: Number((t1 - t0) / 1000000n),
                err: String(e?.message || e),
            });
            throw e;
        }
    }
}

export class OllamaOpenAIBackend implements BackendClient {
    private log = createLogger('codex-context', { component: 'backend', driver: 'ollama-openai' });
    private baseUrl: string;
    private apiKey?: string;
    constructor(
        private model: string,
        baseUrl?: string,
        apiKey?: string,
    ) {
        this.baseUrl = baseUrl || process.env.OLLAMA_OPENAI_BASE || 'http://127.0.0.1:11434/v1';
        this.apiKey = apiKey || process.env.OPENAI_API_KEY || 'ollama';
    }

    async chat(
        messages: ChatMessage[],
        cfg: Partial<BackendConfig> = {},
    ): Promise<
        | string
        | {
              text: string;
              usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
              raw?: any;
          }
    > {
        const base = (cfg && 'baseUrl' in (cfg as any) && (cfg as any).baseUrl) || this.baseUrl;
        const apiKey = (cfg && 'apiKey' in (cfg as any) && (cfg as any).apiKey) || this.apiKey;
        const url = `${base.replace(/\/$/, '')}/chat/completions`;
        const payload = {
            model: this.model,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            stream: false,
            temperature: cfg.temperature,
            top_p: cfg.top_p,
            max_tokens: cfg.max_tokens,
            stop: cfg.stop ?? undefined,
        };
        const headers: Record<string, string> = {
            'content-type': 'application/json',
        };
        if (apiKey) headers['authorization'] = `Bearer ${apiKey}`;

        const t0 = process.hrtime.bigint();
        try {
            this.log.debug('chat.start', { base, model: this.model, msgs: messages.length });
            const resp = await nodeFetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });
            const js: any = await resp.json();
            const t1 = process.hrtime.bigint();
            const text = js?.choices?.[0]?.message?.content || js?.choices?.[0]?.text || '';
            const usage = js?.usage
                ? {
                      prompt_tokens: js.usage.prompt_tokens,
                      completion_tokens: js.usage.completion_tokens,
                      total_tokens: js.usage.total_tokens,
                  }
                : undefined;
            this.log.info('chat.ok', { ms: Number((t1 - t0) / 1000000n), out_len: text.length });
            return { text, usage, raw: js };
        } catch (e: any) {
            const t1 = process.hrtime.bigint();
            this.log.error('chat.error', {
                ms: Number((t1 - t0) / 1000000n),
                err: String(e?.message || e),
            });
            throw e;
        }
    }

    async listModels(cfg: Partial<BackendConfig> = {}): Promise<any> {
        const base = (cfg && 'baseUrl' in (cfg as any) && (cfg as any).baseUrl) || this.baseUrl;
        const apiKey = (cfg && 'apiKey' in (cfg as any) && (cfg as any).apiKey) || this.apiKey;
        const url = `${base.replace(/\/$/, '')}/models`;
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        if (apiKey) headers['authorization'] = `Bearer ${apiKey}`;
        const t0 = process.hrtime.bigint();
        try {
            const resp = await nodeFetch(url, { method: 'GET', headers });
            const js: any = await resp.json();
            const t1 = process.hrtime.bigint();
            this.log.info('models.ok', {
                count: js?.data?.length ?? 0,
                ms: Number((t1 - t0) / 1000000n),
            });
            return js; // pass-through
        } catch (e: any) {
            const t1 = process.hrtime.bigint();
            this.log.error('models.error', {
                ms: Number((t1 - t0) / 1000000n),
                err: String(e?.message || e),
            });
            throw e;
        }
    }

    async getModel(id: string, cfg: Partial<BackendConfig> = {}): Promise<any> {
        const base = (cfg && 'baseUrl' in (cfg as any) && (cfg as any).baseUrl) || this.baseUrl;
        const apiKey = (cfg && 'apiKey' in (cfg as any) && (cfg as any).apiKey) || this.apiKey;
        const url = `${base.replace(/\/$/, '')}/models/${encodeURIComponent(id)}`;
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        if (apiKey) headers['authorization'] = `Bearer ${apiKey}`;
        const t0 = process.hrtime.bigint();
        try {
            const resp = await nodeFetch(url, { method: 'GET', headers });
            const js: any = await resp.json();
            const t1 = process.hrtime.bigint();
            this.log.info('model.ok', { id, ms: Number((t1 - t0) / 1000000n) });
            return js; // pass-through
        } catch (e: any) {
            const t1 = process.hrtime.bigint();
            this.log.error('model.error', {
                id,
                ms: Number((t1 - t0) / 1000000n),
                err: String(e?.message || e),
            });
            throw e;
        }
    }
}
