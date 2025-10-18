import ollama from 'ollama';

import { LLMDriver, GenerateArgs } from './base.js';

export class OllamaDriver implements LLMDriver {
    private model = 'gemma3:latest';

    async load(model: string): Promise<void> {
        this.model = model;
    }

    async generate({ prompt, context = [], format, tools = [] }: GenerateArgs): Promise<unknown> {
        const res = (await ollama.chat({
            model: this.model,
            messages: [{ role: 'system', content: prompt }, ...context],
            ...(format ? { format: format as string | Record<string, unknown> } : {}),
            tools,
        })) as { message: { content: string } };
        const content = res.message.content;
        return format ? JSON.parse(content) : content;
    }
}
