import type { ToolFactory } from '../core/types.js';
export type UUID = string;
export type JobStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'canceled';
export type JobKind = 'generate' | 'chat' | 'template' | 'pull';
export type OllamaOptions = Readonly<{
    temperature?: number;
    top_p?: number;
    num_ctx?: number;
    num_predict?: number;
    stop?: readonly string[];
}>;
export type Message = Readonly<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
}>;
export type BaseJob = Readonly<{
    id: UUID;
    name?: string;
    kind: JobKind;
    createdAt: number;
    updatedAt: number;
    status: JobStatus;
    deps: readonly UUID[];
    error?: Readonly<{
        message: string;
        code?: string;
    }>;
}>;
export type GenerateJob = BaseJob & Readonly<{
    kind: 'generate';
    modelName: string;
    prompt: string;
    suffix?: string;
    options?: OllamaOptions;
}>;
export type ChatJob = BaseJob & Readonly<{
    kind: 'chat';
    modelName: string;
    conversationId: UUID;
    options?: OllamaOptions;
}>;
export type TemplateJob = BaseJob & Readonly<{
    kind: 'template';
    templateName: string;
    args: readonly unknown[];
}>;
export type PullJob = BaseJob & Readonly<{
    kind: 'pull';
    modelName: string;
}>;
export type Job = GenerateJob | ChatJob | TemplateJob | PullJob;
export type Conversation = Readonly<{
    id: UUID;
    name?: string;
    systemPrompt?: string;
    messages: readonly Message[];
    createdAt: number;
    updatedAt: number;
}>;
export type TemplateDef = Readonly<{
    name: string;
    version: number;
    src: string;
    createdAt: number;
    updatedAt: number;
}>;
export declare const __resetOllamaForTests: () => void;
export declare const ollamaPull: ToolFactory;
export declare const ollamaListModels: ToolFactory;
export declare const ollamaListTemplates: ToolFactory;
export declare const ollamaCreateTemplate: ToolFactory;
export declare const ollamaEnqueueJobFromTemplate: ToolFactory;
export declare const ollamaStartConversation: ToolFactory;
export declare const ollamaEnqueueGenerateJob: ToolFactory;
export declare const ollamaEnqueueChatCompletion: ToolFactory;
export declare const ollamaGetQueue: ToolFactory;
export declare const ollamaRemoveJob: ToolFactory;
//# sourceMappingURL=ollama.d.ts.map