import type { LLM } from './llm.js';

export class OpenAICompatLLM implements LLM {
    constructor(
        private baseUrl = 'http://127.0.0.1:1234/v1',
        private model = 'qwen2.5-coder:7b',
        private apiKey = 'sk-local',
        private params: Partial<{
            temperature: number;
            top_p: number;
            max_tokens: number;
            stop: string[];
        }> = {},
    ) {}

    async generate({ system, prompt }: { system: string; prompt: string }) {
        const r = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: `${system}\nReturn ONLY code. No fences.`,
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.1,
                top_p: 0.95,
                max_tokens: 1024,
                stop: ['```', ...(this.params.stop ?? [])],
                ...this.params,
                stream: false,
            }),
        });
        if (!r.ok) throw new Error(`openai-compat ${r.status}: ${await r.text().catch(() => '<no body>')}`);
        const j = (await r.json()) as {
            choices?: { message?: { content?: string } }[];
        };
        const text = j.choices?.[0]?.message?.content ?? '';
        return text.replace(/^```[\w-]*\n?|\n?```$/g, '');
    }
}
