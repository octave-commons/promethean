import type { Tool } from '../tools.js';

export type GenerateArgs = {
    prompt: string;
    context?: Array<{ role: string; content: string }>;
    format?: any;
    tools?: Tool[];
};

export type LLMDriver = {
    load(model: string): Promise<void>;
    generate(args: GenerateArgs): Promise<any>;
};
