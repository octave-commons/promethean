import { promises as fs } from 'node:fs';

import { RouterLLM } from './router.js';
import { FileCacheLLM } from './cache.js';
import { OllamaLLM } from './ollama.js';
import { OpenAICompatLLM } from './openai_compat.js';

type ProviderCfg =
    | { type: 'ollama'; model: string; host?: string; options?: Record<string, unknown> }
    | { type: 'openai_compat'; baseUrl?: string; model: string; params?: Record<string, unknown> };

type Cfg = {
    cacheDir?: string;
    rounds?: number;
    providers: ProviderCfg[];
    targets?: { jsDir?: string; pyDir?: string };
};

export async function loadLocalLLM(cfgPath = '.promirror/intent.config.json') {
    const raw = await fs.readFile(cfgPath, 'utf8');
    const cfg = JSON.parse(raw) as Cfg;

    const providers = cfg.providers.map((p) => {
        if (p.type === 'ollama')
            return new OllamaLLM({
                model: p.model,
                host: p.host,
                options: p.options,
            });
        if (p.type === 'openai_compat') return new OpenAICompatLLM(p.baseUrl, p.model, 'sk-local', p.params);
        throw new Error('unknown provider');
    });

    const router = new RouterLLM(providers);
    const llm = new FileCacheLLM(router, cfg.cacheDir ?? '.promirror/cache');
    return { llm, cfg };
}
