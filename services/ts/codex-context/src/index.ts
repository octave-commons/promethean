import { configDotenv } from 'dotenv';
configDotenv();
import express from 'express';
import bodyParser from 'body-parser';
import { SmartGptrRetriever } from './retriever.js';
import { buildAugmentedPrompt } from './prompt.js';
import { OllamaBackend, OllamaOpenAIBackend } from './backend.js';
import type { BackendConfig } from './backend.js';
import type {
    ChatCompletionsRequest,
    ChatCompletionsResponse,
    CompletionsRequest,
    CompletionsResponse,
    Usage,
} from './types/openai.js';
import { persistArtifact } from './save.js';
import ollama from 'ollama';
import { createLogger } from './logger.js';

export type AppDeps = {
    retriever?: SmartGptrRetriever;
    backendModel?: string;
    backend?: { chat(messages: any[]): Promise<string> };
    docsDir?: string;
};

export function createApp(deps: AppDeps = {}) {
    const app = express();
    app.use(bodyParser.json({ limit: '50mb' }));

    const log = createLogger('codex-context');
    const sessions: Map<string, any[]> = new Map();

    const rawBridgeUrl = process.env.SMARTGPT_URL || 'http://127.0.0.1:3210';
    const SMARTGPT_URL = rawBridgeUrl.endsWith('/v1')
        ? rawBridgeUrl
        : `${rawBridgeUrl.replace(/\/$/, '')}/v1`;
    const SMARTGPT_TOKEN = process.env.SMARTGPT_TOKEN || process.env.SMARTGPT_BEARER;
    const retriever = deps.retriever || new SmartGptrRetriever(SMARTGPT_URL, SMARTGPT_TOKEN);
    const MODEL = deps.backendModel || process.env.LLM_MODEL || 'gemma3:latest';
    const DRIVER = (process.env.BACKEND_DRIVER || 'ollama').toLowerCase();
    const backend =
        deps.backend ||
        (DRIVER === 'ollama-openai'
            ? new OllamaOpenAIBackend(
                  MODEL,
                  process.env.OLLAMA_OPENAI_BASE,
                  process.env.OPENAI_API_KEY,
              )
            : new OllamaBackend(MODEL));

    log.info('service.init', {
        smartgpt_url: SMARTGPT_URL,
        model: MODEL,
        driver: DRIVER,
        token_present: Boolean(SMARTGPT_TOKEN),
        docs_dir: deps.docsDir || 'docs/codex-context',
        routes: [
            'GET /health',
            'GET /v1/models',
            'GET /v1/models/:id',
            'POST /v1/chat/completions',
            'POST /v1/completions',
            'GET /api/tags',
            'POST /api/pull',
        ],
    });

    // Request logging middleware
    app.use((req, _res, next) => {
        (req as any)._start = process.hrtime.bigint();
        next();
    });

    function estimateTokens(text: string) {
        const t = Math.max(1, Math.floor(text.length / 4));
        return t;
    }

    function openAIError(
        res: any,
        http: number,
        type: string,
        message: string,
        param: string | null = null,
    ) {
        return res.status(http).json({
            error: {
                message,
                type,
                param,
                code: String(http),
            },
        });
    }

    const VALID_ROLES = new Set(['system', 'user', 'assistant', 'tool']);
    function validateChatMessages(messages: any[]): string | null {
        if (!messages || !Array.isArray(messages)) return 'messages missing';
        for (let i = 0; i < messages.length; i++) {
            const m = messages[i];
            if (!m || typeof m !== 'object' || typeof m.role !== 'string') {
                return `messages[${i}] invalid`;
            }
            if (!VALID_ROLES.has(m.role)) {
                return `Invalid role in messages[${i}]: ${m.role}`;
            }
            if (typeof m.content !== 'string' && typeof m.content !== 'object') {
                return `messages[${i}].content must be string or object`;
            }
        }
        return null;
    }

    function parseGenParams(body: any): Partial<BackendConfig> {
        const cfg: Partial<BackendConfig> = { model: MODEL, driver: DRIVER as any } as any;
        if (typeof body?.temperature === 'number') cfg.temperature = body.temperature;
        if (typeof body?.top_p === 'number') cfg.top_p = body.top_p;
        if (typeof body?.max_tokens === 'number') cfg.max_tokens = body.max_tokens;
        if (Array.isArray(body?.stop) || typeof body?.stop === 'string') cfg.stop = body.stop;
        return cfg;
    }

    function writeSSEHeaders(res: any) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();
    }

    function sseData(res: any, data: any) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    function sseDone(res: any) {
        res.write('data: [DONE]\n\n');
        res.end();
    }

    function chunkString(str: string, size = 1024): string[] {
        const out: string[] = [];
        for (let i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
        return out;
    }

    app.get('/health', (req, res) => {
        const dur =
            req && (req as any)._start
                ? Number((process.hrtime.bigint() - (req as any)._start) / 1000000n)
                : 0;
        res.json({ ok: true, ms: dur });
    });

    app.get('/v1/models', async (_req, res) => {
        try {
            // Provider passthrough via backend implementation
            const js = await (backend as any).listModels?.();
            if (!js) return openAIError(res, 502, 'server_error', 'Backend did not return models');
            res.json(js);
        } catch (e: any) {
            const msg = e?.message || String(e);
            return openAIError(res, 502, 'server_error', `Failed to list models: ${msg}`);
        }
    });

    app.get('/v1/models/:id', async (req, res) => {
        const id = String(req.params.id || '').trim();
        if (!id) return openAIError(res, 400, 'invalid_request_error', 'id is required', 'id');
        try {
            const js = await (backend as any).getModel?.(id);
            if (!js)
                return openAIError(
                    res,
                    404,
                    'invalid_request_error',
                    `Model not found: ${id}`,
                    'id',
                );
            res.json(js);
        } catch (e: any) {
            const msg = e?.message || String(e);
            return openAIError(res, 502, 'server_error', `Failed to fetch model ${id}: ${msg}`);
        }
    });

    // Minimal Ollama-compat routes used by Codex CLI
    app.get('/api/tags', async (_req, res) => {
        try {
            const list: any = await (ollama as any).list();
            res.json(list);
        } catch (e: any) {
            res.status(502).json({ error: { message: e?.message || String(e) } });
        }
    });

    app.post('/api/pull', async (req, res) => {
        const name = (req.body?.name || req.body?.model || '').trim?.() || '';
        const stream = Boolean(req.body?.stream);
        if (!name)
            return res.status(400).json({ error: { message: 'name (or model) is required' } });
        try {
            if (stream) {
                res.setHeader('Content-Type', 'application/x-ndjson');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                const it = await (ollama as any).pull({ model: name, stream: true });
                for await (const chunk of it) {
                    res.write(JSON.stringify(chunk) + '\n');
                }
                res.end();
            } else {
                const it = await (ollama as any).pull({ model: name, stream: true });
                let last: any = null;
                for await (const chunk of it) last = chunk;
                res.json(last || { status: 'success' });
            }
        } catch (e: any) {
            res.status(502).json({ error: { message: e?.message || String(e) } });
        }
    });

    app.post('/v1/chat/completions', async (req, res) => {
        const span = log.child({ route: 'chat.completions' });
        const body = req.body as ChatCompletionsRequest;
        const msgErr = validateChatMessages((body as any)?.messages);
        if (msgErr) return openAIError(res, 400, 'invalid_request_error', msgErr, 'messages');

        const sessionId = (body as any)?.session_id && String((body as any).session_id);
        const prior: any[] =
            sessionId && sessions.get(sessionId) ? [...(sessions.get(sessionId) as any[])] : [];
        const mergedMessages = prior.length ? [...prior, ...body.messages] : body.messages;

        const lastContent = mergedMessages[mergedMessages.length - 1]?.content;
        const q = typeof lastContent === 'string' ? lastContent : '';
        const t0 = process.hrtime.bigint();
        span.debug('retriever.start', { q_len: q.length });
        const retrieved = await retriever.retrieve(q);
        const t1 = process.hrtime.bigint();
        span.info('retriever.ok', {
            hits: retrieved.search?.length || 0,
            ms: Number((t1 - t0) / 1000000n),
        });

        const aug = buildAugmentedPrompt(mergedMessages, retrieved, {
            maxContextTokens: Number(process.env.MAX_CONTEXT_TOKENS || 1024),
        });
        span.debug('prompt.augmented', {
            citations: aug.citations.length,
            sys_len: aug.finalSystemPrompt.length,
        });
        const t2 = process.hrtime.bigint();
        const genCfg = parseGenParams(body);
        const chatRes: any = await (backend as any).chat(aug.finalMessages, genCfg, {
            tools: (body as any)?.tools,
            tool_choice: (body as any)?.tool_choice,
        });
        const text = typeof chatRes === 'string' ? chatRes : chatRes?.text ?? '';
        const t3 = process.hrtime.bigint();
        span.info('backend.ok', {
            model: body.model || MODEL,
            ms: Number((t3 - t2) / 1000000n),
            out_len: text.length,
        });

        const promptJoined = aug.finalMessages
            .map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content)))
            .join('\n');
        const usage: Usage = {
            prompt_tokens:
                (typeof chatRes === 'object' && chatRes?.usage?.prompt_tokens) ||
                (estimateTokens(promptJoined) as any),
            completion_tokens:
                (typeof chatRes === 'object' && chatRes?.usage?.completion_tokens) ||
                (estimateTokens(text) as any),
            total_tokens:
                (typeof chatRes === 'object' && chatRes?.usage?.total_tokens) ||
                (estimateTokens(promptJoined + text) as any),
        } as any;

        // Derive finish_reason: 'length' if we appear to have hit max_tokens
        let finishReason: 'stop' | 'length' = 'stop';
        if (typeof (body as any)?.max_tokens === 'number') {
            try {
                const est = estimateTokens(text);
                if (est >= (body as any).max_tokens) finishReason = 'length';
            } catch {}
        }

        const toolCalls =
            chatRes?.raw?.message?.tool_calls || chatRes?.raw?.choices?.[0]?.message?.tool_calls;

        const out: ChatCompletionsResponse & { retrieval_context?: any } = {
            id: `chatcmpl_${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: body.model || MODEL,
            choices: [
                {
                    index: 0,
                    finish_reason: finishReason,
                    message: { role: 'assistant', content: text },
                },
            ],
            usage,
            retrieval_context: {
                citations: aug.citations,
                tokens_injected: estimateTokens(aug.contextBlock),
            },
        };

        if (toolCalls) (out.choices[0].message as any).tool_calls = toolCalls;

        try {
            const t4 = process.hrtime.bigint();
            await persistArtifact({
                baseDir: deps.docsDir,
                request: body,
                augmentedSystem: aug.finalSystemPrompt,
                citations: aug.citations,
                responseText: text,
                toolCalls,
            });
            const t5 = process.hrtime.bigint();
            span.info('persist.ok', { ms: Number((t5 - t4) / 1000000n) });
        } catch (e: any) {
            span.warn('persist.error', { err: String(e?.message || e) });
        }

        if (body?.stream) {
            writeSSEHeaders(res);
            const id = out.id;
            const chunks = chunkString(text, 1024);
            // Send role delta first to match OpenAI behavior
            sseData(res, {
                id,
                object: 'chat.completion.chunk',
                created: out.created,
                model: out.model,
                choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }],
            });
            for (const c of chunks) {
                sseData(res, {
                    id,
                    object: 'chat.completion.chunk',
                    created: out.created,
                    model: out.model,
                    choices: [{ index: 0, delta: { content: c }, finish_reason: null }],
                });
            }
            // Final chunk with finish_reason
            sseData(res, {
                id,
                object: 'chat.completion.chunk',
                created: out.created,
                model: out.model,
                choices: [{ index: 0, delta: {}, finish_reason: finishReason }],
            });
            sseDone(res);
        } else {
            res.json(out);
        }

        // persist session history if requested
        if (sessionId) {
            const history = sessions.get(sessionId) || [];
            const toStore = [...history, ...body.messages, { role: 'assistant', content: text }];
            // keep a reasonable cap of last ~200 messages
            sessions.set(sessionId, toStore.slice(-200));
        }
    });

    app.post('/v1/completions', async (req, res) => {
        const span = log.child({ route: 'completions' });
        const body = req.body as CompletionsRequest;
        span.debug('request.body', { has_prompt: Boolean(body?.prompt), model: body?.model });

        // Validate prompt presence and type per OpenAI compat
        if (!('prompt' in (body as any))) {
            return openAIError(res, 400, 'invalid_request_error', 'prompt is required', 'prompt');
        }
        const prompt = Array.isArray(body?.prompt)
            ? body.prompt.join('\n\n')
            : (body?.prompt as any) || '';
        if (typeof prompt !== 'string' || prompt.trim().length === 0) {
            return openAIError(
                res,
                400,
                'invalid_request_error',
                'prompt must be a non-empty string',
                'prompt',
            );
        }
        const sessionId = (body as any)?.session_id && String((body as any).session_id);
        const prior: any[] =
            sessionId && sessions.get(sessionId) ? [...(sessions.get(sessionId) as any[])] : [];

        const t0 = process.hrtime.bigint();
        const retrieved = await retriever.retrieve(prompt);
        const t1 = process.hrtime.bigint();
        span.info('retriever.ok', {
            hits: retrieved.search?.length || 0,
            ms: Number((t1 - t0) / 1000000n),
            q_len: prompt.length,
        });
        const messages = [...prior, { role: 'user' as const, content: prompt }];
        const aug = buildAugmentedPrompt(messages, retrieved);
        span.debug('prompt.augmented', {
            citations: aug.citations.length,
            sys_len: aug.finalSystemPrompt.length,
        });
        const t2 = process.hrtime.bigint();
        const genCfg = parseGenParams(body);
        const chatRes: any = await (backend as any).chat(aug.finalMessages, genCfg);
        const text = typeof chatRes === 'string' ? chatRes : chatRes?.text ?? '';
        const t3 = process.hrtime.bigint();
        span.info('backend.ok', {
            model: body.model || MODEL,
            ms: Number((t3 - t2) / 1000000n),
            out_len: text.length,
        });

        const promptJoined = aug.finalMessages
            .map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content)))
            .join('\n');
        const usage: Usage = {
            prompt_tokens:
                (typeof chatRes === 'object' && chatRes?.usage?.prompt_tokens) ||
                (estimateTokens(promptJoined) as any),
            completion_tokens:
                (typeof chatRes === 'object' && chatRes?.usage?.completion_tokens) ||
                (estimateTokens(text) as any),
            total_tokens:
                (typeof chatRes === 'object' && chatRes?.usage?.total_tokens) ||
                (estimateTokens(promptJoined + text) as any),
        } as any;

        // Derive finish_reason: 'length' if we appear to have hit max_tokens
        let finishReason: 'stop' | 'length' = 'stop';
        if (typeof (body as any)?.max_tokens === 'number') {
            try {
                const est = estimateTokens(text);
                if (est >= (body as any).max_tokens) finishReason = 'length';
            } catch {}
        }

        const out: CompletionsResponse & { retrieval_context?: any } = {
            id: `cmpl_${Date.now()}`,
            object: 'text_completion',
            created: Math.floor(Date.now() / 1000),
            model: body.model || MODEL,
            choices: [{ text, index: 0, logprobs: null, finish_reason: finishReason }],
            usage,
            retrieval_context: {
                citations: aug.citations,
                tokens_injected: estimateTokens(aug.contextBlock),
            },
        };

        try {
            const t4 = process.hrtime.bigint();
            await persistArtifact({
                baseDir: deps.docsDir,
                request: body,
                augmentedSystem: aug.finalSystemPrompt,
                citations: aug.citations,
                responseText: text,
            });
            const t5 = process.hrtime.bigint();
            span.info('persist.ok', { ms: Number((t5 - t4) / 1000000n) });
        } catch (e: any) {
            span.warn('persist.error', { err: String(e?.message || e) });
        }

        if (body?.stream) {
            writeSSEHeaders(res);
            const id = out.id;
            const chunks = chunkString(text, 1024);
            for (const c of chunks) {
                sseData(res, {
                    id,
                    object: 'text_completion.chunk',
                    created: out.created,
                    model: out.model,
                    choices: [{ text: c, index: 0, logprobs: null, finish_reason: null }],
                });
            }
            sseData(res, {
                id,
                object: 'text_completion.chunk',
                created: out.created,
                model: out.model,
                choices: [{ text: '', index: 0, logprobs: null, finish_reason: finishReason }],
            });
            sseDone(res);
        } else {
            res.json(out);
        }

        if (sessionId) {
            const history = sessions.get(sessionId) || [];
            const toStore = [
                ...history,
                { role: 'user' as const, content: prompt },
                { role: 'assistant' as const, content: text },
            ];
            sessions.set(sessionId, toStore.slice(-200));
        }
    });

    return app;
}

export async function start() {
    const log = createLogger('codex-context');
    const app = createApp();
    const port = Number(process.env.PORT || 8140);
    return app.listen(port, '0.0.0.0', () => {
        log.info('service.listening', { port });
    });
}

if (process.env.NODE_ENV !== 'test') {
    start();
}
