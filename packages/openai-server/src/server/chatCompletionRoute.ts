import type { FastifyReply, FastifyRequest } from "fastify";

import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "../openai/types.js";
import type { TaskQueue } from "../queue/taskQueue.js";

import type { FastifyApp } from "./fastifyTypes.js";

const chatCompletionMessageSchema = {
  type: "object",
  required: ["role", "content"],
  properties: {
    role: {
      type: "string",
      enum: ["system", "user", "assistant", "tool"],
    },
    content: { type: "string" },
    name: { type: "string" },
  },
  additionalProperties: false,
};

const chatCompletionRequestSchema = {
  type: "object",
  required: ["model", "messages"],
  properties: {
    model: { type: "string" },
    messages: {
      type: "array",
      items: chatCompletionMessageSchema,
      minItems: 1,
    },
    temperature: { type: "number", minimum: 0, maximum: 2 },
    max_tokens: { type: "integer", minimum: 1 },
    top_p: { type: "number", minimum: 0, maximum: 1 },
    user: { type: "string" },
    stream: { type: "boolean" },
  },
  additionalProperties: false,
};

const chatCompletionChoiceSchema = {
  type: "object",
  required: ["index", "message", "finish_reason"],
  properties: {
    index: { type: "integer", minimum: 0 },
    message: chatCompletionMessageSchema,
    finish_reason: { type: "string", enum: ["stop", "length"] },
  },
  additionalProperties: false,
};

const chatCompletionUsageSchema = {
  type: "object",
  required: ["prompt_tokens", "completion_tokens", "total_tokens"],
  properties: {
    prompt_tokens: { type: "integer", minimum: 0 },
    completion_tokens: { type: "integer", minimum: 0 },
    total_tokens: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
};

const chatCompletionResponseSchema = {
  type: "object",
  required: ["id", "object", "created", "model", "choices", "usage"],
  properties: {
    id: { type: "string" },
    object: { type: "string", const: "chat.completion" },
    created: { type: "integer", minimum: 0 },
    model: { type: "string" },
    choices: {
      type: "array",
      items: chatCompletionChoiceSchema,
      minItems: 1,
    },
    usage: chatCompletionUsageSchema,
    system_fingerprint: { type: "string" },
  },
  additionalProperties: false,
};

type ChatQueue = {
  readonly enqueue: TaskQueue<
    ChatCompletionRequest,
    ChatCompletionResponse
  >["enqueue"];
};

export const registerChatCompletionRoute = (
  app: FastifyApp,
  queue: ChatQueue,
): void => {
  type ImmutableChatRequest = Readonly<
    Pick<FastifyRequest<{ Body: ChatCompletionRequest }>, "body">
  >;
  type ImmutableReply = Readonly<Pick<FastifyReply, "header">>;

  app.post<{ Body: ChatCompletionRequest; Reply: ChatCompletionResponse }>(
    "/v1/chat/completions",
    {
      schema: {
        tags: ["Chat Completions"],
        summary: "Queue-backed OpenAI compatible chat completion endpoint",
        body: chatCompletionRequestSchema,
        response: {
          200: chatCompletionResponseSchema,
        },
      },
    },
    async (request: ImmutableChatRequest, reply: ImmutableReply) => {
      const response: ChatCompletionResponse = await queue.enqueue(
        request.body,
      );
      void reply.header("cache-control", "no-store");
      return response;
    },
  );
};
