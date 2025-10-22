import ollama from 'ollama';

import { LLMDriver, GenerateArgs } from './base.js';

export const createOllamaDriver = (initialModel = 'gemma3:latest'): LLMDriver => {
    const state = { model: initialModel };

    return {
        async load(model: string): Promise<void> {
            state.model = model;
        },

        async generate({ prompt, context = [], format, tools = [] }: GenerateArgs): Promise<unknown> {
            const res = (await ollama.chat({
                model: state.model,
                messages: [{ role: 'system', content: prompt }, ...context],
                ...(format ? { format: format as string | Record<string, unknown> } : {}),
                tools,
            })) as { message: { content: string } };
            const content = res.message.content;
            return format ? JSON.parse(content) : content;
        },
    };
};
