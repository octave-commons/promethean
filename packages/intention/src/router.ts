// SPDX-License-Identifier: GPL-3.0-only
import type { LLM } from './llm';

export class RouterLLM implements LLM {
    constructor(private providers: LLM[]) {}

    async generate(io: { system: string; prompt: string }): Promise<string> {
        let lastErr: any;
        for (const p of this.providers) {
            try {
                return await p.generate(io);
            } catch (e) {
                lastErr = e;
            }
        }
        throw lastErr ?? new Error('No providers responded');
    }
}
