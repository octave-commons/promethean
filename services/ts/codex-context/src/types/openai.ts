export type ChatMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool' | 'function';
    content: string;
    name?: string;
};

export type ChatCompletionsRequest = {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
    stop?: string | string[] | null;
};

export type ChatChoice = {
    index: number;
    message: ChatMessage;
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null;
};

export type Usage = {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
};

export type ChatCompletionsResponse = {
    id: string;
    object: 'chat.completion';
    created: number;
    model: string;
    choices: ChatChoice[];
    usage: Usage;
};

export type CompletionsRequest = {
    model: string;
    prompt: string | string[];
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
    stop?: string | string[] | null;
};

export type CompletionsResponse = {
    id: string;
    object: 'text_completion';
    created: number;
    model: string;
    choices: Array<{
        text: string;
        index: number;
        logprobs: null;
        finish_reason: 'stop' | 'length' | 'content_filter' | null;
    }>;
    usage: Usage;
};
