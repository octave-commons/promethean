import ollama from 'ollama';
import type { ChatMessage } from './types/openai.js';

export type BackendConfig = {
    driver: 'ollama';
    model: string;
    host?: string; // reserved for future backends
};

export interface BackendClient {
    chat(messages: ChatMessage[], cfg?: Partial<BackendConfig>): Promise<string>;
}

export class OllamaBackend implements BackendClient {
    constructor(private model: string) {}

    async chat(messages: ChatMessage[]): Promise<string> {
        const res = await ollama.chat({
            model: this.model,
            messages: messages.map((m) => ({ role: m.role as any, content: m.content })),
        });
        return res?.message?.content || '';
    }
}
