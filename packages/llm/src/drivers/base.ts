// SPDX-License-Identifier: GPL-3.0-only
import type { Tool } from '../tools.js';

export interface GenerateArgs {
    prompt: string;
    context?: Array<{ role: string; content: string }>;
    format?: any;
    tools?: Tool[];
}

export interface LLMDriver {
    load(model: string): Promise<void>;
    generate(args: GenerateArgs): Promise<any>;
}
