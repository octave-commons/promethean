import type { LLM } from './llm.js';

export class RouterLLM implements LLM {
    constructor(private providers: LLM[]) {}

    async generate(io: { system: string; prompt: string }): Promise<string> {
        let lastErr: Error | undefined;
        for (const p of this.providers) {
            try {
                return await p.generate(io);
            } catch (e) {
                lastErr = e instanceof Error ? e : new Error(String(e));
            }
        }
        throw lastErr ?? new Error('No providers responded');
    }
}
