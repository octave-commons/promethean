import { configDotenv } from 'dotenv';
configDotenv();
import express from 'express';
import bodyParser from 'body-parser';
import { SmartGptrRetriever } from './retriever.js';
import { buildAugmentedPrompt } from './prompt.js';
import { OllamaBackend } from './backend.js';
import type {
    ChatCompletionsRequest,
    ChatCompletionsResponse,
    CompletionsRequest,
    CompletionsResponse,
    Usage,
} from './types/openai.js';
import { persistArtifact } from './save.js';

export type AppDeps = {
    retriever?: SmartGptrRetriever;
    backendModel?: string;
    backend?: { chat(messages: any[]): Promise<string> };
    docsDir?: string;
};

export function createApp(deps: AppDeps = {}) {
    const app = express();
    app.use(bodyParser.json({ limit: '50mb' }));

    const SMARTGPT_URL = process.env.SMARTGPT_URL || 'http://127.0.0.1:3210';
    const SMARTGPT_TOKEN = process.env.SMARTGPT_TOKEN || process.env.SMARTGPT_BEARER;
    const retriever = deps.retriever || new SmartGptrRetriever(SMARTGPT_URL, SMARTGPT_TOKEN);
    const MODEL = deps.backendModel || process.env.LLM_MODEL || 'gemma3:latest';
    const backend = deps.backend || new OllamaBackend(MODEL);

    function estimateTokens(text: string) {
        const t = Math.max(1, Math.floor(text.length / 4));
        return t;
    }

    app.get('/health', (_req, res) => {
        res.json({ ok: true });
    });

    app.post('/v1/chat/completions', async (req, res) => {
        const body = req.body as ChatCompletionsRequest;
        if (body?.stream) return res.status(400).json({ error: 'stream=true not supported yet' });
        if (!body?.messages || !Array.isArray(body.messages))
            return res.status(400).json({ error: 'messages missing' });

        const retrieved = await retriever.retrieve(
            (body.messages[body.messages.length - 1]?.content as string) || '',
        );
        const aug = buildAugmentedPrompt(body.messages, retrieved);
        const text = await backend.chat(aug.finalMessages);

        const promptChars = aug.finalMessages.map((m) => m.content).join('\n').length;
        const completionChars = text.length;
        const usage: Usage = {
            prompt_tokens: estimateTokens(String(promptChars)) as any,
            completion_tokens: estimateTokens(String(completionChars)) as any,
            total_tokens: estimateTokens(String(promptChars + completionChars)) as any,
        } as any;

        const out: ChatCompletionsResponse = {
            id: `chatcmpl_${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: body.model || MODEL,
            choices: [
                {
                    index: 0,
                    finish_reason: 'stop',
                    message: { role: 'assistant', content: text },
                },
            ],
            usage,
        };

        try {
            await persistArtifact({
                baseDir: deps.docsDir,
                request: body,
                augmentedSystem: aug.finalSystemPrompt,
                citations: aug.citations,
                responseText: text,
            });
        } catch (_) {}

        res.json(out);
    });

    app.post('/v1/completions', async (req, res) => {
        const body = req.body as CompletionsRequest;
        if (body?.stream) return res.status(400).json({ error: 'stream=true not supported yet' });
        const prompt = Array.isArray(body?.prompt) ? body.prompt.join('\n\n') : body?.prompt || '';
        const retrieved = await retriever.retrieve(prompt);
        const messages = [{ role: 'user' as const, content: prompt }];
        const aug = buildAugmentedPrompt(messages, retrieved);
        const text = await backend.chat(aug.finalMessages);

        const usage: Usage = {
            prompt_tokens: Math.floor(aug.finalSystemPrompt.length / 4) as any,
            completion_tokens: Math.floor(text.length / 4) as any,
            total_tokens: Math.floor((aug.finalSystemPrompt.length + text.length) / 4) as any,
        } as any;

        const out: CompletionsResponse = {
            id: `cmpl_${Date.now()}`,
            object: 'text_completion',
            created: Math.floor(Date.now() / 1000),
            model: body.model || MODEL,
            choices: [{ text, index: 0, logprobs: null, finish_reason: 'stop' }],
            usage,
        };

        try {
            await persistArtifact({
                baseDir: deps.docsDir,
                request: body,
                augmentedSystem: aug.finalSystemPrompt,
                citations: aug.citations,
                responseText: text,
            });
        } catch (_) {}

        res.json(out);
    });

    return app;
}

export async function start() {
    const app = createApp();
    const port = Number(process.env.PORT || 8140);
    return app.listen(port, '0.0.0.0', () => {
        console.log(`codex-context listening on ${port}`);
    });
}

if (process.env.NODE_ENV !== 'test') {
    start();
}
