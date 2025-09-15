import { HfInference } from '@huggingface/inference';

import { LLMDriver, GenerateArgs } from './base.js';

export class HuggingFaceDriver implements LLMDriver {
    private model = '';
    private client!: HfInference;

    async load(model: string): Promise<void> {
        this.model = model;
        this.client = new HfInference(process.env.HF_API_TOKEN);
    }

    async generate({ prompt, context = [], format }: GenerateArgs): Promise<unknown> {
        const input = [{ role: 'system', content: prompt }, ...context]
            .map((m) => `${m.role}: ${m.content}`)
            .join('\n');
        const res = await this.client.textGeneration({
            model: this.model,
            inputs: input,
        });
        const text = res.generated_text;
        return format ? JSON.parse(text) : text;
    }
}
