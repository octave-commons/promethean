import type {
  ChatCompletionHandler,
  ChatCompletionJob,
  ChatCompletionMessage,
  ChatCompletionResponse,
} from "./types.js";

const countTokens = (content: string): number => {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(/\s+/u).length;
};

const summariseUserMessages = (
  messages: ReadonlyArray<ChatCompletionMessage>,
): string => {
  const userSegments = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter((segment) => segment.length > 0);

  if (userSegments.length === 0) {
    return "The conversation did not include user-provided content.";
  }

  return userSegments
    .map((segment, index) => `(${index + 1}) ${segment}`)
    .join("\n");
};

const buildAssistantMessage = (job: ChatCompletionJob): string => {
  const summary = summariseUserMessages(job.request.messages);
  return `Echoed response for model ${job.request.model}:\n${summary}`;
};

export const createDefaultChatCompletionHandler = (): ChatCompletionHandler => {
  return async (job) => {
    const assistantMessage = buildAssistantMessage(job);
    const promptTokens = job.request.messages.reduce(
      (total, message) => total + countTokens(message.content),
      0,
    );
    const completionTokens = countTokens(assistantMessage);
    const created = Math.floor(Date.now() / 1000);

    const response: ChatCompletionResponse = {
      id: job.metadata.id,
      object: "chat.completion",
      created,
      model: job.request.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: assistantMessage,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
      },
    };

    return response;
  };
};
