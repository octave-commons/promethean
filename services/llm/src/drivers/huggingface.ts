import { HfInference } from '@huggingface/inference';

import { LLMDriver, GenerateArgs } from './base.js';

export const createHuggingFaceDriver = (): LLMDriver => {
    const state = {
        model: '',
        client: null as HfInference | null,
    };

    return {
        async load(modelName: string): Promise<void> {
            state.model = modelName;
            state.client = new HfInference(process.env.HF_API_TOKEN);
        },

        async generate({ prompt, context = [], format }: GenerateArgs): Promise<unknown> {
            const input = [{ role: 'system', content: prompt }, ...context]
                .map((m) => `${m.role}: ${m.content}`)
                .join('\n');
            const res = await state.client!.textGeneration({
                model: state.model,
                inputs: input,
            });
            const text = res.generated_text;
            return format ? JSON.parse(text) : text;
        },
    };
};
