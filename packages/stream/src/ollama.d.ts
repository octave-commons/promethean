declare module 'ollama' {
    export type MessageRole = 'system' | 'user' | 'assistant' | (string & {});

    export type Message = {
        readonly role: MessageRole;
        readonly content: string;
    };

    export type ChatRequest = {
        readonly model: string;
        readonly messages?: ReadonlyArray<Message>;
        readonly stream?: boolean;
    };

    export type ChatResponse = {
        readonly message: {
            readonly content: string;
        };
    };

    export interface OllamaClient {
        chat(request: ChatRequest): Promise<ChatResponse>;
    }

    const client: OllamaClient;

    export default client;
}
