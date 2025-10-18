import type { Tool } from '../tools.js';

export type GenerateArgs = {
    prompt: string;
    context?: ReadonlyArray<{ readonly role: string; readonly content: string }>;
    format?: unknown;
    tools?: Tool[];
};

export type LLMDriver = {
    load(model: string): Promise<void>;
    generate(args: GenerateArgs): Promise<unknown>;
};
