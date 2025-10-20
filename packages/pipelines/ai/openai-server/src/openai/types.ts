export type ChatCompletionRole = "system" | "user" | "assistant" | "tool";

export type ChatCompletionMessage = {
  readonly role: ChatCompletionRole;
  readonly content: string;
  readonly name?: string;
};

export type ChatCompletionRequest = {
  readonly model: string;
  readonly messages: ReadonlyArray<ChatCompletionMessage>;
  readonly temperature?: number;
  readonly max_tokens?: number;
  readonly top_p?: number;
  readonly user?: string;
  readonly stream?: boolean;
};

export type ChatCompletionChoice = {
  readonly index: number;
  readonly message: ChatCompletionMessage;
  readonly finish_reason: "stop" | "length";
};

export type ChatCompletionUsage = {
  readonly prompt_tokens: number;
  readonly completion_tokens: number;
  readonly total_tokens: number;
};

export type ChatCompletionResponse = {
  readonly id: string;
  readonly object: "chat.completion";
  readonly created: number;
  readonly model: string;
  readonly choices: ReadonlyArray<ChatCompletionChoice>;
  readonly usage: ChatCompletionUsage;
  readonly system_fingerprint?: string;
};

export type ChatCompletionJob = {
  readonly metadata: {
    readonly id: string;
    readonly enqueuedAt: number;
  };
  readonly request: ChatCompletionRequest;
};

export type ChatCompletionHandler = (
  job: ChatCompletionJob,
) => Promise<ChatCompletionResponse>;
