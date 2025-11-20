import { ollamaJSON } from '@promethean-os/utils';
import { LLMDriver, GenerateArgs } from './base.js';

export const createOllamaDriver = (initialModel = 'gemma3:latest'): LLMDriver => {
    const state = { model: initialModel };

    return {
        async load(model: string): Promise<void> {
            state.model = model;
        },

        async generate({ prompt, context = [], format }: GenerateArgs): Promise<unknown> {
            // Convert context to system prompt if provided
            const systemPrompt =
                context.length > 0
                    ? `${prompt}\n\nContext: ${context.map((c) => `${c.role}: ${c.content}`).join('\n')}`
                    : prompt;

            return ollamaJSON(state.model, systemPrompt, {
                schema: format as object,
                timeout: 120000,
            });
        },
    };
};
