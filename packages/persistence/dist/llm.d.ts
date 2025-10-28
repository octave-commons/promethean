/**
 * Type definitions for LLM chat messages
 */
export type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};
export type LLMResponse = {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
};
export type ChatCompletionOptions = {
    baseUrl: string;
    apiKey?: string;
    model: string;
    temperature: number;
    messages: ChatMessage[];
};
/**
 * Creates a safe authorization header that doesn't expose full API keys in logs
 * @param apiKey - Optional API key
 * @returns Safe headers object with truncated API key for logging
 */
export declare function createSafeHeaders(apiKey?: string): Record<string, string>;
export declare function chatCompletion(opts: ChatCompletionOptions): Promise<string>;
//# sourceMappingURL=llm.d.ts.map