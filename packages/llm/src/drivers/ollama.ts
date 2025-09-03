// SPDX-License-Identifier: GPL-3.0-only
import ollama from 'ollama';
import { LLMDriver, GenerateArgs } from './base.js';

export class OllamaDriver implements LLMDriver {
    private model = 'gemma3:latest';

    async load(model: string) {
        this.model = model;
    }

    async generate({ prompt, context = [], format, tools = [] }: GenerateArgs) {
        const res = await ollama.chat({
            model: this.model,
            messages: [{ role: 'system', content: prompt }, ...context],
            format,
            tools,
        });
        const content = res.message.content;
        return format ? JSON.parse(content) : content;
    }
}
