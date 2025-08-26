export interface GenerateArgs {
    prompt: string;
    context?: Array<{ role: string; content: string }>;
    format?: any;
}

export interface LLMDriver {
    load(model: string): Promise<void>;
    generate(args: GenerateArgs): Promise<any>;
}
